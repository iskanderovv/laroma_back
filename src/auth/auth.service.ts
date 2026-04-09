import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { AdminLoginDto } from './dto/admin-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  private getAdminCredentials() {
    return {
      email: this.configService.get<string>('ADMIN_EMAIL') || 'laroma@gmail.com',
      password: this.configService.get<string>('ADMIN_PASSWORD') || 'laroma26',
      name: this.configService.get<string>('ADMIN_NAME') || 'Laroma Admin',
    };
  }

  private hashSecret(value: string) {
    return crypto.createHash('sha256').update(value).digest('hex');
  }

  private matchesSecret(input: string, expectedHash: string) {
    const inputHash = Buffer.from(this.hashSecret(input), 'hex');
    const expected = Buffer.from(expectedHash, 'hex');

    if (inputHash.length !== expected.length) {
      return false;
    }

    return crypto.timingSafeEqual(inputHash, expected);
  }

  private buildAdminResponse(admin: {
    id?: string;
    email: string;
    role: string;
    firstName: string;
  }) {
    const payload = {
      sub: admin.id || 'admin',
      role: admin.role,
      email: admin.email,
      name: admin.firstName,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: admin.id || 'admin',
        email: admin.email,
        role: admin.role,
        firstName: admin.firstName,
      },
    };
  }

  private fallbackAdminResponse() {
    const adminCredentials = this.getAdminCredentials();

    return this.buildAdminResponse({
      id: 'admin',
      email: adminCredentials.email,
      role: 'admin',
      firstName: adminCredentials.name,
    });
  }

  async validateTelegramData(initData: string) {
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN is not defined');
    }

    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      throw new UnauthorizedException('Invalid Telegram data');
    }

    const userString = urlParams.get('user');
    if (!userString) {
      throw new UnauthorizedException('User data missing in Telegram initData');
    }

    const telegramUser = JSON.parse(userString);
    let user = await this.usersService.findByTelegramId(telegramUser.id);

    if (!user) {
      // Agar user topilmasa (masalan, botga start bermay to'g'ridan-to'g'ri Mini Appga kirgan bo'lsa),
      // biz uni yaratolmaymiz, chunki telefon raqami yo'q (Telegram initData'da telefon raqami bo'lmaydi).
      // Shuning uchun bu holatda botga yo'naltirish kerak yoki faqat bot orqali kirganlarga ruxsat berish kerak.
      throw new UnauthorizedException('User not registered. Please start the bot first.');
    }

    const payload = { 
        sub: user['_id'], 
        telegramId: user.telegramId, 
        role: user.role 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async loginAdmin(adminLoginDto: AdminLoginDto) {
    const email = adminLoginDto.email.trim().toLowerCase();
    const admin = await this.usersService.findByEmail(email);

    if (admin?.role === 'admin' && admin.passwordHash) {
      const isPasswordValid = this.matchesSecret(
        adminLoginDto.password,
        admin.passwordHash,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException("Email yoki parol noto'g'ri");
      }

      return this.buildAdminResponse({
        id: String(admin._id),
        email: admin.email || email,
        role: admin.role,
        firstName: admin.firstName || 'Laroma Admin',
      });
    }

    const adminCredentials = this.getAdminCredentials();
    const isFallbackAdmin =
      email === adminCredentials.email.toLowerCase() &&
      adminLoginDto.password === adminCredentials.password;

    if (!isFallbackAdmin) {
      throw new UnauthorizedException("Email yoki parol noto'g'ri");
    }

    return this.fallbackAdminResponse();
  }

  getAdminProfile(user: { email?: string; role: string; name?: string }) {
    const adminCredentials = this.getAdminCredentials();

    return {
      id: 'admin',
      email: user.email || adminCredentials.email,
      role: user.role,
      firstName: user.name || adminCredentials.name,
    };
  }
}
