import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, Matches } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+998[0-9]{9}$/, { message: 'Invalid phone number format. Use +998XXXXXXXXX' })
  phone: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  address?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+998[0-9]{9}$/, { message: 'Invalid phone number format. Use +998XXXXXXXXX' })
  phone?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class SetDefaultAddressDto {
  @IsString()
  @IsNotEmpty()
  addressId: string;
}