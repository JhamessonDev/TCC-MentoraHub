import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, UnauthorizedException } from '@nestjs/common';
import * as request from 'supertest';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

import { AuthController } from '../../src/modules/auth/auth.controller';
import { AuthService } from '../../src/modules/auth/auth.service';
import { JwtStrategy } from '../../src/modules/auth/strategies/jwt.strategy';
import { MentoresController } from '../../src/modules/mentores/mentores.controller';
import { MentoresService } from '../../src/modules/mentores/mentores.service';
import { LoggingInterceptor } from '../../src/common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';
import { TipoUsuario } from '../../src/modules/usuarios/usuario.entity';

// ── Constante de teste ───────────────────────────────────────────────────────
const TEST_SECRET = 'mentora-test-secret-2026';

// ── Mocks ────────────────────────────────────────────────────────────────────
const mockAuthService = {
  login:      jest.fn(),
  getProfile: jest.fn(),
};

const mockMentoresService = {
  findAll: jest.fn(),
  create:  jest.fn(),
  findOne: jest.fn(),
  update:  jest.fn(),
  aprovar: jest.fn(),
  remove:  jest.fn(),
};

const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) =>
    key === 'JWT_SECRET' ? TEST_SECRET : null,
  ),
};

const mockLogger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() };

// ════════════════════════════════════════════════════════════════════════════
describe('AuthController — Testes de Integração', () => {
  let app: INestApplication;
  let validToken: string;

  const adminUser = {
    id:          1,
    nome:        'Admin Mentora',
    email:       'admin@mentora.com',
    tipoUsuario: TipoUsuario.ADMIN,
    avatarUrl:   null,
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ secret: TEST_SECRET, signOptions: { expiresIn: '1h' } }),
      ],
      controllers: [AuthController, MentoresController],
      providers: [
        { provide: AuthService,              useValue: mockAuthService     },
        { provide: MentoresService,          useValue: mockMentoresService  },
        { provide: ConfigService,            useValue: mockConfigService    },
        { provide: WINSTON_MODULE_PROVIDER,  useValue: mockLogger           },
        { provide: APP_INTERCEPTOR,          useClass: LoggingInterceptor  },
        { provide: APP_FILTER,               useClass: HttpExceptionFilter  },
        JwtStrategy,
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // Token válido assinado com o mesmo secret que a estratégia usa
    const jwtService = module.get(JwtService);
    validToken = jwtService.sign({
      sub:          adminUser.id,
      email:        adminUser.email,
      tipoUsuario:  adminUser.tipoUsuario,
    });
  });

  afterAll(() => app.close());
  afterEach(() => jest.clearAllMocks());

  // ── Testes de Status ─────────────────────────────────────────────────────
  describe('Testes de Status', () => {
    it('deve retornar 201 quando login com credenciais válidas', async () => {
      // Arrange
      mockAuthService.login.mockResolvedValue({ access_token: validToken, user: adminUser });

      // Act
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@mentora.com', password: 'Mentora@2026' });

      // Assert
      expect(res.status).toBe(201);
    });

    it('deve retornar 401 quando login com senha incorreta', async () => {
      // Arrange
      mockAuthService.login.mockRejectedValue(new UnauthorizedException('Credenciais inválidas'));

      // Act
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@mentora.com', password: 'senha-errada' });

      // Assert
      expect(res.status).toBe(401);
    });

    it('deve retornar 401 quando acessar profile sem token', async () => {
      // Act
      const res = await request(app.getHttpServer()).get('/auth/profile');

      // Assert
      expect(res.status).toBe(401);
    });

    it('deve retornar 200 quando acessar profile com token válido', async () => {
      // Arrange
      mockAuthService.getProfile.mockResolvedValue({
        id:          adminUser.id,
        nome:        adminUser.nome,
        email:       adminUser.email,
        tipoUsuario: adminUser.tipoUsuario,
        avatarUrl:   null,
        createdAt:   new Date('2026-01-01'),
      });

      // Act
      const res = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${validToken}`);

      // Assert
      expect(res.status).toBe(200);
    });
  });

  // ── Testes de Schema ─────────────────────────────────────────────────────
  describe('Testes de Schema', () => {
    it('deve retornar access_token e user no body quando login bem-sucedido', async () => {
      // Arrange
      mockAuthService.login.mockResolvedValue({ access_token: validToken, user: adminUser });

      // Act
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@mentora.com', password: 'Mentora@2026' });

      // Assert
      expect(res.body).toHaveProperty('access_token');
      expect(res.body).toHaveProperty('user');
      expect(typeof res.body.access_token).toBe('string');
      expect(res.body.access_token.split('.')).toHaveLength(3); // formato JWT: header.payload.signature
    });

    it('deve retornar id, email e tipoUsuario no profile', async () => {
      // Arrange
      mockAuthService.getProfile.mockResolvedValue({
        id:          adminUser.id,
        nome:        adminUser.nome,
        email:       adminUser.email,
        tipoUsuario: adminUser.tipoUsuario,
        avatarUrl:   null,
        createdAt:   new Date('2026-01-01'),
      });

      // Act
      const res = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${validToken}`);

      // Assert
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email');
      expect(res.body).toHaveProperty('tipoUsuario');
    });
  });

  // ── Testes de Contrato (DTO) ──────────────────────────────────────────────
  describe('Testes de Contrato (DTO)', () => {
    it('deve retornar 400 quando login sem email', async () => {
      // Act
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ password: 'Mentora@2026' });

      // Assert
      expect(res.status).toBe(400);
    });

    it('deve retornar 400 quando login sem password', async () => {
      // Act
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@mentora.com' });

      // Assert
      expect(res.status).toBe(400);
    });

    it('deve retornar 400 quando email inválido', async () => {
      // Act
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nao-e-um-email', password: 'Mentora@2026' });

      // Assert
      expect(res.status).toBe(400);
    });
  });

  // ── Testes de Negócio ─────────────────────────────────────────────────────
  describe('Testes de Negócio', () => {
    it('deve retornar tipoUsuario admin quando login com usuário admin', async () => {
      // Arrange
      mockAuthService.login.mockResolvedValue({ access_token: validToken, user: adminUser });

      // Act
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@mentora.com', password: 'Mentora@2026' });

      // Assert
      expect(res.body.user.tipoUsuario).toBe(TipoUsuario.ADMIN);
    });

    it('deve bloquear POST /mentores quando usuário não autenticado', async () => {
      // Act
      const res = await request(app.getHttpServer())
        .post('/mentores')
        .send({ usuarioId: 1, bio: 'Bio teste', precoHora: 100 });

      // Assert
      expect(res.status).toBe(401);
    });

    it('deve permitir GET /mentores sem autenticação', async () => {
      // Arrange
      mockMentoresService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 10 });

      // Act
      const res = await request(app.getHttpServer()).get('/mentores');

      // Assert
      expect(res.status).toBe(200);
    });
  });
});
