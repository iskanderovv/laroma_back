import { Module } from '@nestjs/common';
import { NestjsGrammyModule } from '@kastov/grammy-nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BotService } from './bot.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    NestjsGrammyModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const token = configService.get<string>('TELEGRAM_BOT_TOKEN');
        if (!token) {
          throw new Error('TELEGRAM_BOT_TOKEN is missing');
        }
        return {
          token,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}
