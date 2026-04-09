import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './entities/product.entity';
import { ProductReview, ProductReviewDocument } from './entities/product-review.entity';
import { CategoriesService } from '../categories/categories.service';
import { BrandsService } from '../brands/brands.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(ProductReview.name) private productReviewModel: Model<ProductReviewDocument>,
    private readonly categoriesService: CategoriesService,
    private readonly brandsService: BrandsService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    const { categoryId, brandId, ...data } = createProductDto;

    // Kategoriya mavjudligini tekshiramiz
    await this.categoriesService.findOne(categoryId);

    const productData: any = {
      ...data,
      categoryId: new Types.ObjectId(categoryId),
    };

    if (brandId) {
      await this.brandsService.findOne(brandId);
      productData.brandId = new Types.ObjectId(brandId);
    }

    const created = new this.productModel(productData);
    return created.save();
  }

  private async attachReviewStats<T extends { _id: Types.ObjectId | string }>(products: T[]) {
    if (products.length === 0) {
      return products;
    }

    const productIds = products.map((product) =>
      typeof product._id === 'string' ? new Types.ObjectId(product._id) : product._id,
    );

    const reviewStats = await this.productReviewModel.aggregate<{
      _id: Types.ObjectId;
      rating: number;
      reviewsCount: number;
    }>([
      { $match: { productId: { $in: productIds } } },
      {
        $group: {
          _id: '$productId',
          rating: { $avg: '$rating' },
          reviewsCount: { $sum: 1 },
        },
      },
    ]);

    const reviewStatsMap = new Map(
      reviewStats.map((item) => [
        item._id.toString(),
        {
          rating: Number(item.rating.toFixed(1)),
          reviewsCount: item.reviewsCount,
        },
      ]),
    );

    return products.map((product) => {
      const baseProduct =
        typeof (product as any).toObject === 'function' ? (product as any).toObject() : product;
      const stats = reviewStatsMap.get(product._id.toString());

      return {
        ...baseProduct,
        rating: stats?.rating,
        reviewsCount: stats?.reviewsCount ?? 0,
      };
    });
  }

  async findAll(query: any): Promise<any[]> {
    const filter: any = { isActive: true };
    
    if (query.categoryId) {
      if (!Types.ObjectId.isValid(query.categoryId)) {
        throw new BadRequestException('Invalid categoryId');
      }
      filter.categoryId = new Types.ObjectId(query.categoryId);
    }

    if (query.brandId) {
      if (!Types.ObjectId.isValid(query.brandId)) {
        throw new BadRequestException('Invalid brandId');
      }
      filter.brandId = new Types.ObjectId(query.brandId);
    }

    if (query.isNew) filter.isNew = query.isNew === 'true';
    if (query.isPopular) filter.isPopular = query.isPopular === 'true';
    if (query.search) {
      filter.$or = [
        { 'title.uz': { $regex: query.search, $options: 'i' } },
        { 'title.ru': { $regex: query.search, $options: 'i' } },
      ];
    }

    const products = await this.productModel
      .find(filter)
      .sort({ order: 1, createdAt: -1 })
      .populate('categoryId')
      .populate('brandId')
      .exec();

    return this.attachReviewStats(products);
  }

  async findOne(id: string): Promise<ProductDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel
      .findOne({ _id: id, isActive: true })
      .populate('categoryId')
      .populate('brandId')
      .exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async findReviews(id: string): Promise<ProductReviewDocument[]> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    return this.productReviewModel
      .find({ productId: new Types.ObjectId(id) } as any)
      .sort({ createdAt: -1 })
      .exec();
  }

  async findRelated(id: string, limit = 4): Promise<any[]> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const normalizedLimit = Math.max(1, Math.min(limit, 12));

    const products = await this.productModel
      .find({
        isActive: true,
        _id: { $ne: product._id },
        categoryId: product.categoryId,
      })
      .sort({ isPopular: -1, isNew: -1, order: 1, createdAt: -1 })
      .limit(normalizedLimit)
      .populate('categoryId')
      .populate('brandId')
      .exec();

    return this.attachReviewStats(products);
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductDocument> {
    const { categoryId, brandId, ...data } = updateProductDto;
    const updateData: any = { ...data };

    if (categoryId) {
      if (!Types.ObjectId.isValid(categoryId)) {
        throw new BadRequestException('Invalid categoryId');
      }
      await this.categoriesService.findOne(categoryId);
      updateData.categoryId = new Types.ObjectId(categoryId);
    }

    if (brandId) {
      if (!Types.ObjectId.isValid(brandId)) {
        throw new BadRequestException('Invalid brandId');
      }
      await this.brandsService.findOne(brandId);
      updateData.brandId = new Types.ObjectId(brandId);
    }

    const updated = await this.productModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return updated;
  }

  async findAllAdmin(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ products: any[]; total: number }> {
    const skip = (page - 1) * limit;
    const filter: any = {};

    if (search) {
      filter.$or = [
        { 'title.uz': { $regex: search, $options: 'i' } },
        { 'title.ru': { $regex: search, $options: 'i' } },
        { article: { $regex: search, $options: 'i' } },
      ];
    }

    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('categoryId')
        .populate('brandId')
        .exec(),
      this.productModel.countDocuments(filter),
    ]);

    const productsWithStats = await this.attachReviewStats(products);
    return { products: productsWithStats, total };
  }

  async remove(id: string): Promise<any> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return { success: true, message: 'Product deleted successfully' };
  }
}
