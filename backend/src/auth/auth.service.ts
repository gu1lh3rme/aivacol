import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

interface JwtPayload {
  sub: number;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const allowedEmail =
      this.configService.get<string>('AUTH_EMAIL') ?? 'admin@aivacol.com';
    const plainPassword =
      this.configService.get<string>('AUTH_PASSWORD') ?? 'Aivacol@123';
    const hash = await bcrypt.hash(plainPassword, 10);

    const isAllowed =
      email === allowedEmail && (await bcrypt.compare(password, hash));
    if (!isAllowed) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return this.createTokens({ sub: 1, email });
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
