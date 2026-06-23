import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

/**
 * Filtro global que padroniza TODAS as respostas de erro da API.
 * Garante que o cliente sempre receba o mesmo formato de erro,
 * incluindo o traceId para rastreamento.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request & { traceId?: string }>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Erro interno do servidor';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      traceId: request.traceId ?? null,
      error: typeof message === 'string' ? message : (message as any).message,
    };

    this.logger.error('Exceção capturada', {
      traceId: request.traceId,
      statusCode: status,
      path: request.url,
      error: errorResponse.error,
      context: 'HttpExceptionFilter',
    });

    response.status(status).json(errorResponse);
  }
}
