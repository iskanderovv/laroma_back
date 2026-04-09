import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BannerDocument = Banner & Document;

@Schema()
class MultilingualString {
  @Prop({ required: true })
  uz: string;

  @Prop({ required: true })
  ru: string;
}

export enum BannerLinkType {
  PRODUCT = 'product',
  CATEGORY = 'category',
  NONE = 'none',
}

export enum BannerType {
  HERO = 'hero',
  MIDDLE = 'middle',
}

@Schema({ timestamps: true })
export class Banner {
  @Prop({ required: true, type: MultilingualString })
  title: MultilingualString;

  @Prop({ required: true })
  image: string; // Uploader qaytargan URL (/uploads/abc.webp)

  @Prop({ enum: BannerType, default: BannerType.HERO })
  type: BannerType;

  @Prop({ enum: BannerLinkType, default: BannerLinkType.NONE })
  linkType: BannerLinkType;

  @Prop()
  linkId?: string; // Mahsulot yoki Kategoriya IDsi

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  order: number;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
