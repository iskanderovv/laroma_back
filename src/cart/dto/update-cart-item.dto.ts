import { IsInt, IsMongoId, IsOptional, IsString, Min } from 'class-validator';

export class UpdateCartItemDto {
  @IsMongoId()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  @IsOptional()
  selectedVolume?: string;

  @IsString()
  @IsOptional()
  selectedScentCode?: string;
}
