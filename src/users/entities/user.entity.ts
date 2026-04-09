import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true, sparse: true })
  telegramId?: number;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({ unique: true, sparse: true, lowercase: true, trim: true })
  email?: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName?: string;

  @Prop()
  username?: string;

  @Prop({ default: 'uz' })
  languageCode: string;

  @Prop({ default: 'user' })
  role: string;

  @Prop()
  passwordHash?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
