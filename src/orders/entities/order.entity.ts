import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPING = 'shipping',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  CLICK = 'click',
  PAYME = 'payme',
}

export enum PaymentReviewStatus {
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Schema()
class MultilingualString {
  @Prop({ required: true })
  uz: string;

  @Prop({ required: true })
  ru: string;
}

@Schema()
class OrderItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  productId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MultilingualString, required: true })
  title: MultilingualString; // Snapshot: buyurtma paytidagi nomi

  @Prop()
  selectedVolume?: string;

  @Prop()
  selectedScentCode?: string;

  @Prop({ type: MultilingualString })
  selectedScentLabel?: MultilingualString;

  @Prop({ required: true })
  price: number; // Snapshot: buyurtma paytidagi narxi

  @Prop()
  oldPrice?: number;

  @Prop({ default: 1 })
  quantity: number;
}

@Schema()
class DeliveryDetails {
  @Prop({ required: true })
  firstName: string;

  @Prop()
  lastName?: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  address: string;

  @Prop()
  location?: string; // Masalan: "41.1234, 69.1234"
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true })
  orderNumber: string; // Masalan: #1001

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @Prop({ required: true })
  totalPrice: number;

  @Prop({ enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop({ type: DeliveryDetails, required: true })
  deliveryDetails: DeliveryDetails;

  @Prop({ enum: PaymentMethod, default: PaymentMethod.CASH })
  paymentMethod: PaymentMethod;

  @Prop()
  paymentReceiptUrl?: string;

  @Prop({ enum: PaymentReviewStatus, default: PaymentReviewStatus.SUBMITTED })
  paymentReviewStatus: PaymentReviewStatus;

  @Prop()
  paymentSubmittedAt?: Date;

  @Prop()
  paymentVerifiedAt?: Date;

  @Prop()
  paymentRejectedAt?: Date;

  @Prop()
  notes?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
