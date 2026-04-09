import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsObject,
  IsEnum,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../entities/order.entity';

class DeliveryDetailsDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  location?: string;
}

export class CreateOrderDto {
  @IsObject()
  @ValidateNested()
  @Type(() => DeliveryDetailsDto)
  deliveryDetails: DeliveryDetailsDto;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ValidateIf((value) => value.paymentMethod && value.paymentMethod !== PaymentMethod.CASH)
  @IsString()
  @IsNotEmpty()
  paymentReceiptUrl?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
