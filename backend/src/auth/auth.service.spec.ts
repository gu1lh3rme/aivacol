import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              const values: Record<string, string> = {
                AUTH_EMAIL: 'admin@aivacol.com',
                AUTH_PASSWORD: 'Aivacol@123',
                JWT_SECRET: 'secret',
                JWT_REFRESH_SECRET: 'refresh',
              };
              return values[key];
            },
          },
        },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  it('should login successfully with valid credentials', async () => {
    const tokens = await service.login('admin@aivacol.com', 'Aivacol@123');
    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();
  });

  it('should fail with invalid credentials', async () => {
    await expect(
      service.login('admin@aivacol.com', 'wrong'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
