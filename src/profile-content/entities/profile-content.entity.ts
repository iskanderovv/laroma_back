import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProfileContentDocument = ProfileContent & Document;

@Schema({ _id: false })
export class MultilingualString {
  @Prop({ required: true })
  uz: string;

  @Prop({ required: true })
  ru: string;
}

@Schema({ _id: false })
export class ContentSection {
  @Prop({ required: true, type: MultilingualString })
  title: MultilingualString;

  @Prop({ required: true, type: MultilingualString })
  description: MultilingualString;
}

@Schema({ _id: false })
export class SocialLink {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  value: string;

  @Prop({ required: true })
  url: string;
}

export enum ProfileContentKey {
  SUPPORT = 'support',
  DELIVERY = 'delivery',
  ABOUT = 'about',
}

@Schema({ timestamps: true })
export class ProfileContent {
  @Prop({ required: true, enum: ProfileContentKey, unique: true })
  key: ProfileContentKey;

  @Prop({ required: true, type: MultilingualString })
  title: MultilingualString;

  @Prop({ required: true, type: MultilingualString })
  description: MultilingualString;

  @Prop()
  phone?: string;

  @Prop({ type: [SocialLink], default: [] })
  socialLinks: SocialLink[];

  @Prop({ type: [ContentSection], default: [] })
  sections: ContentSection[];
}

export const ProfileContentSchema = SchemaFactory.createForClass(ProfileContent);
