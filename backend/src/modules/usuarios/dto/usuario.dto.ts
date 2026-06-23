import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsEmail, MinLength, IsEnum, IsOptional, MaxLength,
} from 'class-validator';
import { TipoUsuario } from '../usuario.entity';

export class CreateUsuarioDto {
  @ApiProperty({ description: 'Nome completo do usuário', example: 'Ana Lima' })
  @IsString()
  @MaxLength(120)
  nome: string;

  @ApiProperty({ description: 'E-mail do usuário', example: 'ana@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Senha (mínimo 6 caracteres)', example: '123456' })
  @IsString()
  @MinLength(6)
  senha: string;

  @ApiPropertyOptional({
    description: 'Tipo do usuário',
    enum: [TipoUsuario.MENTOR, TipoUsuario.MENTORANDO],
    default: TipoUsuario.MENTORANDO,
  })
  @IsOptional()
  @IsEnum([TipoUsuario.MENTOR, TipoUsuario.MENTORANDO], {
    message: 'tipoUsuario deve ser mentor ou mentorando',
  })
  tipoUsuario?: TipoUsuario = TipoUsuario.MENTORANDO;
}
