import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Delete,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('payment-receipt')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadPaymentReceipt(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Fayl yuborilmadi');
    }

    const url = await this.uploadsService.uploadImage(file);
    return { url };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Fayl yuborilmadi');
    }
    const url = await this.uploadsService.uploadImage(file);
    return { url };
  }

  @Delete()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteFile(@Body('path') path: string) {
    if (!path) {
      throw new BadRequestException('Fayl yoʻli koʻrsatilmadi');
    }
    await this.uploadsService.deleteImage(path);
    return { success: true };
  }
}
