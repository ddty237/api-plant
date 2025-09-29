import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { ApiResponse } from '../common/interfaces/auth.interface';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Request() req): Promise<ApiResponse> {
    try {
      const user = await this.usersService.findById(req.user.sub);
      return {
        success: true,
        message: 'Profile retrieved successfully',
        data: user,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve profile',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse> {
    try {
      const user = await this.usersService.findById(id);
      return {
        success: true,
        message: 'User retrieved successfully',
        data: user,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve user',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Patch(':id/deactivate')
  async deactivateUser(@Param('id') id: string): Promise<ApiResponse> {
    try {
      const user = await this.usersService.deactivateUser(id);
      return {
        success: true,
        message: 'User deactivated successfully',
        data: user,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to deactivate user',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Patch(':id/activate')
  async activateUser(@Param('id') id: string): Promise<ApiResponse> {
    try {
      const user = await this.usersService.activateUser(id);
      return {
        success: true,
        message: 'User activated successfully',
        data: user,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to activate user',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
