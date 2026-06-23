import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

import { MentoresController } from '../../src/modules/mentores/mentores.controller';
import { MentoresService } from '../../src/modules/mentores/mentores.service';
import { Mentor } from '../../src/modules/mentores/mentor.entity';
import { Especialidade } from '../../src/modules/especialidades/especialidade.entity';
import { LoggingInterceptor } from '../../src/common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';
import { JwtAuthGuard } from '../../src/modules/auth/guards/jwt-auth.guard';
import { makeMentor, makeCreateMentorDto } from '../helpers/mentor.factory';

// ── Mock logger ──────────────────────────────────
const mockLogger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() };

// ── Mock repositórios ────────────────────────────
const mockMentorRepo = {
  findOne:   jest.fn(),
  create:    jest.fn(),
  save:      jest.fn(),
  remove:    jest.fn(),
  findBy:    jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere:          jest.fn().mockReturnThis(),
    orderBy:           jest.fn().mockReturnThis(),
    skip:              jest.fn().mockReturnThis(),
    take:              jest.fn().mockReturnThis(),
    getManyAndCount:   jest.fn().mockResolvedValue([[], 0]),
  }),
};

const mockEspecialidadeRepo = { findBy: jest.fn() };

// ════════════════════════════════════════════════
describe('MentoresController — Testes de Integração', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MentoresController],
      providers: [
        MentoresService,
        { provide: getRepositoryToken(Mentor),        useValue: mockMentorRepo },
        { provide: getRepositoryToken(Especialidade), useValue: mockEspecialidadeRepo },
        { provide: WINSTON_MODULE_PROVIDER,           useValue: mockLogger },
        { provide: APP_INTERCEPTOR,                   useClass: LoggingInterceptor },
        { provide: APP_FILTER,                        useClass: HttpExceptionFilter },
      ],
    })
      // Endpoints de escrita exigem JWT; aqui testamos apenas a lógica do serviço
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(() => app.close());
  afterEach(() => jest.clearAllMocks());

  // ── GET /mentores ─────────────────────────────
  describe('GET /mentores', () => {
    it('deve retornar status 200 e lista paginada', async () => {
      // Arrange
      const mentores = [makeMentor({ id: 1 }), makeMentor({ id: 2, usuarioId: 2 })];
      mockMentorRepo.createQueryBuilder().getManyAndCount.mockResolvedValue([mentores, 2]);

      // Act
      const res = await request(app.getHttpServer()).get('/mentores');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(res.headers).toHaveProperty('x-trace-id'); // trace ID no header
    });
  });

  // ── GET /mentores/:id ─────────────────────────
  describe('GET /mentores/:id', () => {
    it('deve retornar status 200 quando mentor existe', async () => {
      // Arrange
      const mentor = makeMentor({ id: 1 });
      mockMentorRepo.findOne.mockResolvedValue(mentor);

      // Act
      const res = await request(app.getHttpServer()).get('/mentores/1');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(1);
    });

    it('deve retornar status 404 quando mentor não existe', async () => {
      // Arrange
      mockMentorRepo.findOne.mockResolvedValue(null);

      // Act
      const res = await request(app.getHttpServer()).get('/mentores/999');

      // Assert
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('traceId'); // erro padronizado com traceId
    });

    it('deve retornar status 400 quando ID não é número', async () => {
      // Act
      const res = await request(app.getHttpServer()).get('/mentores/abc');

      // Assert
      expect(res.status).toBe(400);
    });
  });

  // ── POST /mentores ────────────────────────────
  describe('POST /mentores', () => {
    it('deve criar mentor e retornar status 201', async () => {
      // Arrange
      const dto    = makeCreateMentorDto();
      const mentor = makeMentor({ usuarioId: dto.usuarioId });

      mockMentorRepo.findOne.mockResolvedValue(null);
      mockEspecialidadeRepo.findBy.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      mockMentorRepo.create.mockReturnValue(mentor);
      mockMentorRepo.save.mockResolvedValue(mentor);

      // Act
      const res = await request(app.getHttpServer())
        .post('/mentores')
        .send(dto);

      // Assert
      expect(res.status).toBe(201);
      expect(res.body.usuarioId).toBe(dto.usuarioId);
    });

    it('deve retornar status 409 quando mentor já existe para o usuário', async () => {
      // Arrange
      const dto    = makeCreateMentorDto();
      const mentor = makeMentor({ usuarioId: dto.usuarioId });
      mockMentorRepo.findOne.mockResolvedValue(mentor); // já existe

      // Act
      const res = await request(app.getHttpServer())
        .post('/mentores')
        .send(dto);

      // Assert
      expect(res.status).toBe(409);
    });

    it('deve retornar status 400 quando body está inválido', async () => {
      // Act — envia body sem campos obrigatórios
      const res = await request(app.getHttpServer())
        .post('/mentores')
        .send({ bio: 'sem usuarioId e precoHora' });

      // Assert
      expect(res.status).toBe(400);
    });
  });

  // ── PUT /mentores/:id ─────────────────────────
  describe('PUT /mentores/:id', () => {
    it('deve atualizar mentor e retornar status 200', async () => {
      // Arrange
      const mentor     = makeMentor({ id: 1 });
      const atualizado = makeMentor({ id: 1, precoHora: 200 });

      mockMentorRepo.findOne.mockResolvedValue(mentor);
      mockMentorRepo.save.mockResolvedValue(atualizado);

      // Act
      const res = await request(app.getHttpServer())
        .put('/mentores/1')
        .send({ precoHora: 200 });

      // Assert
      expect(res.status).toBe(200);
    });

    it('deve retornar status 404 ao atualizar mentor inexistente', async () => {
      // Arrange
      mockMentorRepo.findOne.mockResolvedValue(null);

      // Act
      const res = await request(app.getHttpServer())
        .put('/mentores/999')
        .send({ precoHora: 200 });

      // Assert
      expect(res.status).toBe(404);
    });
  });

  // ── PATCH /mentores/:id/aprovar ───────────────
  describe('PATCH /mentores/:id/aprovar', () => {
    it('deve aprovar mentor e retornar status 200', async () => {
      // Arrange
      const mentor   = makeMentor({ id: 1, aprovado: false });
      const aprovado = makeMentor({ id: 1, aprovado: true });

      mockMentorRepo.findOne.mockResolvedValue(mentor);
      mockMentorRepo.save.mockResolvedValue(aprovado);

      // Act
      const res = await request(app.getHttpServer())
        .patch('/mentores/1/aprovar')
        .send({ aprovado: true });

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.aprovado).toBe(true);
    });
  });

  // ── DELETE /mentores/:id ──────────────────────
  describe('DELETE /mentores/:id', () => {
    it('deve remover mentor e retornar status 204', async () => {
      // Arrange
      const mentor = makeMentor({ id: 1 });
      mockMentorRepo.findOne.mockResolvedValue(mentor);
      mockMentorRepo.remove.mockResolvedValue(undefined);

      // Act
      const res = await request(app.getHttpServer()).delete('/mentores/1');

      // Assert
      expect(res.status).toBe(204);
    });

    it('deve retornar status 404 ao deletar mentor inexistente', async () => {
      // Arrange
      mockMentorRepo.findOne.mockResolvedValue(null);

      // Act
      const res = await request(app.getHttpServer()).delete('/mentores/999');

      // Assert
      expect(res.status).toBe(404);
    });
  });
});
