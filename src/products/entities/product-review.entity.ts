import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ProductReviewDocument = ProductReview & Document;

@Schema({ timestamps: true, versionKey: false })
export class ProductReview {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true, index: true })
  productId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  userName: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true, trim: true, maxlength: 500 })
  comment: string;

  @Prop({ default: false })
  isVerifiedPurchase: boolean;
}

export const ProductReviewSchema = SchemaFactory.createForClass(ProductReview);
