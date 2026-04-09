import * as crypto from 'crypto';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';

function hashSecret(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

async function seedAdmin() {
  process.env.DISABLE_BOT = 'true';
  const app = await NestFactory.createApplicationContext(AppModule);

  const usersService = app.get(UsersService);
  const admin = await usersService.upsertAdmin({
    email: 'laroma@gmail.com',
    firstName: 'Laroma Admin',
    phone: '+998000000026',
    passwordHash: hashSecret('laroma26'),
  });

  console.log('✅ Admin seeded successfully');
  console.log(
    `Email: ${admin.email}, role: ${admin.role}, id: ${String(admin._id)}`,
  );

  await app.close();
  process.exit(0);
}

seedAdmin().catch((error) => {
  console.error('❌ Admin seed failed:', error);
  process.exit(1);
});
