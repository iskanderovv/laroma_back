import { Injectable, NotFoundException, BadRequestException, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Order,
  OrderDocument,
  OrderStatus,
  PaymentMethod,
  PaymentReviewStatus,
} from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { CartService } from '../cart/cart.service';
import { BotService } from '../bot/bot.service';
import { resolveProductSelection } from '../products/product-selection.util';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly cartService: CartService,
    @Optional() private readonly botService?: BotService,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<OrderDocument> {
    const cart = await this.cartService.getCart(userId);
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Savatcha boʻsh, buyurtma berib boʻlmaydi');
    }

    if (
      createOrderDto.paymentMethod &&
      createOrderDto.paymentMethod !== PaymentMethod.CASH &&
      !createOrderDto.paymentReceiptUrl
    ) {
      throw new BadRequestException('Toʻlov cheki yuklanishi shart');
    }

    // Buyurtma raqamini yaratamiz (oddiy variant: vaqt+random)
    const orderNumber = `#${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;

    // Savatchadagi mahsulotlarni snapshot qilamiz va umumiy summani hisoblaymiz
    let totalPrice = 0;
    const orderItems = cart.items.map((item: any) => {
      const product = item.productId;
      if (!product) throw new BadRequestException('Mahsulot topilmadi');

      const resolvedSelection = resolveProductSelection(product, {
        selectedVolume: item.selectedVolume,
        selectedScentCode: item.selectedScentCode,
      });

      if (resolvedSelection.stock < item.quantity) {
        throw new BadRequestException('Savatchadagi mahsulot soni ombordagi qoldiqdan oshib ketgan');
      }

      const itemPrice = resolvedSelection.price;
      const itemTotal = itemPrice * item.quantity;
      totalPrice += itemTotal;

      return {
        productId: product._id,
        title: product.title,
        selectedVolume: resolvedSelection.selectedVolume,
        selectedScentCode: resolvedSelection.selectedScentCode,
        selectedScentLabel: resolvedSelection.selectedScentLabel,
        price: itemPrice,
        oldPrice: resolvedSelection.oldPrice,
        quantity: item.quantity,
      };
    });

    const newOrder = new this.orderModel({
      ...createOrderDto,
      orderNumber,
      userId: new Types.ObjectId(userId),
      items: orderItems,
      totalPrice,
      status: OrderStatus.PENDING,
      paymentReviewStatus:
        createOrderDto.paymentMethod && createOrderDto.paymentMethod !== PaymentMethod.CASH
          ? PaymentReviewStatus.SUBMITTED
          : PaymentReviewStatus.APPROVED,
      paymentSubmittedAt:
        createOrderDto.paymentMethod && createOrderDto.paymentMethod !== PaymentMethod.CASH
          ? new Date()
          : undefined,
      paymentVerifiedAt:
        createOrderDto.paymentMethod === PaymentMethod.CASH ? new Date() : undefined,
    });

    const savedOrder = await newOrder.save();

    // Buyurtma muvaffaqiyatli bo'lgandan keyin savatchani tozalaymiz
    await this.cartService.clearCart(userId);

    // Admin'ga xabar yuboramiz
    this.notifyAdmin(savedOrder);

    return savedOrder;
  }

  private async notifyAdmin(order: OrderDocument) {
    if (!this.botService) {
      return;
    }

    const itemsList = order.items
      .map(
        (item) =>
          `• ${item.title.uz}${item.selectedVolume ? ` (${item.selectedVolume})` : ''}${item.selectedScentLabel?.uz ? ` • ${item.selectedScentLabel.uz}` : ''} x ${item.quantity} = ${item.price * item.quantity} soʻm`,
      )
      .join('\n');

    const message = `
<b>🛍 YANGI BUYURTMA: ${order.orderNumber}</b>

<b>👤 Mijoz:</b> ${order.deliveryDetails.firstName} ${order.deliveryDetails.lastName || ''}
<b>📞 Tel:</b> <code>${order.deliveryDetails.phone}</code>
<b>📍 Manzil:</b> ${order.deliveryDetails.address}
${order.deliveryDetails.location ? `<b>🔗 Lokatsiya:</b> ${order.deliveryDetails.location}` : ''}

<b>📋 Mahsulotlar:</b>
${itemsList}

<b>💰 Jami:</b> ${order.totalPrice} soʻm
<b>💳 Toʻlov:</b> ${order.paymentMethod.toUpperCase()}
${order.paymentReceiptUrl ? `<b>🧾 Chek:</b> ${order.paymentReceiptUrl}` : ''}

${order.notes ? `<b>📝 Izoh:</b> ${order.notes}` : ''}
    `;

    await this.botService.sendAdminNotification(message);
  }

  async findMyOrders(userId: string): Promise<OrderDocument[]> {
    return this.orderModel.find({ userId: userId as any }).sort({ createdAt: -1 }).exec();
  }

  async findAll(): Promise<OrderDocument[]> {
    return this.orderModel.find().populate('userId').sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<OrderDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid order ID');
    }
    const order = await this.orderModel.findById(id).populate('userId').exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<OrderDocument> {
    const updatePayload: Partial<Order> & Record<string, unknown> = { status };

    if ([OrderStatus.CONFIRMED, OrderStatus.SHIPPING, OrderStatus.DELIVERED].includes(status)) {
      updatePayload.paymentReviewStatus = PaymentReviewStatus.APPROVED;
      updatePayload.paymentVerifiedAt = new Date();
      updatePayload.paymentRejectedAt = undefined;
    }

    if (status === OrderStatus.CANCELLED) {
      updatePayload.paymentReviewStatus = PaymentReviewStatus.REJECTED;
      updatePayload.paymentRejectedAt = new Date();
    }

    const order = await this.orderModel.findByIdAndUpdate(id, updatePayload, { new: true }).exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }
}
