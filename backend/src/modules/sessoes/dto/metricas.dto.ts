import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum PeriodoMetricas {
  SETE_DIAS    = '7d',
  TRINTA_DIAS  = '30d',
  NOVENTA_DIAS = '90d',
}

export class QueryMetricasDto {
  @IsOptional()
  @IsEnum(PeriodoMetricas)
  @ApiPropertyOptional({ enum: PeriodoMetricas, default: PeriodoMetricas.TRINTA_DIAS, description: 'Período de análise' })
  periodo?: PeriodoMetricas = PeriodoMetricas.TRINTA_DIAS;
}
