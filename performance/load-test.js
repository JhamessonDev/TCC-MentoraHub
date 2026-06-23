import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// ── Métricas customizadas ────────────────────────
const latenciaMentores     = new Trend('latencia_get_mentores', true);
const latenciaMentorById   = new Trend('latencia_get_mentor_by_id', true);
const latenciaFiltro       = new Trend('latencia_get_mentores_filtro', true);
const taxaErros            = new Rate('taxa_erros');
const totalRequisicoes     = new Counter('total_requisicoes');

// ── Configuração do teste ────────────────────────
export const options = {
  stages: [
    { duration: '15s', target: 5  },  // rampa de subida
    { duration: '30s', target: 10 },  // carga sustentada
    { duration: '15s', target: 20 },  // pico
    { duration: '10s', target: 0  },  // rampa de descida
  ],
  thresholds: {
    http_req_duration:          ['p(95)<500'],  // 95% das requisições < 500ms
    latencia_get_mentores:      ['p(95)<300'],
    latencia_get_mentor_by_id:  ['p(95)<200'],
    taxa_erros:                 ['rate<0.01'],  // menos de 1% de erros
  },
};

const BASE_URL = 'http://localhost:3000/api/v1';

export default function () {
  // ── GET /mentores ──────────────────────────────
  const r1 = http.get(`${BASE_URL}/mentores`);
  latenciaMentores.add(r1.timings.duration);
  totalRequisicoes.add(1);
  check(r1, {
    'GET /mentores status 200':     (r) => r.status === 200,
    'GET /mentores tem data':       (r) => JSON.parse(r.body).data !== undefined,
    'GET /mentores tempo < 500ms':  (r) => r.timings.duration < 500,
  }) || taxaErros.add(1);

  sleep(0.5);

  // ── GET /mentores/:id ──────────────────────────
  const id = Math.floor(Math.random() * 6) + 1;
  const r2 = http.get(`${BASE_URL}/mentores/${id}`);
  latenciaMentorById.add(r2.timings.duration);
  totalRequisicoes.add(1);
  check(r2, {
    'GET /mentores/:id status 200':    (r) => r.status === 200,
    'GET /mentores/:id tem id':        (r) => JSON.parse(r.body).id !== undefined,
    'GET /mentores/:id tempo < 300ms': (r) => r.timings.duration < 300,
  }) || taxaErros.add(1);

  sleep(0.5);

  // ── GET /mentores?filtro ───────────────────────
  const especialidadeId = Math.floor(Math.random() * 6) + 1;
  const r3 = http.get(`${BASE_URL}/mentores?especialidadeId=${especialidadeId}`);
  latenciaFiltro.add(r3.timings.duration);
  totalRequisicoes.add(1);
  check(r3, {
    'GET /mentores?filtro status 200':    (r) => r.status === 200,
    'GET /mentores?filtro tempo < 500ms': (r) => r.timings.duration < 500,
  }) || taxaErros.add(1);

  sleep(1);
}

export function handleSummary(data) {
  return {
    'performance/resultado.json': JSON.stringify(data, null, 2),
  };
}
