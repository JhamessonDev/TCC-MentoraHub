import { ElasticsearchTransport } from 'winston-elasticsearch';

export function createElasticsearchTransport(url: string): ElasticsearchTransport {
  return new ElasticsearchTransport({
    level: 'info',
    clientOpts: { node: url },
    indexPrefix: 'mentora-logs',
    // Transforma o objeto de log para garantir que todos os campos estruturados
    // (traceId, method, url, statusCode, durationMs, context) chegam como
    // campos de primeiro nível no documento Elasticsearch.
    transformer: (logData) => {
      const { message, level, meta = {} } = logData;
      return {
        '@timestamp': new Date().toISOString(),
        severity: level,
        message,
        traceId:    meta['traceId']    ?? null,
        method:     meta['method']     ?? null,
        url:        meta['url']        ?? null,
        statusCode: meta['statusCode'] ?? null,
        durationMs: meta['durationMs'] ?? null,
        context:    meta['context']    ?? null,
        ...meta,
      };
    },
  });
}
