import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

async function seed() {
  process.env.DISABLE_BOT = 'true';
  const app = await NestFactory.createApplicationContext(AppModule);

  const BannerModel = app.get<Model<any>>(getModelToken('Banner'));
  const CategoryModel = app.get<Model<any>>(getModelToken('Category'));
  const ProductModel = app.get<Model<any>>(getModelToken('Product'));
  const ProductReviewModel = app.get<Model<any>>(getModelToken('ProductReview'));
  const ProfileContentModel = app.get<Model<any>>(getModelToken('ProfileContent'));

  // Clear existing data
  await BannerModel.deleteMany({});
  await CategoryModel.deleteMany({});
  await ProductModel.deleteMany({});
  await ProductReviewModel.deleteMany({});
  await ProfileContentModel.deleteMany({});

  // Seed Banners
  const banners = await BannerModel.insertMany([
    {
      title: { uz: 'Yangi kolleksiya', ru: 'Новая коллекция' },
      image: 'https://images.unsplash.com/photo-1588099768531-a72d4a198538?w=800',
      type: 'hero',
      linkType: 'category',
      isActive: true,
      order: 1,
    },
    {
      title: { uz: 'Hafta top takliflari', ru: 'Лучшие предложения недели' },
      image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800',
      type: 'hero',
      linkType: 'none',
      isActive: true,
      order: 2,
    },
    {
      title: { uz: 'Chegirma 50%', ru: 'Скидка 50%' },
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
      type: 'middle',
      linkType: 'product',
      isActive: true,
      order: 1,
    },
    {
      title: { uz: 'Premium atirlar tanlovi', ru: 'Подборка премиальных ароматов' },
      image: 'https://images.unsplash.com/photo-1615228939096-9f29c4d6f20b?w=800',
      type: 'middle',
      linkType: 'none',
      isActive: true,
      order: 2,
    },
  ]);

  // Seed Categories
  const categories = await CategoryModel.insertMany([
    {
      title: { uz: 'Atirlar', ru: 'Духи' },
      icon: '🌸',
      isActive: true,
    },
    {
      title: { uz: 'Kosmetika', ru: 'Косметика' },
      icon: '💄',
      isActive: true,
    },
    {
      title: { uz: 'Parvarish', ru: 'Уход' },
      icon: '✨',
      isActive: true,
    },
    {
      title: { uz: 'Aksessuarlar', ru: 'Аксессуары' },
      icon: '👜',
      isActive: true,
    },
  ]);

  // Seed Products
  const products = await ProductModel.insertMany([
    {
      title: { uz: 'Chanel No 5', ru: 'Chanel No 5' },
      description: { uz: 'Klassik atir', ru: 'Классический аромат' },
      scents: [
        { code: 'classic-floral', label: { uz: 'Klassik floral', ru: 'Классический цветочный' } },
        { code: 'soft-vanilla', label: { uz: 'Yumshoq vanil', ru: 'Мягкая ваниль' } },
        { code: 'musky-evening', label: { uz: 'Mushkli kechki', ru: 'Мускусный вечерний' } },
      ],
      price: 250000,
      oldPrice: 300000,
      thumbnail: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400',
      images: [
        'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=700',
        'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=700',
      ],
      categoryId: categories[0]._id,
      isNew: true,
      isPopular: true,
      isActive: true,
      volume: '100ml',
      volumeOptions: [
        { volume: '30 ml', price: 120000, oldPrice: 145000, stock: 18 },
        { volume: '50 ml', price: 180000, oldPrice: 220000, stock: 12 },
        { volume: '100 ml', price: 250000, oldPrice: 300000, stock: 8 },
      ],
    },
    {
      title: { uz: 'Dior Sauvage', ru: 'Dior Sauvage' },
      description: { uz: 'Erkaklar uchun atir', ru: 'Мужской аромат' },
      scents: [
        { code: 'fresh-citrus', label: { uz: 'Yangi sitrus', ru: 'Свежий цитрус' } },
        { code: 'woody-spice', label: { uz: 'Yog‘ochli ziravor', ru: 'Древесно-пряный' } },
        { code: 'amber-intense', label: { uz: 'Ambra intense', ru: 'Насыщенная амбра' } },
      ],
      price: 320000,
      thumbnail: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400',
      images: [
        'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=700',
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=700',
      ],
      categoryId: categories[0]._id,
      isNew: true,
      isPopular: true,
      isActive: true,
      volume: '100ml',
      volumeOptions: [
        { volume: '60 ml', price: 220000, oldPrice: 250000, stock: 11 },
        { volume: '100 ml', price: 320000, oldPrice: 360000, stock: 9 },
      ],
    },
    {
      title: { uz: 'YSL Black Opium', ru: 'YSL Black Opium' },
      description: { uz: 'Ayollar uchun atir', ru: 'Женский аромат' },
      scents: [
        { code: 'coffee-signature', label: { uz: 'Qahvali signature', ru: 'Фирменный кофейный' } },
        { code: 'vanilla-night', label: { uz: 'Kechki vanil', ru: 'Вечерняя ваниль' } },
        { code: 'jasmine-soft', label: { uz: 'Yumshoq yasemin', ru: 'Нежный жасмин' } },
      ],
      price: 280000,
      oldPrice: 350000,
      thumbnail: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400',
      images: [
        'https://images.unsplash.com/photo-1541643600914-78b084683601?w=700',
        'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=700',
      ],
      categoryId: categories[0]._id,
      isPopular: true,
      isActive: true,
      volume: '90ml',
      volumeOptions: [
        { volume: '50 ml', price: 190000, oldPrice: 230000, stock: 14 },
        { volume: '90 ml', price: 280000, oldPrice: 350000, stock: 7 },
      ],
    },
    {
      title: { uz: 'Lip Gloss', ru: 'Блеск для губ' },
      description: { uz: 'Yumshoq lab parloqligi', ru: 'Мягкий блеск для губ' },
      price: 45000,
      thumbnail: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
      categoryId: categories[1]._id,
      isNew: true,
      isActive: true,
    },
    {
      title: { uz: 'Foundation', ru: 'Тональный крем' },
      description: { uz: 'Tonal krem', ru: 'Основа под макияж' },
      price: 120000,
      thumbnail: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400',
      categoryId: categories[1]._id,
      isNew: true,
      isPopular: true,
      isActive: true,
      volumeOptions: [
        { volume: '30 ml', price: 120000, stock: 20 },
        { volume: '50 ml', price: 155000, stock: 12 },
      ],
    },
    {
      title: { uz: 'Yuz kremi', ru: 'Крем для лица' },
      description: { uz: 'Namlovchi yuz kremi', ru: 'Увлажняющий крем для лица' },
      price: 85000,
      thumbnail: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
      categoryId: categories[2]._id,
      isPopular: true,
      isActive: true,
      volumeOptions: [
        { volume: '50 ml', price: 85000, stock: 15 },
        { volume: '100 ml', price: 140000, stock: 10 },
      ],
    },
  ]);

  const reviews = await ProductReviewModel.insertMany([
    {
      productId: products[0]._id,
      userName: 'Dilnoza T.',
      rating: 5,
      comment: 'Hidi juda nafis va uzoq saqlanadi. Original ekanligi sezilib turadi.',
      isVerifiedPurchase: true,
    },
    {
      productId: products[0]._id,
      userName: 'Madina R.',
      rating: 4,
      comment: 'Qadoqlash yaxshi, yetkazib berish tez. Hid yoqimli, lekin biroz kuchliroq bo\'lsa yaxshi bo\'lardi.',
      isVerifiedPurchase: true,
    },
    {
      productId: products[1]._id,
      userName: 'Azizbek S.',
      rating: 5,
      comment: 'Kundalik uchun zo\'r tanlov. Ertalab sepgan hid kechgacha qoladi.',
      isVerifiedPurchase: true,
    },
    {
      productId: products[1]._id,
      userName: 'Jasur K.',
      rating: 4,
      comment: 'Sifatiga gap yo\'q, narxiga ham arziydi.',
      isVerifiedPurchase: false,
    },
    {
      productId: products[2]._id,
      userName: 'Sevara M.',
      rating: 5,
      comment: 'Kechki tadbirlar uchun ajoyib hid. Juda mazza qildim.',
      isVerifiedPurchase: true,
    },
  ]);

  // Seed Profile Content
  const profileContents = await ProfileContentModel.insertMany([
    {
      key: 'support',
      title: { uz: 'Qo\'llab-quvvatlash', ru: 'Поддержка' },
      description: {
        uz: 'Savollaringiz bo\'lsa, biz bilan bog\'laning. Jamoamiz sizga tez javob beradi.',
        ru: 'Если у вас есть вопросы, свяжитесь с нами. Наша команда ответит вам максимально быстро.',
      },
      phone: '+998901234567',
      socialLinks: [
        {
          type: 'telegram',
          label: 'Telegram',
          value: '@laroma_support',
          url: 'https://t.me/laroma_support',
        },
        {
          type: 'instagram',
          label: 'Instagram',
          value: '@laroma_perfume',
          url: 'https://instagram.com/laroma_perfume',
        },
        {
          type: 'facebook',
          label: 'Facebook',
          value: 'Laroma Perfume',
          url: 'https://facebook.com/laroma.perfume',
        },
      ],
      sections: [
        {
          title: { uz: 'Ish vaqti', ru: 'Время работы' },
          description: {
            uz: 'Har kuni 09:00 dan 22:00 gacha.',
            ru: 'Ежедневно с 09:00 до 22:00.',
          },
        },
        {
          title: { uz: 'Qo\'ng\'iroq markazi', ru: 'Колл-центр' },
          description: {
            uz: 'Operatorlar buyurtma, to\'lov va yetkazib berish bo\'yicha yordam beradi.',
            ru: 'Операторы помогут с заказом, оплатой и вопросами доставки.',
          },
        },
      ],
    },
    {
      key: 'delivery',
      title: { uz: 'Yetkazib berish', ru: 'Доставка' },
      description: {
        uz: 'Buyurtmalar Toshkent bo\'ylab va viloyatlarga yetkazib beriladi.',
        ru: 'Заказы доставляются по Ташкенту и в регионы.',
      },
      sections: [
        {
          title: { uz: 'Toshkent shahri', ru: 'По Ташкенту' },
          description: {
            uz: '2-4 soat ichida yetkazib berish. 250 000 so\'mdan yuqori buyurtmalarda bepul.',
            ru: 'Доставка в течение 2-4 часов. Бесплатно при заказе от 250 000 сум.',
          },
        },
        {
          title: { uz: 'Viloyatlar', ru: 'Регионы' },
          description: {
            uz: '1-3 ish kuni. Narx hududga qarab hisoblanadi.',
            ru: '1-3 рабочих дня. Стоимость рассчитывается в зависимости от региона.',
          },
        },
        {
          title: { uz: 'To\'lov usullari', ru: 'Способы оплаты' },
          description: {
            uz: 'Naqd, Click, Payme va bank kartalari qabul qilinadi.',
            ru: 'Принимаются наличные, Click, Payme и банковские карты.',
          },
        },
      ],
    },
    {
      key: 'about',
      title: { uz: 'Biz haqimizda', ru: 'О нас' },
      description: {
        uz: 'Laroma Perfume - original atirlar va premium parvarish mahsulotlarini taklif qiluvchi brend.',
        ru: 'Laroma Perfume - бренд, предлагающий оригинальные ароматы и премиальные уходовые продукты.',
      },
      sections: [
        {
          title: { uz: 'Bizning missiyamiz', ru: 'Наша миссия' },
          description: {
            uz: 'Har bir mijozga sifatli mahsulot, yoqimli servis va tez yetkazib berishni taqdim etish.',
            ru: 'Предоставлять каждому клиенту качественный продукт, высокий сервис и быструю доставку.',
          },
        },
        {
          title: { uz: 'Nega Laroma', ru: 'Почему Laroma' },
          description: {
            uz: 'Original mahsulotlar, ishonchli hamkorlar va doimiy yangilanadigan kolleksiya.',
            ru: 'Оригинальная продукция, надежные поставщики и постоянно обновляемая коллекция.',
          },
        },
      ],
    },
  ]);

  console.log('✅ Seed completed successfully!');
  console.log(
    `📊 Created: ${banners.length} banners, ${categories.length} categories, ${products.length} products, ${reviews.length} reviews, ${profileContents.length} profile content pages`,
  );

  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
