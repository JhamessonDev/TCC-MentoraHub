import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

/**
 * Interceptor global que:
 * 1. Gera um trace ID único por requisição (UUID v4)
 * 2. Injeta o trace ID no header de resposta
 * 3. Loga entrada e saída de cada requisição com tempo de resposta
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    // Gera ou reutiliza trace ID (pode vir do header para rastreamento end-to-end)
    const traceId = (req.headers['x-trace-id'] as string) ?? uuidv4();
    req.traceId = traceId;

    // Injeta trace ID na resposta para o cliente rastrear
    res.setHeader('x-trace-id', traceId);

    const { method, url, body, ip } = req;
    const startTime = Date.now();

    this.logger.info('Requisição recebida', {
      traceId,
      method,
      url,
      ip,
      body: method !== 'GET' ? body : undefined,
      context: 'LoggingInterceptor',
    });

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logger.info('Requisição concluída', {
            traceId,
            method,
            url,
            statusCode: res.statusCode,
            durationMs: duration,
            context: 'LoggingInterceptor',
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error('Requisição com erro', {
            traceId,
            method,
            url,
            statusCode: error.status ?? 500,
            error: error.message,
            durationMs: duration,
            context: 'LoggingInterceptor',
          });
        },
      }),
    );
  }
}
