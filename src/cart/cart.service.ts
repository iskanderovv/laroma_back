import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './entities/cart.entity';
import { Product, ProductDocument } from '../products/entities/product.entity';
import { resolveProductSelection } from '../products/product-selection.util';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  private findCartItemIndex(
    items: CartDocument['items'],
    productId: string,
    selectedVolume?: string,
    selectedScentCode?: string,
  ) {
    return items.findIndex((item) => {
      const sameProduct = item.productId.toString() === productId;
      const sameVolume = (item.selectedVolume || '') === (selectedVolume || '');
      const sameScent = (item.selectedScentCode || '') === (selectedScentCode || '');

      return sameProduct && sameVolume && sameScent;
    });
  }

  async getCart(userId: string): Promise<CartDocument> {
    let cart = await this.cartModel
      .findOne({ userId: userId as any })
      .populate('items.productId')
      .exec();

    if (!cart) {
      cart = new this.cartModel({ userId: new Types.ObjectId(userId), items: [] });
      await cart.save();
    }
    return cart;
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<CartDocument> {
    const {
      productId,
      quantity = 1,
      selectedVolume,
      selectedScentCode,
    } = addToCartDto;

    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel.findById(productId).exec();
    if (!product || !product.isActive) {
      throw new BadRequestException('Product not found');
    }

    const resolvedSelection = resolveProductSelection(product, {
      selectedVolume,
      selectedScentCode,
    });

    if (resolvedSelection.stock <= 0) {
      throw new BadRequestException('Product is out of stock');
    }

    let cart = await this.cartModel.findOne({ userId: userId as any });
    if (!cart) {
      cart = new this.cartModel({ userId: new Types.ObjectId(userId), items: [] });
    }

    const itemIndex = this.findCartItemIndex(
      cart.items,
      productId,
      resolvedSelection.selectedVolume,
      resolvedSelection.selectedScentCode,
    );

    if (itemIndex > -1) {
      const nextQuantity = cart.items[itemIndex].quantity + quantity;
      if (nextQuantity > resolvedSelection.stock) {
        throw new BadRequestException('Requested quantity exceeds available stock');
      }

      cart.items[itemIndex].quantity = nextQuantity;
    } else {
      if (quantity > resolvedSelection.stock) {
        throw new BadRequestException('Requested quantity exceeds available stock');
      }

      cart.items.push({
        productId: new Types.ObjectId(productId),
        selectedVolume: resolvedSelection.selectedVolume,
        selectedScentCode: resolvedSelection.selectedScentCode,
        quantity,
      } as any);
    }

    await cart.save();
    return this.getCart(userId);
  }

  async updateQuantity(
    userId: string,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartDocument> {
    const { productId, quantity, selectedVolume, selectedScentCode } = updateCartItemDto;

    if (quantity <= 0) {
      return this.removeFromCart(userId, productId, {
        selectedVolume,
        selectedScentCode,
      });
    }

    const cart = await this.cartModel.findOne({ userId: userId as any });
    if (!cart) throw new BadRequestException('Cart not found');

    const product = await this.productModel.findById(productId).exec();
    if (!product || !product.isActive) {
      throw new BadRequestException('Product not found');
    }

    const resolvedSelection = resolveProductSelection(product, {
      selectedVolume,
      selectedScentCode,
    });

    if (quantity > resolvedSelection.stock) {
      throw new BadRequestException('Requested quantity exceeds available stock');
    }

    const itemIndex = this.findCartItemIndex(
      cart.items,
      productId,
      resolvedSelection.selectedVolume,
      resolvedSelection.selectedScentCode,
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();
    }
    return this.getCart(userId);
  }

  async removeFromCart(
    userId: string,
    productId: string,
    selection: { selectedVolume?: string; selectedScentCode?: string } = {},
  ): Promise<CartDocument> {
    const cart = await this.cartModel.findOne({ userId: userId as any });
    if (cart) {
      cart.items = cart.items.filter((item) => {
        if (item.productId.toString() !== productId) {
          return true;
        }

        const sameVolume = (item.selectedVolume || '') === (selection.selectedVolume || '');
        const sameScent = (item.selectedScentCode || '') === (selection.selectedScentCode || '');

        return !(sameVolume && sameScent);
      });
      await cart.save();
    }
    return this.getCart(userId);
  }

  // Wishlistdan ko'chirish (Merge)
  async mergeFromWishlist(userId: string, productIds: string[]): Promise<CartDocument> {
    let cart = await this.cartModel.findOne({ userId: userId as any });
    if (!cart) {
      cart = new this.cartModel({ userId: new Types.ObjectId(userId), items: [] });
    }

    for (const productId of productIds) {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId,
      );
      if (itemIndex === -1) {
        cart.items.push({ productId: new Types.ObjectId(productId), quantity: 1 } as any);
      }
    }

    await cart.save();
    return this.getCart(userId);
    }


  async clearCart(userId: string): Promise<void> {
    await this.cartModel.findOneAndUpdate(
      { userId: userId as any },
      { items: [] },
    ).exec();
  }
}
