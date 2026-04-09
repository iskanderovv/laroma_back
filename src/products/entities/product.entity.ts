import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
class MultilingualString {
  @Prop({ required: true })
  uz: string;

  @Prop({ required: true })
  ru: string;
}

@Schema({ _id: false })
export class ProductVolumeOption {
  @Prop({ required: true })
  volume: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  oldPrice?: number;

  @Prop({ default: 0 })
  stock?: number;
}

@Schema({ _id: false })
export class ProductScentOption {
  @Prop({ required: true })
  code: string;

  @Prop({ required: true, type: MultilingualString })
  label: MultilingualString;
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, type: MultilingualString })
  title: MultilingualString;

  @Prop({ type: MultilingualString })
  description?: MultilingualString;

  @Prop({ required: true })
  price: number;

  @Prop()
  oldPrice?: number;

  @Prop()
  thumbnail?: string; // Asosiy rasm (list uchun)

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category', required: true })
  categoryId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Brand', required: false })
  brandId?: MongooseSchema.Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isNew: boolean;

  @Prop({ default: false })
  isPopular: boolean;

  @Prop({ default: 0 })
  order: number;

  @Prop({ default: 0 })
  stock: number;

  @Prop()
  volume?: string; // Masalan: "100 ml", "50 ml"

  @Prop({ type: [ProductVolumeOption], default: [] })
  volumeOptions: ProductVolumeOption[];

  @Prop({ type: [ProductScentOption], default: [] })
  scents: ProductScentOption[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
