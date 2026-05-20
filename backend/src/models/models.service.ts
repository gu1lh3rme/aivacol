import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrandsService } from '../brands/brands.service';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { ModelEntity } from './entities/model.entity';

@Injectable()
export class ModelsService {
  constructor(
    @InjectRepository(ModelEntity)
    private readonly modelRepository: Repository<ModelEntity>,
    private readonly brandsService: BrandsService,
  ) {}

  async create(dto: CreateModelDto) {
    const brand = await this.brandsService.findOne(dto.brandId);
    return this.modelRepository.save(
      this.modelRepository.create({ ...dto, brand }),
    );
  }

  findAll() {
    return this.modelRepository.find({ order: { name: 'ASC' } });
  }

  findByBrand(brandId: number) {
    return this.modelRepository.find({
      where: { brandId },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number) {
    const model = await this.modelRepository.findOne({ where: { id } });
    if (!model) {
      throw new NotFoundException('Modelo não encontrado');
    }
    return model;
  }

  async update(id: number, dto: UpdateModelDto) {
    const model = await this.findOne(id);
    const brand = dto.brandId
      ? await this.brandsService.findOne(dto.brandId)
      : model.brand;

    return this.modelRepository.save({ ...model, ...dto, brand });
  }

  async remove(id: number) {
    const model = await this.findOne(id);
    await this.modelRepository.remove(model);
    return { deleted: true };
  }
}
