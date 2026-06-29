import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ModalidadeSessao } from '../sessao.entity';

export enum MotivoCancelamento {
  CONFLITO_AGENDA  = 'conflito_agenda',
  PROBLEMA_TECNICO = 'problema_tecnico',
  MOTIVO_PESSOAL   = 'motivo_pessoal',
  REMARCAR         = 'remarcar',
  OUTROS           = 'outros',
}

export class CancelarSessaoDto {
  @IsEnum(MotivoCancelamento)
  motivo: MotivoCancelamento;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacao?: string;
}

export class CreateSessaoDto {
  @IsInt()
  mentorId: number;

  @IsOptional()
  @IsInt()
  mentorandoId: number;

  @IsDateString()
  dataHora: string;

  @IsInt()
  @Min(15)
  duracaoMin: number;

  @IsEnum(ModalidadeSessao)
  modalidade: ModalidadeSessao;

  @IsOptional()
  @IsString()
  objetivo?: string;

  @IsNumber()
  @Min(0)
  valor: number;
}
