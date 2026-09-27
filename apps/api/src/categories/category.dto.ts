import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsHexColor, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Nome da categoria', example: 'Trabalho', minLength: 2, maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'O nome deve ter no mínimo 2 caracteres.' })
  @MaxLength(50, { message: 'O nome deve ter no máximo 50 caracteres.' })
  name!: string;

  @ApiPropertyOptional({ description: 'Cor em hexadecimal', example: '#3B82F6', default: '#3B82F6' })
  @IsOptional()
  @IsHexColor({ message: 'A cor deve ser um hexadecimal válido, ex: #3B82F6.' })
  color?: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ description: 'Nome da categoria', minLength: 2, maxLength: 50 })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'O nome deve ter no mínimo 2 caracteres.' })
  @MaxLength(50, { message: 'O nome deve ter no máximo 50 caracteres.' })
  name?: string;

  @ApiPropertyOptional({ description: 'Cor em hexadecimal' })
  @IsOptional()
  @IsHexColor({ message: 'A cor deve ser um hexadecimal válido, ex: #3B82F6.' })
  color?: string;
}

export class CategoryDto {
  @ApiProperty({ description: 'Identificador único da categoria' })
  id!: string;

  @ApiProperty({ description: 'Nome da categoria' })
  name!: string;

  @ApiProperty({ description: 'Cor em hexadecimal' })
  color!: string;

  @ApiProperty({ description: 'Data de criação' })
  createdAt!: string;

  @ApiProperty({ description: 'Data de última atualização' })
  updatedAt!: string;
}