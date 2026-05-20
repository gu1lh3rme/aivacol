import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import type { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { BrandsService } from '../brands/brands.service';
import { ModelsService } from '../models/models.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Vehicle } from './entities/vehicle.entity';

interface VehicleFilters {
  plate?: string;
  brand?: string;
  model?: string;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    private readonly brandsService: BrandsService,
    private readonly modelsService: ModelsService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(dto: CreateVehicleDto) {
    const brand = await this.brandsService.findOne(dto.brandId);
    const model = await this.modelsService.findOne(dto.modelId);
    const saved = await this.vehicleRepository.save(
      this.vehicleRepository.create({
        ...dto,
        plate: dto.plate.toUpperCase(),
        brand,
        model,
      }),
    );
    await this.cacheManager.clear();
    return saved;
  }

  async findAll(filters: VehicleFilters) {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 10;

    const cacheKey = `vehicles:${JSON.stringify({ ...filters, page, pageSize })}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const query = this.vehicleRepository
      .createQueryBuilder('vehicle')
      .leftJoinAndSelect('vehicle.brand', 'brand')
      .leftJoinAndSelect('vehicle.model', 'model')
      .orderBy('vehicle.id', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (filters.plate) {
      query.andWhere('UPPER(vehicle.plate) LIKE :plate', {
        plate: `%${filters.plate.toUpperCase()}%`,
      });
    }
    if (filters.brand) {
      query.andWhere('LOWER(brand.name) LIKE :brand', {
        brand: `%${filters.brand.toLowerCase()}%`,
      });
    }
    if (filters.model) {
      query.andWhere('LOWER(model.name) LIKE :model', {
        model: `%${filters.model.toLowerCase()}%`,
      });
    }

    const [data, total] = await query.getManyAndCount();
    const response = { data, total, page, pageSize };

    await this.cacheManager.set(cacheKey, response, 60_000);

    return response;
  }

  async findOne(id: number) {
    const vehicle = await this.vehicleRepository.findOne({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado');
    }
    return vehicle;
  }

  async update(id: number, dto: UpdateVehicleDto) {
    const vehicle = await this.findOne(id);

    const brand = dto.brandId
      ? await this.brandsService.findOne(dto.brandId)
      : vehicle.brand;
    const model = dto.modelId
      ? await this.modelsService.findOne(dto.modelId)
      : vehicle.model;

    const updated = await this.vehicleRepository.save({
      ...vehicle,
      ...dto,
      plate: dto.plate ? dto.plate.toUpperCase() : vehicle.plate,
      brand,
      model,
    });

    await this.cacheManager.clear();
    return updated;
  }

  async remove(id: number) {
    const vehicle = await this.findOne(id);
    await this.vehicleRepository.remove(vehicle);
    await this.cacheManager.clear();
    return { deleted: true };
  }
}
