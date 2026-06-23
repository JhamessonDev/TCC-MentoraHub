import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ModalidadeSessao } from '../sessao.entity';

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
