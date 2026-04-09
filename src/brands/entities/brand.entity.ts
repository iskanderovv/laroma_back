import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BrandDocument = Brand & Document;

@Schema()
class MultilingualString {
  @Prop({ required: true })
  uz: string;

  @Prop({ required: true })
  ru: string;
}

@Schema({ timestamps: true })
export class Brand {
  @Prop({ required: true, type: MultilingualString })
  title: MultilingualString;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  order: number;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);
