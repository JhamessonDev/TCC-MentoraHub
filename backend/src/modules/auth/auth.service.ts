import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../usuarios/usuario.entity';
import { LoginDto, AuthResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const usuario = await this.usuarioRepo
      .createQueryBuilder('u')
      .addSelect('u.senha')
      .where('u.email = :email', { email: dto.email })
      .andWhere('u.ativo = true')
      .getOne();

    if (!usuario) throw new UnauthorizedException('Credenciais inválidas');

    const senhaValida = await bcrypt.compare(dto.password, usuario.senha);
    if (!senhaValida) throw new UnauthorizedException('Credenciais inválidas');

    const payload = { sub: usuario.id, email: usuario.email, tipoUsuario: usuario.tipoUsuario };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipoUsuario: usuario.tipoUsuario,
        avatarUrl: usuario.avatarUrl ?? null,
      },
    };
  }

  async getProfile(userId: number) {
    const usuario = await this.usuarioRepo.findOne({
      where: { id: userId, ativo: true },
      select: ['id', 'nome', 'email', 'tipoUsuario', 'avatarUrl', 'createdAt'],
    });

    if (!usuario) throw new UnauthorizedException('Usuário não encontrado');
    return usuario;
  }
}
