import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product, ProductSchema } from './entities/product.entity';
import { ProductReview, ProductReviewSchema } from './entities/product-review.entity';
import { CategoriesModule } from '../categories/categories.module';
import { BrandsModule } from '../brands/brands.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: ProductReview.name, schema: ProductReviewSchema },
    ]),
    CategoriesModule,
    BrandsModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
