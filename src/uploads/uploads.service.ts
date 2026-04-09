import { Injectable, BadRequestException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadsService {
  private readonly uploadPath = 'uploads';

  constructor() {
    // Papka borligini tekshiramiz va yaratamiz
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|gif)$/)) {
      throw new BadRequestException('Faqat rasm yuklash mumkin (jpg, jpeg, png, webp, gif)');
    }

    // 5MB limit (multer o'zi ham tekshirsa bo'ladi, lekin biz ishonch uchun bu yerda ham qo'yamiz)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new BadRequestException('Rasm hajmi 5MBdan oshmasligi kerak');
    }

    const fileName = `${uuidv4()}.webp`;
    const filePath = path.join(this.uploadPath, fileName);

    try {
      // Rasmni Sharp orqali WebP formatiga o'tkazish
      await sharp(file.buffer)
        .webp({ quality: 80 }) // Sifatni biroz pasaytirib, hajmni tejaymiz
        .toFile(filePath);

      // Statik URL qaytaramiz (aslida buni config'dan olish kerak)
      return `/uploads/${fileName}`;
    } catch (error) {
      throw new BadRequestException('Rasmni qayta ishlashda xatolik yuz berdi: ' + error.message);
    }
  }

  async deleteImage(filePath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
}
