import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Sessao, StatusSessao } from './sessao.entity';
import { Mentor } from '../mentores/mentor.entity';
import { CancelarSessaoDto, CreateSessaoDto } from './dto/sessao.dto';

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

  async cancelar(id: number, usuarioId: number, dto: CancelarSessaoDto): Promise<Sessao> {
    const sessao = await this.sessaoRepo.findOne({ where: { id } });
    if (!sessao) throw new NotFoundException(`Sessão com ID ${id} não encontrada`);

    const isMentorando = sessao.mentorandoId === usuarioId;
    let isMentor = false;
    if (!isMentorando) {
      const mentor = await this.mentorRepo.findOne({ where: { usuarioId } });
      isMentor = !!mentor && mentor.id === sessao.mentorId;
    }

    if (!isMentorando && !isMentor) {
      throw new ForbiddenException('Você não tem permissão para cancelar esta sessão');
    }

    if (sessao.status === StatusSessao.REALIZADA || sessao.status === StatusSessao.CANCELADA) {
      throw new BadRequestException(`Sessão com status '${sessao.status}' não pode ser cancelada`);
    }

    const notas = dto.observacao
      ? `Motivo: ${dto.motivo} | Observação: ${dto.observacao}`
      : `Motivo: ${dto.motivo}`;

    await this.sessaoRepo.update(id, { status: StatusSessao.CANCELADA, notas });

    return this.sessaoRepo.findOne({ where: { id } }) as Promise<Sessao>;
  }

  async getMetricas(periodo: string) {
    const dias = parseInt(periodo);

    const evolucaoRaw = await this.sessaoRepo
      .createQueryBuilder('s')
      .select('DATE(s.data_hora)', 'data')
      .addSelect('COUNT(*)', 'sessoes')
      .addSelect('COALESCE(SUM(s.valor), 0)', 'receita')
      .where('s.data_hora >= DATE_SUB(NOW(), INTERVAL :dias DAY)', { dias })
      .groupBy('DATE(s.data_hora)')
      .orderBy('DATE(s.data_hora)', 'ASC')
      .getRawMany();

    const totalAtual = await this.sessaoRepo
      .createQueryBuilder('s')
      .select('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(s.valor), 0)', 'receita')
      .where('s.data_hora >= DATE_SUB(NOW(), INTERVAL :dias DAY)', { dias })
      .getRawOne();

    const totalAnterior = await this.sessaoRepo
      .createQueryBuilder('s')
      .select('COUNT(*)', 'count')
      .where('s.data_hora >= DATE_SUB(NOW(), INTERVAL :diasDuplo DAY)', { diasDuplo: dias * 2 })
      .andWhere('s.data_hora < DATE_SUB(NOW(), INTERVAL :dias DAY)', { dias })
      .getRawOne();

    const totalSessoesPeriodo = parseInt(totalAtual.count);
    const totalReceitaPeriodo = parseFloat(totalAtual.receita);
    const sessoesAnterior     = parseInt(totalAnterior.count);

    const comparativoAnterior = sessoesAnterior > 0
      ? Math.round(((totalSessoesPeriodo - sessoesAnterior) / sessoesAnterior) * 10000) / 100
      : totalSessoesPeriodo > 0 ? 100 : 0;

    return {
      evolucaoSessoes: evolucaoRaw.map(r => ({
        data:    r.data instanceof Date ? r.data.toISOString().split('T')[0] : String(r.data),
        sessoes: parseInt(r.sessoes),
        receita: parseFloat(r.receita),
      })),
      totalSessoesPeriodo,
      totalReceitaPeriodo,
      comparativoAnterior,
    };
  }
}
