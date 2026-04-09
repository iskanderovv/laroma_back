import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema()
class MultilingualString {
  @Prop({ required: true })
  uz: string;

  @Prop({ required: true })
  ru: string;
}

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Category {
  @Prop({ required: true, type: MultilingualString })
  title: MultilingualString;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category', default: null })
  parentId: MongooseSchema.Types.ObjectId | null;

  @Prop()
  icon?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  order: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Virtual for children categories
CategorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentId',
});
