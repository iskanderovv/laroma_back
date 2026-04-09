import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body('initData') initData: string) {
    return this.authService.validateTelegramData(initData);
  }

  @Post('admin/login')
  async adminLogin(@Body() adminLoginDto: AdminLoginDto) {
    return this.authService.loginAdmin(adminLoginDto);
  }

  @Get('admin/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getAdminProfile(@Req() req: { user: { email?: string; role: string } }) {
    return this.authService.getAdminProfile(req.user);
  }
}
