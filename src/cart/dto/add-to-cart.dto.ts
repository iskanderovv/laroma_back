import { IsInt, IsMongoId, IsOptional, IsString, Min } from 'class-validator';

export class AddToCartDto {
  @IsMongoId()
  productId: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  selectedVolume?: string;

  @IsString()
  @IsOptional()
  selectedScentCode?: string;
}
