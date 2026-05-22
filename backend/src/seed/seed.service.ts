import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { Repository } from 'typeorm';
import { User } from '../auth/user.entity';
import { Brand } from '../brands/entities/brand.entity';
import { ModelEntity } from '../models/entities/model.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

interface SeedVehicle {
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  mileage: number;
  imageUrl?: string;
}

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(ModelEntity)
    private readonly modelRepository: Repository<ModelEntity>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  async onModuleInit() {
    await this.seedInitialUser();
    await this.seedVehicles();
  }

  private async seedInitialUser() {
    const totalUsers = await this.userRepository.count();
    if (totalUsers > 0) {
      return;
    }

    const email =
      this.configService.get<string>('AUTH_EMAIL') ?? 'admin@aivacol.com';
    const plainPassword =
      this.configService.get<string>('AUTH_PASSWORD') ?? 'aivacol@123';
    const nickname =
      this.configService.get<string>('AUTH_NICKNAME') ?? 'admin';
    const name =
      this.configService.get<string>('AUTH_NAME') ?? 'Administrador Aivacol';
    const password = await bcrypt.hash(plainPassword, 10);

    await this.userRepository.save(
      this.userRepository.create({
        nickname,
        name,
        email,
        password,
      }),
    );

    this.logger.log(`Usuário inicial inserido: ${email}`);
  }

  private async seedVehicles() {
    const total = await this.vehicleRepository.count();
    if (total > 0) {
      return;
    }

    const seedFilePath = join(process.cwd(), '..', 'seed_vehicles.json');
    const content = await readFile(seedFilePath, 'utf8');
    const seedVehicles = JSON.parse(content) as SeedVehicle[];

    for (const item of seedVehicles) {
      let brand = await this.brandRepository.findOne({
        where: { name: item.brand },
      });
      if (!brand) {
        brand = await this.brandRepository.save(
          this.brandRepository.create({ name: item.brand }),
        );
      }

      let model = await this.modelRepository.findOne({
        where: { name: item.model, brandId: brand.id },
      });
      if (!model) {
        model = await this.modelRepository.save(
          this.modelRepository.create({
            name: item.model,
            brand,
            brandId: brand.id,
          }),
        );
      }

      await this.vehicleRepository.save(
        this.vehicleRepository.create({
          plate: item.plate.toUpperCase(),
          year: item.year,
          color: item.color,
          mileage: item.mileage,
          imageUrl: item.imageUrl,
          brand,
          brandId: brand.id,
          model,
          modelId: model.id,
        }),
      );
    }

    this.logger.log(
      `${seedVehicles.length} veículos inseridos do arquivo seed_vehicles.json`,
    );
  }
}
