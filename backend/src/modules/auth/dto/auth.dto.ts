import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TipoUsuario } from '../../usuarios/usuario.entity';

export class LoginDto {
  @ApiProperty({ example: 'admin@mentora.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Mentora@2026' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class AuthUserDto {
  id: number;
  nome: string;
  email: string;
  tipoUsuario: TipoUsuario;
  avatarUrl: string | null;
}

export class AuthResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  user: AuthUserDto;
}
