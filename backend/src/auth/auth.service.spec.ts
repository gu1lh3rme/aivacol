import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from './user.entity';

describe('AuthService', () => {
  let service: AuthService;
  type FindOneMock = jest.MockedFunction<
    (options?: unknown) => Promise<User | null>
  >;
  const userRepository = {
    findOne: jest.fn() as FindOneMock,
  };
  let hashedPassword = '';

  beforeAll(async () => {
    hashedPassword = await bcrypt.hash('aivacol@123', 10);
  });

  beforeEach(async () => {
    jest.clearAllMocks();

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
                AUTH_PASSWORD: 'aivacol@123',
                JWT_SECRET: 'secret',
                JWT_REFRESH_SECRET: 'refresh',
              };
              return values[key];
            },
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  it('should login successfully with valid credentials', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 1,
      nickname: 'admin',
      name: 'Administrador Aivacol',
      email: 'admin@aivacol.com',
      password: hashedPassword,
    });

    const tokens = await service.login('admin@aivacol.com', 'aivacol@123');
    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();
  });

  it('should fail with invalid credentials', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 1,
      nickname: 'admin',
      name: 'Administrador Aivacol',
      email: 'admin@aivacol.com',
      password: hashedPassword,
    });

    await expect(
      service.login('admin@aivacol.com', 'wrong'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should fail when user does not exist', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(
      service.login('inexistente@aivacol.com', 'aivacol@123'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
