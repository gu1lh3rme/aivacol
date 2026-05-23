import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { ModelsService } from './models.service';

@ApiTags('Models')
@ApiBearerAuth('access-token')
@Controller('models')
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo modelo' })
  @ApiCreatedResponse({ description: 'Modelo criado com sucesso' })
  create(@Body() dto: CreateModelDto) {
    return this.modelsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista modelos ou filtra por marca' })
  @ApiQuery({ name: 'brandId', required: false, description: 'Filtra modelos por id da marca' })
  @ApiOkResponse({ description: 'Lista de modelos retornada com sucesso' })
  findAll(@Query('brandId') brandId?: string) {
    if (brandId) {
      return this.modelsService.findByBrand(Number(brandId));
    }
    return this.modelsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca modelo por id' })
  @ApiParam({ name: 'id', type: Number, description: 'Identificador do modelo' })
  @ApiOkResponse({ description: 'Modelo encontrado' })
  @ApiNotFoundResponse({ description: 'Modelo nao encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.modelsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um modelo' })
  @ApiParam({ name: 'id', type: Number, description: 'Identificador do modelo' })
  @ApiOkResponse({ description: 'Modelo atualizado com sucesso' })
  @ApiNotFoundResponse({ description: 'Modelo nao encontrado' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateModelDto) {
    return this.modelsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um modelo' })
  @ApiParam({ name: 'id', type: Number, description: 'Identificador do modelo' })
  @ApiNoContentResponse({ description: 'Modelo removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Modelo nao encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.modelsService.remove(id);
  }
}
