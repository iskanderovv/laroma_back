import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { BrandsModule } from './brands/brands.module';
import { UploadsModule } from './uploads/uploads.module';
import { BannersModule } from './banners/banners.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { AdminModule } from './admin/admin.module';
import { AddressesModule } from './addresses/addresses.module';
import { ProfileContentModule } from './profile-content/profile-content.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    ...(process.env.DISABLE_BOT === 'true' ? [] : [require('./bot/bot.module').BotModule]),
    AuthModule,
    CategoriesModule,
    ProductsModule,
    BrandsModule,
    UploadsModule,
    BannersModule,
    WishlistModule,
    CartModule,
    OrdersModule,
    AdminModule,
    AddressesModule,
    ProfileContentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
