import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { BroadcastDto } from './dto/broadcast.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('dashboard/stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('dashboard/top-products')
  getTopProducts(@Query('limit') limit: string) {
    return this.adminService.getTopProducts(Number(limit) || 5);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('dashboard/recent-orders')
  getRecentOrders(@Query('limit') limit: string) {
    return this.adminService.getRecentOrders(Number(limit) || 10);
  }

  @Get('dashboard/analytics')
  getDashboardAnalytics() {
    return this.adminService.getDashboardAnalytics();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('broadcast')
  broadcast(@Body() broadcastDto: BroadcastDto) {
    return this.adminService.broadcastMessage(broadcastDto);
  }
}
