import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ProfileContent,
  ProfileContentDocument,
  ProfileContentKey,
} from './entities/profile-content.entity';
import { UpdateProfileContentDto } from './dto/update-profile-content.dto';

@Injectable()
export class ProfileContentService {
  constructor(
    @InjectModel(ProfileContent.name)
    private readonly profileContentModel: Model<ProfileContentDocument>,
  ) {}

  async findByKey(key: string): Promise<ProfileContentDocument> {
    if (!Object.values(ProfileContentKey).includes(key as ProfileContentKey)) {
      throw new BadRequestException('Invalid content key');
    }

    let content = await this.profileContentModel.findOne({ key }).exec();
    
    // If not found, create a default one to avoid 404 and allow immediate editing
    if (!content) {
      content = await this.profileContentModel.create({
        key,
        title: { uz: 'Sarlavha', ru: 'Заголовок' },
        description: { uz: 'Tavsif', ru: 'Описание' },
        sections: [],
        socialLinks: []
      });
    }

    return content;
  }

  async update(key: string, updateDto: UpdateProfileContentDto): Promise<ProfileContentDocument> {
    if (!Object.values(ProfileContentKey).includes(key as ProfileContentKey)) {
      throw new BadRequestException('Invalid content key');
    }

    const updated = await this.profileContentModel.findOneAndUpdate(
      { key },
      { $set: updateDto },
      { new: true, runValidators: true }
    ).exec();

    if (!updated) {
      // Create if it doesn't exist during update
      const newContent = await this.profileContentModel.create({
        key,
        title: updateDto.title || { uz: 'Sarlavha', ru: 'Заголовок' },
        description: updateDto.description || { uz: 'Tavsif', ru: 'Описание' },
        phone: updateDto.phone,
        sections: updateDto.sections || [],
        socialLinks: updateDto.socialLinks || []
      });
      return newContent;
    }

    return updated;
  }
}
