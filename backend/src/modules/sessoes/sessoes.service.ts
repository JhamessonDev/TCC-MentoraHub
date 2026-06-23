import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Sessao, StatusSessao } from './sessao.entity';
import { Mentor } from '../mentores/mentor.entity';
import { CreateSessaoDto } from './dto/sessao.dto';

@Injectable()
export class SessoesService {
  constructor(
    @InjectRepository(Sessao)
    private readonly sessaoRepo: Repository<Sessao>,

    @InjectRepository(Mentor)
    private readonly mentorRepo: Repository<Mentor>,
  ) {}

  async create(dto: CreateSessaoDto): Promise<Sessao> {
    const sessao = this.sessaoRepo.create({
      mentorId:    dto.mentorId,
      mentorandoId: dto.mentorandoId,
      dataHora:    new Date(dto.dataHora),
      duracaoMin:  dto.duracaoMin,
      modalidade:  dto.modalidade,
      objetivo:    dto.objetivo,
      valor:       dto.valor,
      status:      StatusSessao.AGENDADA,
    });
    return this.sessaoRepo.save(sessao);
  }

  async findByMentorando(usuarioId: number): Promise<Sessao[]> {
    return this.sessaoRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.mentor', 'mentor')
      .leftJoinAndSelect('mentor.usuario', 'mentorUsuario')
      .leftJoinAndSelect('mentor.especialidades', 'esp')
      .where('s.mentorando_id = :usuarioId', { usuarioId })
      .orderBy('s.data_hora', 'DESC')
      .getMany();
  }

  async findByMentor(usuarioId: number): Promise<Sessao[]> {
    const mentor = await this.mentorRepo.findOne({ where: { usuarioId } });
    if (!mentor) throw new NotFoundException('Perfil de mentor não encontrado para este usuário');

    return this.sessaoRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.mentorando', 'mentorando')
      .where('s.mentor_id = :mentorId', { mentorId: mentor.id })
      .orderBy('s.data_hora', 'DESC')
      .getMany();
  }

  async findAll(): Promise<Sessao[]> {
    return this.sessaoRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.mentor', 'mentor')
      .leftJoinAndSelect('mentor.usuario', 'mentorUsuario')
      .leftJoinAndSelect('s.mentorando', 'mentorando')
      .orderBy('s.data_hora', 'DESC')
      .getMany();
  }
}
