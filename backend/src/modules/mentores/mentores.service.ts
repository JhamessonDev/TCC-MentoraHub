import {
  Injectable, NotFoundException, ConflictException,
  BadRequestException, Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { Mentor } from './mentor.entity';
import { Especialidade } from '../especialidades/especialidade.entity';
import { CreateMentorDto, UpdateMentorDto, QueryMentorDto, AprovarMentorDto } from './dto/mentor.dto';

@Injectable()
export class MentoresService {
  constructor(
    @InjectRepository(Mentor)
    private readonly mentorRepo: Repository<Mentor>,

    @InjectRepository(Especialidade)
    private readonly especialidadeRepo: Repository<Especialidade>,

    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  // ── CREATE ─────────────────────────────────────
  async create(dto: CreateMentorDto, traceId?: string): Promise<Mentor> {
    this.logger.info('Criando mentor', { traceId, usuarioId: dto.usuarioId, context: 'MentoresService' });

    // Verifica se já existe mentor para este usuário
    const existe = await this.mentorRepo.findOne({ where: { usuarioId: dto.usuarioId } });
    if (existe) {
      throw new ConflictException(`Já existe um perfil de mentor para o usuário ${dto.usuarioId}`);
    }

    // Busca especialidades se informadas
    let especialidades: Especialidade[] = [];
    if (dto.especialidadeIds?.length) {
      especialidades = await this.buscarEspecialidades(dto.especialidadeIds);
    }

    const mentor = this.mentorRepo.create({
      usuarioId:        dto.usuarioId,
      bio:              dto.bio,
      precoHora:        dto.precoHora,
      anosExperiencia:  dto.anosExperiencia ?? 0,
      linkedinUrl:      dto.linkedinUrl,
      especialidades,
    });

    const salvo = await this.mentorRepo.save(mentor);
    this.logger.info('Mentor criado com sucesso', { traceId, mentorId: salvo.id, context: 'MentoresService' });
    return salvo;
  }

  // ── FIND ALL (com filtros e paginação) ──────────
  async findAll(query: QueryMentorDto, traceId?: string): Promise<{ data: Mentor[]; total: number; page: number; limit: number }> {
    this.logger.info('Buscando mentores', { traceId, query, context: 'MentoresService' });

    const { especialidadeId, precoMax, avaliacaoMin, aprovado, page = 1, limit = 10 } = query;

    const qb = this.mentorRepo.createQueryBuilder('mentor')
      .leftJoinAndSelect('mentor.usuario', 'u')
      .leftJoinAndSelect('mentor.especialidades', 'e');

    // Filtros dinâmicos
    if (aprovado !== undefined)  qb.andWhere('mentor.aprovado = :aprovado', { aprovado });
    if (precoMax !== undefined)  qb.andWhere('mentor.precoHora <= :precoMax', { precoMax });
    if (avaliacaoMin !== undefined) qb.andWhere('mentor.avaliacaoMedia >= :avaliacaoMin', { avaliacaoMin });
    if (especialidadeId)         qb.andWhere('e.id = :especialidadeId', { especialidadeId });

    // Paginação
    const [data, total] = await qb
      .orderBy('mentor.avaliacaoMedia', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  // ── FIND ONE ────────────────────────────────────
  async findOne(id: number, traceId?: string): Promise<Mentor> {
    this.logger.info('Buscando mentor por ID', { traceId, mentorId: id, context: 'MentoresService' });

    const mentor = await this.mentorRepo.findOne({
      where: { id },
      relations: ['usuario', 'especialidades'],
    });

    if (!mentor) {
      throw new NotFoundException(`Mentor com ID ${id} não encontrado`);
    }

    return mentor;
  }

  // ── UPDATE ──────────────────────────────────────
  async update(id: number, dto: UpdateMentorDto, traceId?: string): Promise<Mentor> {
    this.logger.info('Atualizando mentor', { traceId, mentorId: id, context: 'MentoresService' });

    const mentor = await this.findOne(id, traceId);

    // Atualiza especialidades se informadas
    if (dto.especialidadeIds !== undefined) {
      mentor.especialidades = await this.buscarEspecialidades(dto.especialidadeIds);
    }

    // Atualiza campos simples
    Object.assign(mentor, {
      bio:             dto.bio             ?? mentor.bio,
      precoHora:       dto.precoHora       ?? mentor.precoHora,
      anosExperiencia: dto.anosExperiencia ?? mentor.anosExperiencia,
      linkedinUrl:     dto.linkedinUrl     ?? mentor.linkedinUrl,
    });

    const atualizado = await this.mentorRepo.save(mentor);
    this.logger.info('Mentor atualizado', { traceId, mentorId: id, context: 'MentoresService' });
    return atualizado;
  }

  // ── APROVAR / REPROVAR (admin) ──────────────────
  async aprovar(id: number, dto: AprovarMentorDto, traceId?: string): Promise<Mentor> {
    this.logger.info('Alterando aprovação de mentor', { traceId, mentorId: id, aprovado: dto.aprovado, context: 'MentoresService' });

    const mentor = await this.findOne(id, traceId);
    mentor.aprovado = dto.aprovado;
    return this.mentorRepo.save(mentor);
  }

  // ── DELETE ──────────────────────────────────────
  async remove(id: number, traceId?: string): Promise<void> {
    this.logger.info('Removendo mentor', { traceId, mentorId: id, context: 'MentoresService' });

    const mentor = await this.findOne(id, traceId);
    await this.mentorRepo.remove(mentor);
    this.logger.info('Mentor removido', { traceId, mentorId: id, context: 'MentoresService' });
  }

  // ── HELPER PRIVADO ──────────────────────────────
  private async buscarEspecialidades(ids: number[]): Promise<Especialidade[]> {
    if (!ids.length) return [];
    const especialidades = await this.especialidadeRepo.findBy({ id: In(ids) });
    if (especialidades.length !== ids.length) {
      const encontrados = especialidades.map((e) => e.id);
      const naoEncontrados = ids.filter((id) => !encontrados.includes(id));
      throw new BadRequestException(`Especialidades não encontradas: ${naoEncontrados.join(', ')}`);
    }
    return especialidades;
  }
}
