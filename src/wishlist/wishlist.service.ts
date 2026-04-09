import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wishlist, WishlistDocument } from './entities/wishlist.entity';
import { CartService } from '../cart/cart.service';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(Wishlist.name) private wishlistModel: Model<WishlistDocument>,
    private readonly cartService: CartService,
  ) {}

  async moveToCart(userId: string): Promise<any> {
    const wishlist = await this.wishlistModel.findOne({ userId: userId as any });
    if (!wishlist || wishlist.productIds.length === 0) {
      throw new BadRequestException('Wishlist is empty');
    }

    const productIdsStrings = wishlist.productIds.map(id => id.toString());
    
    // Savatchaga merge qilamiz
    const cart = await this.cartService.mergeFromWishlist(userId, productIdsStrings);

    // Wishlistni tozalaymiz
    wishlist.productIds = [];
    await wishlist.save();

    return cart;
  }

  async getWishlist(userId: string): Promise<WishlistDocument> {
    let wishlist = await this.wishlistModel
      .findOne({ userId: userId as any })
      .populate('productIds')
      .exec();

    if (!wishlist) {
      // Agar wishlist yo'q bo'lsa, yangi yaratamiz
      wishlist = new this.wishlistModel({ userId: new Types.ObjectId(userId), productIds: [] });
      await wishlist.save();
    }
    return wishlist;
  }

  async toggleWishlist(userId: string, productId: string): Promise<WishlistDocument> {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    let wishlist = await this.wishlistModel.findOne({ userId: userId as any });

    if (!wishlist) {
      wishlist = new this.wishlistModel({ userId: new Types.ObjectId(userId), productIds: [] });
    }

    const index = wishlist.productIds.findIndex((id) => id.toString() === productId);
    if (index === -1) {
      // Agar yo'q bo'lsa - qo'shamiz
      wishlist.productIds.push(productId as any);
    } else {
      // Agar bor bo'lsa - olib tashlaymiz
      wishlist.productIds.splice(index, 1);
    }

    await wishlist.save();
    return this.getWishlist(userId);
  }

  async clearWishlist(userId: string): Promise<void> {
    await this.wishlistModel.findOneAndUpdate(
      { userId: userId as any },
      { productIds: [] },
    ).exec();
  }
}
