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

export class CreateVehicleDto {
  @IsString()
  @MinLength(7)
  @MaxLength(8)
  @Matches(/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$|^[A-Z]{3}-?[0-9]{4}$/)
  plate!: string;

  @IsInt()
  @Min(1)
  brandId!: number;

  @IsInt()
  @Min(1)
  modelId!: number;

  @IsInt()
  @Min(1900)
  @Max(2100)
  year!: number;

  @IsString()
  @MaxLength(30)
  color!: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsInt()
  @Min(0)
  mileage!: number;
}
