import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsObject,
  IsBoolean,
  IsNumber,
  ValidateNested,
  IsArray,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class MultilingualStringDto {
  @IsString()
  @IsNotEmpty()
  uz: string;

  @IsString()
  @IsNotEmpty()
  ru: string;
}

class ProductScentOptionDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsObject()
  @ValidateNested()
  @Type(() => MultilingualStringDto)
  label: MultilingualStringDto;
}

class ProductVolumeOptionDto {
  @IsString()
  @IsNotEmpty()
  volume: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  oldPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  stock?: number;
}

export class CreateProductDto {
  @IsObject()
  @ValidateNested()
  @Type(() => MultilingualStringDto)
  title: MultilingualStringDto;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => MultilingualStringDto)
  description?: MultilingualStringDto;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsOptional()
  oldPrice?: number;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsOptional()
  brandId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isNew?: boolean;

  @IsBoolean()
  @IsOptional()
  isPopular?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsString()
  @IsOptional()
  volume?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVolumeOptionDto)
  @IsOptional()
  volumeOptions?: ProductVolumeOptionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductScentOptionDto)
  @IsOptional()
  scents?: ProductScentOptionDto[];
}
