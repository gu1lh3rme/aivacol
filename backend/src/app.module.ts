import { CacheModule } from '@nestjs/cache-manager';
import { Logger, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { redisStore } from 'cache-manager-redis-store';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { User } from './auth/user.entity';
import { Brand } from './brands/entities/brand.entity';
import { BrandsModule } from './brands/brands.module';
import { ModelEntity } from './models/entities/model.entity';
import { ModelsModule } from './models/models.module';
import { SeedService } from './seed/seed.service';
import { Vehicle } from './vehicles/entities/vehicle.entity';
import { VehiclesModule } from './vehicles/vehicles.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbPortRaw = configService.get<string>('DB_PORT');
        const dbPort = dbPortRaw ? Number(dbPortRaw) : undefined;
        const dbInstance = configService.get<string>('DB_INSTANCE');

        return {
          type: 'mssql' as const,
          host: configService.get<string>('DB_HOST') ?? 'localhost',
          ...(Number.isFinite(dbPort) ? { port: dbPort } : {}),
          username: configService.get<string>('DB_USERNAME') ?? 'sa',
          password: configService.get<string>('DB_PASSWORD') ?? 'admin',
          database: configService.get<string>('DB_DATABASE') ?? 'aivacol',
          options: {
            encrypt: false,
            trustServerCertificate: true,
            ...(dbInstance ? { instanceName: dbInstance } : {}),
          },
          entities: [Brand, ModelEntity, Vehicle, User],
          synchronize: true,
        };
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('CacheConfig');
        const cacheDriver =
          configService.get<string>('CACHE_DRIVER')?.toLowerCase() ?? 'memory';

        if (cacheDriver !== 'redis') {
          return {
            ttl: 60_000,
          };
        }

        try {
          return {
            store: (await redisStore({
              socket: {
                host: configService.get<string>('REDIS_HOST') ?? 'localhost',
                port: Number(configService.get<string>('REDIS_PORT') ?? 6379),
              },
            })) as never,
            ttl: 60_000,
          };
        } catch (error) {
          logger.warn(
            'Falha ao conectar no Redis. Usando cache em memoria para este boot.',
          );
          return {
            ttl: 60_000,
          };
        }
      },
    }),
    TypeOrmModule.forFeature([Brand, ModelEntity, Vehicle, User]),
    AuthModule,
    BrandsModule,
    ModelsModule,
    VehiclesModule,
  ],
  providers: [
    SeedService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
