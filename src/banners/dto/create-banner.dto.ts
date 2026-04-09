import { IsNotEmpty, IsOptional, IsString, IsObject, IsBoolean, IsNumber, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { BannerLinkType, BannerType } from '../entities/banner.entity';

class MultilingualStringDto {
  @IsString()
  @IsNotEmpty()
  uz: string;

  @IsString()
  @IsNotEmpty()
  ru: string;
}

export class CreateBannerDto {
  @IsObject()
  @ValidateNested()
  @Type(() => MultilingualStringDto)
  title: MultilingualStringDto;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsEnum(BannerType)
  @IsOptional()
  type?: BannerType;

  @IsEnum(BannerLinkType)
  @IsOptional()
  linkType?: BannerLinkType;

  @IsString()
  @IsOptional()
  linkId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;
}
