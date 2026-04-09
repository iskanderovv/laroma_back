import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, CategoryDocument } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryDocument> {
    const { parentId, ...data } = createCategoryDto;
    
    const categoryData: any = { ...data };
    
    if (parentId) {
      if (!Types.ObjectId.isValid(parentId)) {
        throw new BadRequestException('Invalid parentId');
      }
      const parent = await this.categoryModel.findById(parentId);
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
      categoryData.parentId = new Types.ObjectId(parentId);
    }

    const created = new this.categoryModel(categoryData);
    return created.save();
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ categories: CategoryDocument[]; total: number }> {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (search) {
      query.$or = [
        { 'title.uz': { $regex: search, $options: 'i' } },
        { 'title.ru': { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    const [categories, total] = await Promise.all([
      this.categoryModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ order: 1 })
        .populate('parentId')
        .exec(),
      this.categoryModel.countDocuments(query),
    ]);

    return { categories, total };
  }

  async getTree(): Promise<CategoryDocument[]> {
    // Faqat asosiy (root) kategoriyalarni olamiz va ularning bolalarini populate qilamiz
    return this.categoryModel
      .find({ parentId: null })
      .sort({ order: 1 })
      .populate({
        path: 'children',
        populate: { path: 'children' }, // 3-darajali tree uchun (agar kerak bo'lsa)
      })
      .exec();
  }

  async findOne(id: string): Promise<CategoryDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category ID');
    }
    
    const category = await this.categoryModel.findById(id).populate('children').exec();

    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryDocument> {
    const { parentId, ...data } = updateCategoryDto;
    const categoryData: any = { ...data };

    if (parentId) {
      if (!Types.ObjectId.isValid(parentId)) {
        throw new BadRequestException('Invalid parentId');
      }
      if (parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }
      categoryData.parentId = new Types.ObjectId(parentId);
    }

    const updated = await this.categoryModel
      .findByIdAndUpdate(id, categoryData, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<any> {
    // Bolalar borligini tekshiramiz
    const hasChildren = await this.categoryModel.findOne({ parentId: id as any }).exec();
    if (hasChildren) {
      throw new BadRequestException('Cannot delete category that has subcategories');
    }

    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return { success: true, message: 'Category deleted successfully' };
  }
}
