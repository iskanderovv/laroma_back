import { IsNotEmpty, IsOptional, IsString, IsObject, IsBoolean, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class MultilingualStringDto {
  @IsString()
  @IsNotEmpty()
  uz: string;

  @IsString()
  @IsNotEmpty()
  ru: string;
}

export class CreateBrandDto {
  @IsObject()
  @ValidateNested()
  @Type(() => MultilingualStringDto)
  title: MultilingualStringDto;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;
}
