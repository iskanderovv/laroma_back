import { IsOptional, IsString, IsArray, ValidateNested, IsObject, IsEnum, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class MultilingualStringDto {
  @IsString()
  @IsOptional()
  uz?: string;

  @IsString()
  @IsOptional()
  ru?: string;
}

class ContentSectionDto {
  @IsObject()
  @ValidateNested()
  @Type(() => MultilingualStringDto)
  title: MultilingualStringDto;

  @IsObject()
  @ValidateNested()
  @Type(() => MultilingualStringDto)
  description: MultilingualStringDto;
}

class SocialLinkDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsString()
  @IsNotEmpty()
  url: string;
}

export class UpdateProfileContentDto {
  @IsObject()
  @ValidateNested()
  @Type(() => MultilingualStringDto)
  @IsOptional()
  title?: MultilingualStringDto;

  @IsObject()
  @ValidateNested()
  @Type(() => MultilingualStringDto)
  @IsOptional()
  description?: MultilingualStringDto;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialLinkDto)
  @IsOptional()
  socialLinks?: SocialLinkDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentSectionDto)
  @IsOptional()
  sections?: ContentSectionDto[];
}
