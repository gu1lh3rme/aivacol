import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Brand } from './entities/brand.entity';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  create(dto: CreateBrandDto) {
    return this.brandRepository.save(this.brandRepository.create(dto));
  }

  findAll() {
    return this.brandRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number) {
    const brand = await this.brandRepository.findOne({ where: { id } });
    if (!brand) {
      throw new NotFoundException('Marca não encontrada');
    }
    return brand;
  }

  async update(id: number, dto: UpdateBrandDto) {
    const brand = await this.findOne(id);
    return this.brandRepository.save({ ...brand, ...dto });
  }

  async remove(id: number) {
    const brand = await this.findOne(id);
    await this.brandRepository.remove(brand);
    return { deleted: true };
  }
}
