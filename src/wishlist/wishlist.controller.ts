import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  async getWishlist(@Req() req: Request) {
    const user: any = req.user;
    return this.wishlistService.getWishlist(user.userId);
  }

  @Post('toggle')
  async toggleWishlist(@Req() req: Request, @Body('productId') productId: string) {
    const user: any = req.user;
    return this.wishlistService.toggleWishlist(user.userId, productId);
  }

  @Post('move-to-cart')
  async moveToCart(@Req() req: Request) {
    const user: any = req.user;
    return this.wishlistService.moveToCart(user.userId);
  }

  @Delete('clear')
  async clearWishlist(@Req() req: Request) {
    const user: any = req.user;
    await this.wishlistService.clearWishlist(user.userId);
    return { success: true };
  }
}
