import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserDocument } from '../users/entities/user.entity';
import type { AuthResponse, JwtPayload } from '../common/interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const user = await this.usersService.create(registerDto);
    const payload: JwtPayload = {
      sub: user._id?.toString() || user.id,
      email: user.email,
      username: user.username,
    };

    return {
      user: {
        id: user._id?.toString() || user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.emailOrUsername, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.usersService.updateLastLogin(user._id?.toString() || user.id);

    const payload: JwtPayload = {
      sub: user._id?.toString() || user.id,
      email: user.email,
      username: user.username,
    };

    return {
      user: {
        id: user._id?.toString() || user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(emailOrUsername: string, password: string): Promise<UserDocument | null> {
    const user = await this.usersService.findByEmailOrUsername(emailOrUsername);
    
    if (!user || !user.isActive) {
      return null;
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async refreshToken(userId: string): Promise<{ access_token: string }> {
    const user = await this.usersService.findById(userId);
    const payload: JwtPayload = {
      sub: user._id?.toString() || user.id,
      email: user.email,
      username: user.username,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
