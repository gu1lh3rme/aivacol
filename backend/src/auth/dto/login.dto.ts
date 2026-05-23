import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@aivacol.com', description: 'Email do usuario' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'aivacol@123', minLength: 6, description: 'Senha do usuario' })
  @IsString()
  @MinLength(6)
  password!: string;
}
