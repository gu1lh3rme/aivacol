import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from './user.entity';

interface JwtPayload {
  sub: number;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    const isAllowed = user && (await bcrypt.compare(password, user.password));
    if (!isAllowed) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return this.createTokens({ sub: user.id, email: user.email });
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret:
            this.configService.get<string>('JWT_REFRESH_SECRET') ??
            'refresh_secret',
        },
      );
      return this.createTokens({ sub: payload.sub, email: payload.email });
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  private async createTokens(payload: JwtPayload) {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET') ?? 'access_secret',
      expiresIn: '15m',
    });

    const newRefreshToken = await this.jwtService.signAsync(payload, {
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ??
        'refresh_secret',
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: payload.sub,
        email: payload.email,
      },
    };
  }
}
