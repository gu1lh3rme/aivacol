import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBrandDto {
  @ApiProperty({ example: 'Toyota', maxLength: 60, description: 'Nome da marca' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name!: string;
}
