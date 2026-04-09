import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from '../orders/entities/order.entity';
import { User, UserDocument } from '../users/entities/user.entity';
import { Product, ProductDocument } from '../products/entities/product.entity';
import { Category, CategoryDocument } from '../categories/entities/category.entity';
import { Brand, BrandDocument } from '../brands/entities/brand.entity';
import { BotService } from '../bot/bot.service';
import { BroadcastDto } from './dto/broadcast.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Brand.name) private brandModel: Model<BrandDocument>,
    private readonly botService: BotService,
  ) {}

  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      pendingOrders,
      totalUsers,
      totalProducts,
      todayOrders,
      todayRevenue,
    ] = await Promise.all([
      this.orderModel.countDocuments(),
      this.orderModel.countDocuments({ status: OrderStatus.PENDING }),
      this.userModel.countDocuments(),
      this.productModel.countDocuments(),
      this.orderModel.countDocuments({ createdAt: { $gte: today } }),
      this.orderModel.aggregate([
        { $match: { createdAt: { $gte: today }, status: { $ne: OrderStatus.CANCELLED } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
    ]);

    return {
      totalOrders,
      pendingOrders,
      totalUsers,
      totalProducts,
      todayOrders,
      todayRevenue: todayRevenue[0]?.total || 0,
    };
  }

  async getTopProducts(limit: number = 5) {
    const safeLimit = Math.max(1, Number(limit) || 5);
    return this.orderModel.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          title: { $first: '$items.title' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: safeLimit },
    ]);
  }

  async getRecentOrders(limit: number = 10) {
    return this.orderModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'firstName phone')
      .exec();
  }

  async getDashboardAnalytics() {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Sales over last 30 days
    const salesRaw = await this.orderModel.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo, $lte: today }, status: { $ne: 'cancelled' } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$totalPrice" }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Fill missing days
    const salesData: { date: string; revenue: number; orders: number }[] = [];
    const currentDate = new Date(thirtyDaysAgo);
    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const found = salesRaw.find(s => s._id === dateStr);
      salesData.push({
        date: dateStr,
        revenue: found ? found.revenue : 0,
        orders: found ? found.orders : 0
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Category distribution (Products count per category)
    const categoryDataRaw = await this.productModel.aggregate([
      { $group: { _id: "$categoryId", count: { $sum: 1 } } },
      { 
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryDetails"
        }
      },
      { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } }
    ]);
    
    const categoryData = categoryDataRaw.map(c => ({
      name: c.categoryDetails?.title?.uz || 'Nomsiz',
      value: c.count
    }));

    // Recent Categories
    const recentCategories = await this.categoryModel.find().sort({ createdAt: -1 }).limit(5).exec();

    // Recent Brands
    const recentBrands = await this.brandModel.find().sort({ createdAt: -1 }).limit(5).exec();

    return {
      salesData,
      categoryData,
      recentCategories,
      recentBrands
    };
  }

  async broadcastMessage(dto: BroadcastDto) {
    const users = await this.userModel.find({ telegramId: { $ne: null } }).select('telegramId').exec();
    const telegramIds = users
      .map(u => u.telegramId)
      .filter(id => id !== undefined && id !== null) as number[];
      
    // Broadcast is done in background to avoid blocking the request
    this.botService.broadcast(telegramIds, dto.message, dto.images, dto.buttons)
      .then(successCount => {
        console.log(`Broadcast completed. Sent: ${successCount}/${telegramIds.length}`);
      })
      .catch(error => {
        console.error('Broadcast error:', error);
      });

    return { 
      success: true, 
      message: 'Broadcast started',
      targetCount: telegramIds.length 
    };
  }
}
