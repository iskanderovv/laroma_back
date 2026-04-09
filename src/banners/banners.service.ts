import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { Banner, BannerDocument, BannerType } from './entities/banner.entity';

@Injectable()
export class BannersService {
  constructor(
    @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>,
  ) {}

  async create(createBannerDto: CreateBannerDto): Promise<BannerDocument> {
    const created = new this.bannerModel(createBannerDto);
    return created.save();
  }

  async findAll(
    page?: number,
    limit?: number,
    type?: string,
    isAdmin: boolean = false,
  ): Promise<any> {
    const filter: any = {};
    if (!isAdmin) {
      filter.isActive = true;
    }

    if (type && Object.values(BannerType).includes(type as BannerType)) {
      filter.type = type;
    }

    if (page && limit) {
      const skip = (page - 1) * limit;
      const [banners, total] = await Promise.all([
        this.bannerModel
          .find(filter)
          .skip(skip)
          .limit(limit)
          .sort({ order: 1, createdAt: -1 })
          .exec(),
        this.bannerModel.countDocuments(filter),
      ]);
      return { banners, total };
    }

    return this.bannerModel.find(filter).sort({ order: 1, createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<BannerDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid banner ID');
    }
    const banner = await this.bannerModel.findById(id).exec();
    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }
    return banner;
  }

  async update(id: string, updateBannerDto: UpdateBannerDto): Promise<BannerDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid banner ID');
    }
    const updated = await this.bannerModel
      .findByIdAndUpdate(id, updateBannerDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid banner ID');
    }
    const result = await this.bannerModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }
    return { success: true, message: 'Banner deleted successfully' };
  }
}
