import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Update, Ctx, Start, On, InjectBot } from '@kastov/grammy-nestjs';
import { Bot, Context, Keyboard, InputFile } from 'grammy';
import { UsersService } from '../users/users.service';
import { translations, LanguageCode } from './bot.translations';
import * as path from 'path';

@Update()
@Injectable()
export class BotService {
  constructor(
    @InjectBot() private readonly bot: Bot,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async sendAdminNotification(message: string) {
    const adminGroupId = this.configService.get<string>('ADMIN_GROUP_ID');
    if (!adminGroupId) return;

    try {
      await this.bot.api.sendMessage(adminGroupId, message, { parse_mode: 'HTML' });
    } catch (error) {
      console.error('Failed to send admin notification:', error);
    }
  }

  private getMiniAppUrl(lang: LanguageCode = 'uz'): string {
    const baseUrl = this.configService.get<string>('MINI_APP_URL');
    if (!baseUrl) {
      throw new InternalServerErrorException('MINI_APP_URL is missing in environment variables');
    }
    // Remove trailing slash if exists and add locale prefix
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBaseUrl}/${lang}`;
  }

  private getLanguage(ctxLanguage?: string): LanguageCode {
    return ctxLanguage === 'ru' ? 'ru' : 'uz';
  }

  @Start()
  async onStart(@Ctx() ctx: Context) {
    if (!ctx.from) return;

    const telegramId = ctx.from.id;
    const user = await this.usersService.findByTelegramId(telegramId);

    if (user) {
      const lang: LanguageCode = (user.languageCode as LanguageCode) || 'uz';
      return ctx.reply(translations[lang].already_registered, {
        reply_markup: {
          inline_keyboard: [
            [{ text: translations[lang].open_app, web_app: { url: this.getMiniAppUrl(lang) } }],
          ],
        },
      });
    }

    const keyboard = new Keyboard()
      .requestContact(translations.common.request_contact)
      .resized();

    await ctx.reply(translations.common.welcome, {
      reply_markup: keyboard,
    });
  }

  @On('message:contact')
  async onContact(@Ctx() ctx: Context) {
    if (!ctx.from || !ctx.message?.contact) return;

    const contact = ctx.message.contact;
    const telegramId = ctx.from.id;
    const langCode = this.getLanguage(ctx.from.language_code);

    let user = await this.usersService.findByTelegramId(telegramId);

    if (!user) {
      const existingUserByPhone = await this.usersService.findByPhone(contact.phone_number);
      
      if (existingUserByPhone) {
        user = await this.usersService.update(existingUserByPhone['_id'].toString(), { 
          telegramId,
          firstName: contact.first_name,
          lastName: contact.last_name,
          username: ctx.from.username,
          languageCode: langCode 
        });
      } else {
        user = await this.usersService.create({
          telegramId,
          phone: contact.phone_number,
          firstName: contact.first_name,
          lastName: contact.last_name,
          username: ctx.from.username,
          languageCode: langCode,
        });
      }
    }

    if (!user) {
       throw new InternalServerErrorException('Failed to create or update user');
    }

    const lang: LanguageCode = (user.languageCode as LanguageCode) || 'uz';
    
    await ctx.reply(translations[lang].registered, {
      reply_markup: { remove_keyboard: true },
    });

    await ctx.reply(translations[lang].already_registered, {
      reply_markup: {
        inline_keyboard: [
          [{ text: translations[lang].open_app, web_app: { url: this.getMiniAppUrl(lang) } }],
        ],
      },
    });
  }

  async broadcast(telegramIds: number[], message: string, images?: string[], buttons?: {text: string, url: string}[]) {
    const inline_keyboard = buttons && buttons.length > 0 
      ? [buttons.map(b => ({ text: b.text, url: b.url }))] 
      : undefined;

    let successCount = 0;

    // Remove duplicates
    const uniqueIds = [...new Set(telegramIds)];
    
    // Process images to InputFiles if they are local paths
    const processedImages = images?.map(img => {
      if (img.startsWith('/uploads')) {
        return new InputFile(path.join(process.cwd(), img));
      }
      return img; // External URLs are fine as strings
    }) || [];

    for (const chatId of uniqueIds) {
      try {
        if (processedImages && processedImages.length > 0) {
          if (processedImages.length === 1) {
            await this.bot.api.sendPhoto(chatId, processedImages[0], {
              caption: message,
              parse_mode: 'HTML',
              reply_markup: inline_keyboard ? { inline_keyboard } : undefined,
            });
          } else {
            // Multiple images
            const mediaGroup = processedImages.map((img, index) => ({
              type: 'photo' as const,
              media: img,
              caption: index === 0 ? message : undefined,
              parse_mode: 'HTML' as const,
            }));
            await this.bot.api.sendMediaGroup(chatId, mediaGroup);
            
            // If buttons exist, send them in a separate message because media groups don't support inline keyboards
            if (inline_keyboard) {
              await this.bot.api.sendMessage(chatId, '👇', {
                reply_markup: { inline_keyboard },
              });
            }
          }
        } else {
          // Only text
          await this.bot.api.sendMessage(chatId, message, {
            parse_mode: 'HTML',
            reply_markup: inline_keyboard ? { inline_keyboard } : undefined,
          });
        }
        successCount++;
      } catch (error) {
        console.error(`Failed to send message to ${chatId}:`, error);
      }
      
      // Delay to avoid hitting telegram limits (30 msg/sec approx)
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    return successCount;
  }
}
