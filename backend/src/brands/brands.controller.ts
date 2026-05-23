import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@ApiTags('Brands')
@ApiBearerAuth('access-token')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova marca' })
  @ApiCreatedResponse({ description: 'Marca criada com sucesso' })
  create(@Body() dto: CreateBrandDto) {
    return this.brandsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as marcas' })
  @ApiOkResponse({ description: 'Lista de marcas retornada com sucesso' })
  findAll() {
    return this.brandsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca marca por id' })
  @ApiParam({ name: 'id', type: Number, description: 'Identificador da marca' })
  @ApiOkResponse({ description: 'Marca encontrada' })
  @ApiNotFoundResponse({ description: 'Marca nao encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.brandsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza uma marca' })
  @ApiParam({ name: 'id', type: Number, description: 'Identificador da marca' })
  @ApiOkResponse({ description: 'Marca atualizada com sucesso' })
  @ApiNotFoundResponse({ description: 'Marca nao encontrada' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBrandDto) {
    return this.brandsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma marca' })
  @ApiParam({ name: 'id', type: Number, description: 'Identificador da marca' })
  @ApiNoContentResponse({ description: 'Marca removida com sucesso' })
  @ApiNotFoundResponse({ description: 'Marca nao encontrada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.brandsService.remove(id);
  }
}
