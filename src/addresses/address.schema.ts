import { Schema, Document, Types } from 'mongoose';

export interface Address extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  address: string;
  phone: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const AddressSchema = new Schema(
  {
    userId: {
      type: Schema.Types.Mixed, // String yoki ObjectId qabul qilish uchun
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      match: /^\+998[0-9]{9}$/,
    },
    latitude: {
      type: Number,
      required: false,
    },
    longitude: {
      type: Number,
      required: false,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Only one default address per user
AddressSchema.pre('save', async function () {
  if (this.isDefault) {
    await this.model('Address').updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
});