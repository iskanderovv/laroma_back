import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Order, OrderSchema } from '../orders/entities/order.entity';
import { User, UserSchema } from '../users/entities/user.entity';
import { Product, ProductSchema } from '../products/entities/product.entity';
import { Category, CategorySchema } from '../categories/entities/category.entity';
import { Brand, BrandSchema } from '../brands/entities/brand.entity';
import { BotModule } from '../bot/bot.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Brand.name, schema: BrandSchema },
    ]),
    BotModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
