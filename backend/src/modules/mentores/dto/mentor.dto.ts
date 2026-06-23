import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsNumber, IsString, IsOptional, IsBoolean,
  IsUrl, Min, Max, IsInt, MaxLength,
  IsArray, ArrayNotEmpty,
} from 'class-validator';

// ── CREATE ───────────────────────────────────────
export class CreateMentorDto {
  @ApiProperty({ description: 'ID do usuário vinculado ao perfil de mentor', example: 2 })
  @IsInt()
  @Min(1)
  usuarioId: number;

  @ApiPropertyOptional({ description: 'Apresentação do mentor', example: 'PM com 8 anos de experiência...' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @ApiProperty({ description: 'Preço por hora em R$', example: 150.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999.99)
  precoHora: number;

  @ApiPropertyOptional({ description: 'Anos de experiência profissional', example: 8 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(60)
  anosExperiencia?: number;

  @ApiPropertyOptional({ description: 'URL do LinkedIn', example: 'linkedin.com/in/analima' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  linkedinUrl?: string;

  @ApiPropertyOptional({ description: 'IDs das especialidades do mentor', example: [1, 4, 6] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  especialidadeIds?: number[];
}

// ── UPDATE ───────────────────────────────────────
// PartialType torna todos os campos opcionais automaticamente
export class UpdateMentorDto extends PartialType(CreateMentorDto) {}

// ── QUERY (filtros de busca) ──────────────────────
export class QueryMentorDto {
  @ApiPropertyOptional({ description: 'Filtrar por especialidade (ID)', example: 1 })
  @IsOptional()
  @IsInt()
  especialidadeId?: number;

  @ApiPropertyOptional({ description: 'Preço máximo por hora', example: 200 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  precoMax?: number;

  @ApiPropertyOptional({ description: 'Avaliação mínima (1-5)', example: 4 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  avaliacaoMin?: number;

  @ApiPropertyOptional({ description: 'Retornar apenas mentores aprovados', example: true })
  @IsOptional()
  @IsBoolean()
  aprovado?: boolean;

  @ApiPropertyOptional({ description: 'Página (paginação)', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Itens por página', example: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

// ── APROVAR ──────────────────────────────────────
export class AprovarMentorDto {
  @ApiProperty({ description: 'Aprovar ou reprovar o mentor', example: true })
  @IsBoolean()
  aprovado: boolean;
}
