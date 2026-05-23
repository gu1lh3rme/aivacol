import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateModelDto {
  @ApiProperty({ example: 'Corolla XEi', maxLength: 80, description: 'Nome do modelo' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;

  @ApiProperty({ example: 1, minimum: 1, description: 'Id da marca vinculada' })
  @IsInt()
  @Min(1)
  brandId!: number;
}
