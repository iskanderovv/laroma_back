import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProfileContent,
  ProfileContentSchema,
} from './entities/profile-content.entity';
import { ProfileContentController } from './profile-content.controller';
import { ProfileContentService } from './profile-content.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProfileContent.name, schema: ProfileContentSchema },
    ]),
  ],
  controllers: [ProfileContentController],
  providers: [ProfileContentService],
  exports: [ProfileContentService],
})
export class ProfileContentModule {}
