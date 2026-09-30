import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import * as bcrypt from 'bcrypt';
import { User, UserRole, VehicleStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const user = await this.usersService.create({
      name: registerDto.name,
      email: registerDto.email,
      passwordHash,
      role: registerDto.role,
    });

    if (user.role === UserRole.DRIVER) {
      await this.prisma.vehicle.create({
        data: {
          driverId: user.id,
          model: 'Default Tesla',
          plateNo: `AUTO-${Math.floor(Math.random() * 90000) + 10000}`,
          capacity: 3,
          status: VehicleStatus.OFFLINE,
        },
      });
    }

    return this.generateAuthResponse(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    return this.generateAuthResponse(user);
  }

  async refresh(user: User & { refreshToken: string }) {
    // We get the user and token from JwtRefreshStrategy
    const hashedToken = await this.prisma.refreshToken.findFirst({
      where: {
        userId: user.id,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!hashedToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Verify token hash
    const isTokenValid = await bcrypt.compare(user.refreshToken, hashedToken.tokenHash);
    if (!isTokenValid) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Revoke old token
    await this.prisma.refreshToken.update({
      where: { id: hashedToken.id },
      data: { revokedAt: new Date() },
    });

    return this.generateAuthResponse(user);
  }

  async logout(user: User) {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId: user.id,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    return { success: true, message: 'Logged out successfully' };
  }

  private async generateAuthResponse(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'secret',
      expiresIn: (process.env.ACCESS_TOKEN_EXPIRES_IN || '15m') as any,
    });

    const refreshTokenPlain = this.jwtService.sign(
      { sub: user.id },
      {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
        expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN || '7d') as any,
      },
    );
    const refreshTokenHash = await bcrypt.hash(refreshTokenPlain, 10);

    const expiresInDays = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN || '7d');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (isNaN(expiresInDays) ? 7 : expiresInDays));

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: refreshTokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    // Strip password hash
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      success: true,
      data: {
        accessToken,
        user: userWithoutPassword,
      },
      refreshToken: refreshTokenPlain,
    };
  }
}
