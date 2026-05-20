import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateModelDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;

  @IsInt()
  @Min(1)
  brandId!: number;
}
