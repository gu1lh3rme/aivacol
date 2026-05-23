import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({
    example: 'ABC1D23',
    minLength: 7,
    maxLength: 8,
    description: 'Placa no padrao Mercosul ou antigo',
  })
  @IsString()
  @MinLength(7)
  @MaxLength(8)
  @Matches(/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$|^[A-Z]{3}-?[0-9]{4}$/)
  plate!: string;

  @ApiProperty({ example: 1, minimum: 1, description: 'Id da marca' })
  @IsInt()
  @Min(1)
  brandId!: number;

  @ApiProperty({ example: 3, minimum: 1, description: 'Id do modelo' })
  @IsInt()
  @Min(1)
  modelId!: number;

  @ApiProperty({ example: 2024, minimum: 1900, maximum: 2100, description: 'Ano do veiculo' })
  @IsInt()
  @Min(1900)
  @Max(2100)
  year!: number;

  @ApiProperty({ example: 'Branco', maxLength: 30, description: 'Cor do veiculo' })
  @IsString()
  @MaxLength(30)
  color!: string;

  @ApiPropertyOptional({
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
    description: 'Imagem opcional em URL ou base64',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: 35000, minimum: 0, description: 'Quilometragem atual' })
  @IsInt()
  @Min(0)
  mileage!: number;
}
