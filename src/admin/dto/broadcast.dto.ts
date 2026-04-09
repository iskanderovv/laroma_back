import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class InlineButtonDto {
  @IsString()
  text: string;

  @IsString()
  url: string;
}

export class BroadcastDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InlineButtonDto)
  buttons?: InlineButtonDto[];
}
