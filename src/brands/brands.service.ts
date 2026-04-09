import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Brand, BrandDocument } from './entities/brand.entity';

@Injectable()
export class BrandsService {
  constructor(
    @InjectModel(Brand.name) private brandModel: Model<BrandDocument>,
  ) {}

  async create(createBrandDto: CreateBrandDto): Promise<BrandDocument> {
    const created = new this.brandModel(createBrandDto);
    return created.save();
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ brands: BrandDocument[]; total: number }> {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (search) {
      query.$or = [
        { 'title.uz': { $regex: search, $options: 'i' } },
        { 'title.ru': { $regex: search, $options: 'i' } },
      ];
    }

    const [brands, total] = await Promise.all([
      this.brandModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ order: 1, createdAt: -1 })
        .exec(),
      this.brandModel.countDocuments(query),
    ]);

    return { brands, total };
  }

  async findOne(id: string): Promise<BrandDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid brand ID');
    }
    const brand = await this.brandModel.findById(id).exec();
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }
    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto): Promise<BrandDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid brand ID');
    }
    const updated = await this.brandModel
      .findByIdAndUpdate(id, updateBrandDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid brand ID');
    }

    // Kelajakda mahsulotlar bog'langanligini tekshirishni shu yerga qo'shish mumkin
    
    const result = await this.brandModel.findByIdAndDelete(id).exec();
    
    if (!result) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }
    
    return { success: true, message: 'Brand deleted successfully' };
  }
}
