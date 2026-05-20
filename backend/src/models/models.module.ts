import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandsModule } from '../brands/brands.module';
import { ModelEntity } from './entities/model.entity';
import { ModelsController } from './models.controller';
import { ModelsService } from './models.service';

@Module({
  imports: [TypeOrmModule.forFeature([ModelEntity]), BrandsModule],
  controllers: [ModelsController],
  providers: [ModelsService],
  exports: [ModelsService, TypeOrmModule],
})
export class ModelsModule {}
