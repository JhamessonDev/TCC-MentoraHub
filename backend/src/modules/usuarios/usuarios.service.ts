import { Injectable, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Usuario } from './usuario.entity';
import { CreateUsuarioDto } from './dto/usuario.dto';

type UsuarioSemSenha = Omit<Usuario, 'senha'>;

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,

    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  async create(dto: CreateUsuarioDto): Promise<UsuarioSemSenha> {
    this.logger.info('Cadastrando usuário', { email: dto.email, context: 'UsuariosService' });

    const existe = await this.usuarioRepo.findOne({ where: { email: dto.email } });
    if (existe) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const senhaHash = await bcrypt.hash(dto.senha, 10);

    const usuario = this.usuarioRepo.create({
      nome:        dto.nome,
      email:       dto.email,
      senha:       senhaHash,
      tipoUsuario: dto.tipoUsuario,
    });

    const salvo = await this.usuarioRepo.save(usuario);
    this.logger.info('Usuário cadastrado', { usuarioId: salvo.id, context: 'UsuariosService' });

    const { senha: _, ...result } = salvo;
    return result;
  }

  async findAll(): Promise<UsuarioSemSenha[]> {
    return this.usuarioRepo.find({
      select: ['id', 'nome', 'email', 'tipoUsuario', 'ativo', 'avatarUrl', 'createdAt', 'updatedAt'],
      order: { createdAt: 'DESC' },
    });
  }

  async toggleStatus(id: number): Promise<UsuarioSemSenha> {
    const usuario = await this.usuarioRepo.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException(`Usuário com ID ${id} não encontrado`);

    await this.usuarioRepo.update(id, { ativo: !usuario.ativo });

    return this.usuarioRepo.findOne({
      where: { id },
      select: ['id', 'nome', 'email', 'tipoUsuario', 'ativo', 'avatarUrl', 'createdAt', 'updatedAt'],
    }) as Promise<UsuarioSemSenha>;
  }
}
