import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Logger (Winston → Kibana)
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Prefixo global
  app.setGlobalPrefix(process.env.API_PREFIX ?? 'api/v1');

  // Validação global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,         // remove campos não declarados no DTO
      forbidNonWhitelisted: true,
      transform: true,         // converte tipos automaticamente
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? false : '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Mentora API')
    .setDescription('API da Plataforma de Mentoria — TCC ADS 2026')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Autenticação e autorização')
    .addTag('Usuarios', 'Gerenciamento de usuários')
    .addTag('Mentores', 'Gerenciamento de mentores')
    .addTag('Especialidades', 'Áreas de conhecimento')
    .addTag('Sessoes', 'Agendamentos de mentoria')
    .addTag('Avaliacoes', 'Avaliações pós-sessão')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Mentora API rodando em: http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger disponível em: http://localhost:${port}/docs`);
}

bootstrap();
