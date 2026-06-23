import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { createElasticsearchTransport } from './config/logger.config';

import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

import { AuthModule } from './modules/auth/auth.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { MentoresModule } from './modules/mentores/mentores.module';
// import { EspecialidadesModule } from './modules/especialidades/especialidades.module';
import { SessoesModule } from './modules/sessoes/sessoes.module';
// import { AvaliacoesModule } from './modules/avaliacoes/avaliacoes.module';

@Module({
  imports: [
    // Variáveis de ambiente
    ConfigModule.forRoot({ isGlobal: true }),

    // Banco de dados
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/**/*{.ts,.js}'],
        charset: 'utf8mb4',
        timezone: 'Z',
        extra: {
          charset: 'utf8mb4_unicode_ci',
        },
        synchronize: config.get('NODE_ENV') === 'development', // nunca em produção!
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),

    // Logger Winston → Console + Arquivo + Elasticsearch/Kibana
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transports: [
          // Console (desenvolvimento)
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.colorize(),
              winston.format.printf(({ timestamp, level, message, context, traceId }) =>
                `${timestamp} [${level}] [${context ?? 'App'}] ${traceId ? `[trace:${traceId}]` : ''} ${message}`,
              ),
            ),
          }),
          // Arquivo (produção / auditoria)
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
          }),
          // Elasticsearch → Kibana
          createElasticsearchTransport(
            config.get<string>('ELASTIC_HOST') ?? 'http://localhost:9200',
          ),
        ],
      }),
    }),

    // Módulos da aplicação
    AuthModule,
    UsuariosModule,
    MentoresModule,
    // EspecialidadesModule,
    SessoesModule,
    // AvaliacoesModule,
  ],
  providers: [
    // Interceptor global de logs + trace ID
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    // Filtro global de exceções
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
