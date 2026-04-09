import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Body,
  Query,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req: Request) {
    const user: any = req.user;
    return this.cartService.getCart(user.userId);
  }

  @Post('add')
  addToCart(@Req() req: Request, @Body() addToCartDto: AddToCartDto) {
    const user: any = req.user;
    return this.cartService.addToCart(user.userId, addToCartDto);
  }

  @Patch('quantity')
  updateQuantity(@Req() req: Request, @Body() updateCartItemDto: UpdateCartItemDto) {
    const user: any = req.user;
    return this.cartService.updateQuantity(user.userId, updateCartItemDto);
  }

  @Delete('remove/:productId')
  removeFromCart(
    @Req() req: Request,
    @Param('productId') productId: string,
    @Query('selectedVolume') selectedVolume?: string,
    @Query('selectedScentCode') selectedScentCode?: string,
  ) {
    const user: any = req.user;
    return this.cartService.removeFromCart(user.userId, productId, {
      selectedVolume,
      selectedScentCode,
    });
  }

  @Delete('clear')
  clearCart(@Req() req: Request) {
    const user: any = req.user;
    return this.cartService.clearCart(user.userId);
  }
}
