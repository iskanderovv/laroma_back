import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ProfileContentService } from './profile-content.service';
import { UpdateProfileContentDto } from './dto/update-profile-content.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('profile-content')
export class ProfileContentController {
  constructor(private readonly profileContentService: ProfileContentService) {}

  @Get(':key')
  findOne(@Param('key') key: string) {
    return this.profileContentService.findByKey(key);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':key')
  update(
    @Param('key') key: string,
    @Body() updateProfileContentDto: UpdateProfileContentDto,
  ) {
    return this.profileContentService.update(key, updateProfileContentDto);
  }
}

