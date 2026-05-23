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
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehiclesService } from './vehicles.service';

@ApiTags('Vehicles')
@ApiBearerAuth('access-token')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo veiculo' })
  @ApiCreatedResponse({ description: 'Veiculo criado com sucesso' })
  create(@Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista veiculos com filtros e paginacao' })
  @ApiQuery({ name: 'plate', required: false, description: 'Filtro por placa' })
  @ApiQuery({ name: 'brand', required: false, description: 'Filtro por nome da marca' })
  @ApiQuery({ name: 'model', required: false, description: 'Filtro por nome do modelo' })
  @ApiQuery({ name: 'page', required: false, description: 'Pagina atual', example: '1' })
  @ApiQuery({ name: 'pageSize', required: false, description: 'Itens por pagina', example: '10' })
  @ApiOkResponse({ description: 'Lista de veiculos retornada com sucesso' })
  findAll(
    @Query('plate') plate?: string,
    @Query('brand') brand?: string,
    @Query('model') model?: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
  ) {
    return this.vehiclesService.findAll({
      plate,
      brand,
      model,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca veiculo por id' })
  @ApiParam({ name: 'id', type: Number, description: 'Identificador do veiculo' })
  @ApiOkResponse({ description: 'Veiculo encontrado' })
  @ApiNotFoundResponse({ description: 'Veiculo nao encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza dados de um veiculo' })
  @ApiParam({ name: 'id', type: Number, description: 'Identificador do veiculo' })
  @ApiOkResponse({ description: 'Veiculo atualizado com sucesso' })
  @ApiNotFoundResponse({ description: 'Veiculo nao encontrado' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um veiculo' })
  @ApiParam({ name: 'id', type: Number, description: 'Identificador do veiculo' })
  @ApiNoContentResponse({ description: 'Veiculo removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Veiculo nao encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.remove(id);
  }
}
