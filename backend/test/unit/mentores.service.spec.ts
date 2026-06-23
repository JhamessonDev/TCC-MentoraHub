import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

import { MentoresService } from '../../src/modules/mentores/mentores.service';
import { Mentor } from '../../src/modules/mentores/mentor.entity';
import { Especialidade } from '../../src/modules/especialidades/especialidade.entity';
import { makeMentor, makeEspecialidade, makeCreateMentorDto, makeUpdateMentorDto } from '../helpers/mentor.factory';

// ── Mock do logger (evita saída de logs durante testes) ──
const mockLogger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() };

// ── Mock do repositório TypeORM ──────────────────
const mockMentorRepo = () => ({
  findOne:          jest.fn(),
  find:             jest.fn(),
  create:           jest.fn(),
  save:             jest.fn(),
  remove:           jest.fn(),
  findBy:           jest.fn(),
  createQueryBuilder: jest.fn(),
});

const mockEspecialidadeRepo = () => ({
  findBy: jest.fn(),
});

// ════════════════════════════════════════════════
describe('MentoresService — Testes Unitários', () => {
  let service: MentoresService;
  let mentorRepo: ReturnType<typeof mockMentorRepo>;
  let especialidadeRepo: ReturnType<typeof mockEspecialidadeRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MentoresService,
        { provide: getRepositoryToken(Mentor),       useFactory: mockMentorRepo },
        { provide: getRepositoryToken(Especialidade), useFactory: mockEspecialidadeRepo },
        { provide: WINSTON_MODULE_PROVIDER,           useValue: mockLogger },
      ],
    }).compile();

    service             = module.get(MentoresService);
    mentorRepo          = module.get(getRepositoryToken(Mentor));
    especialidadeRepo   = module.get(getRepositoryToken(Especialidade));
  });

  afterEach(() => jest.clearAllMocks());

  // ── CREATE ───────────────────────────────────
  describe('create()', () => {
    it('deve criar mentor com sucesso quando usuário não possui perfil', async () => {
      // Arrange
      const dto        = makeCreateMentorDto();
      const mentor     = makeMentor({ usuarioId: dto.usuarioId });
      const especialidade = makeEspecialidade({ id: 1 });

      mentorRepo.findOne.mockResolvedValue(null);           // não existe ainda
      especialidadeRepo.findBy.mockResolvedValue([especialidade, makeEspecialidade({ id: 2 })]);
      mentorRepo.create.mockReturnValue(mentor);
      mentorRepo.save.mockResolvedValue(mentor);

      // Act
      const resultado = await service.create(dto, 'trace-001');

      // Assert
      expect(resultado).toEqual(mentor);
      expect(mentorRepo.findOne).toHaveBeenCalledWith({ where: { usuarioId: dto.usuarioId } });
      expect(mentorRepo.save).toHaveBeenCalledTimes(1);
    });

    it('deve lançar ConflictException quando usuário já possui perfil de mentor', async () => {
      // Arrange
      const dto    = makeCreateMentorDto();
      const mentor = makeMentor({ usuarioId: dto.usuarioId });
      mentorRepo.findOne.mockResolvedValue(mentor); // já existe

      // Act & Assert
      await expect(service.create(dto, 'trace-002'))
        .rejects.toThrow(ConflictException);
      expect(mentorRepo.save).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException quando especialidade não existe', async () => {
      // Arrange
      const dto = makeCreateMentorDto({ especialidadeIds: [999] }); // ID inválido
      mentorRepo.findOne.mockResolvedValue(null);
      especialidadeRepo.findBy.mockResolvedValue([]); // nenhuma encontrada

      // Act & Assert
      await expect(service.create(dto, 'trace-003'))
        .rejects.toThrow(BadRequestException);
    });
  });

  // ── FIND ONE ─────────────────────────────────
  describe('findOne()', () => {
    it('deve retornar mentor quando ID existe', async () => {
      // Arrange
      const mentor = makeMentor({ id: 1 });
      mentorRepo.findOne.mockResolvedValue(mentor);

      // Act
      const resultado = await service.findOne(1, 'trace-004');

      // Assert
      expect(resultado).toEqual(mentor);
      expect(mentorRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['usuario', 'especialidades'],
      });
    });

    it('deve lançar NotFoundException quando ID não existe', async () => {
      // Arrange
      mentorRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999, 'trace-005'))
        .rejects.toThrow(NotFoundException);
    });
  });

  // ── UPDATE ───────────────────────────────────
  describe('update()', () => {
    it('deve atualizar mentor com novos dados', async () => {
      // Arrange
      const mentor     = makeMentor({ id: 1, precoHora: 150 });
      const dto        = makeUpdateMentorDto({ precoHora: 180 });
      const atualizado = makeMentor({ ...mentor, precoHora: 180 });

      mentorRepo.findOne.mockResolvedValue(mentor);
      mentorRepo.save.mockResolvedValue(atualizado);

      // Act
      const resultado = await service.update(1, dto, 'trace-006');

      // Assert
      expect(resultado.precoHora).toBe(180);
      expect(mentorRepo.save).toHaveBeenCalledTimes(1);
    });

    it('deve lançar NotFoundException ao atualizar mentor inexistente', async () => {
      // Arrange
      mentorRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(999, makeUpdateMentorDto(), 'trace-007'))
        .rejects.toThrow(NotFoundException);
    });
  });

  // ── APROVAR ──────────────────────────────────
  describe('aprovar()', () => {
    it('deve aprovar mentor com sucesso', async () => {
      // Arrange
      const mentor    = makeMentor({ id: 1, aprovado: false });
      const aprovado  = makeMentor({ ...mentor, aprovado: true });

      mentorRepo.findOne.mockResolvedValue(mentor);
      mentorRepo.save.mockResolvedValue(aprovado);

      // Act
      const resultado = await service.aprovar(1, { aprovado: true }, 'trace-008');

      // Assert
      expect(resultado.aprovado).toBe(true);
    });

    it('deve reprovar mentor com sucesso', async () => {
      // Arrange
      const mentor    = makeMentor({ id: 1, aprovado: true });
      const reprovado = makeMentor({ ...mentor, aprovado: false });

      mentorRepo.findOne.mockResolvedValue(mentor);
      mentorRepo.save.mockResolvedValue(reprovado);

      // Act
      const resultado = await service.aprovar(1, { aprovado: false }, 'trace-009');

      // Assert
      expect(resultado.aprovado).toBe(false);
    });
  });

  // ── REMOVE ───────────────────────────────────
  describe('remove()', () => {
    it('deve remover mentor quando ID existe', async () => {
      // Arrange
      const mentor = makeMentor({ id: 1 });
      mentorRepo.findOne.mockResolvedValue(mentor);
      mentorRepo.remove.mockResolvedValue(undefined);

      // Act
      await service.remove(1, 'trace-010');

      // Assert
      expect(mentorRepo.remove).toHaveBeenCalledWith(mentor);
    });

    it('deve lançar NotFoundException ao remover mentor inexistente', async () => {
      // Arrange
      mentorRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(999, 'trace-011'))
        .rejects.toThrow(NotFoundException);
      expect(mentorRepo.remove).not.toHaveBeenCalled();
    });
  });
});
