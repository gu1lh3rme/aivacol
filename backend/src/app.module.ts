import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { redisStore } from 'cache-manager-redis-store';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
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
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite' as const,
        database: configService.get<string>('DB_PATH') ?? 'aivacol.db',
        entities: [Brand, ModelEntity, Vehicle],
        synchronize: true,
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: (await redisStore({
          socket: {
            host: configService.get<string>('REDIS_HOST') ?? 'localhost',
            port: Number(configService.get<string>('REDIS_PORT') ?? 6379),
          },
        })) as never,
        ttl: 60_000,
      }),
    }),
    TypeOrmModule.forFeature([Brand, ModelEntity, Vehicle]),
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
