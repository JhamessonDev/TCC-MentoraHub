import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import api from '../../services/api'
import type { Mentor, PaginatedResponse } from '../../types/mentor'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
)

type Periodo = '7d' | '30d' | '90d'

interface EvolucaoPonto {
  data: string
  sessoes: number
  receita: number
}

interface MetricasResponse {
  evolucaoSessoes: EvolucaoPonto[]
  totalSessoesPeriodo: number
  totalReceitaPeriodo: number
  comparativoAnterior: number
}

const PERIODO_LABELS: Record<Periodo, string> = {
  '7d': '7 dias',
  '30d': '30 dias',
  '90d': '90 dias',
}

const sessoesPorEspecialidade = {
  labels: ['Tecnologia', 'Finanças', 'Negócios', 'Design', 'Marketing', 'Carreira'],
  datasets: [
    {
      label: 'Sessões',
      data: [38, 27, 24, 18, 14, 11],
      backgroundColor: 'rgba(124, 58, 237, 0.8)',
      borderRadius: 6,
    },
  ],
}

const barChartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(255,255,255,0.07)' },
      ticks: { stepSize: 10, color: '#9ca3af' },
    },
    x: {
      grid: { display: false },
      ticks: { color: '#9ca3af' },
    },
  },
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <p className="text-sm text-gray-400 font-medium">{label}</p>
      <p className="text-3xl font-bold text-white mt-1">{value}</p>
    </div>
  )
}

export default function DashboardPage() {
  const [periodo, setPeriodo] = useState<Periodo>('30d')

  const { data: mentoresData, isLoading: isLoadingMentores } = useQuery<PaginatedResponse<Mentor>>({
    queryKey: ['admin-mentores'],
    queryFn: () =>
      api.get<PaginatedResponse<Mentor>>('/mentores', { params: { limit: 50 } }).then((r) => r.data),
  })

  const { data: metricas, isLoading: isLoadingMetricas } = useQuery<MetricasResponse>({
    queryKey: ['admin-metricas', periodo],
    queryFn: () =>
      api
        .get<MetricasResponse>('/sessoes/metricas', { params: { periodo } })
        .then((r) => r.data),
  })

  const mentores = mentoresData?.data ?? []
  const totalMentores = mentoresData?.total ?? 0

  const rankingMentores = [...mentores]
    .sort((a, b) => b.totalSessoes - a.totalSessoes)
    .slice(0, 10)

  const evolucao = metricas?.evolucaoSessoes ?? []

  const lineChartData = {
    labels: evolucao.map((p) => {
      const [, mes, dia] = p.data.split('-')
      return `${dia}/${mes}`
    }),
    datasets: [
      {
        label: 'Sessões',
        data: evolucao.map((p) => p.sessoes),
        borderColor: 'rgba(124, 58, 237, 1)',
        backgroundColor: 'rgba(124, 58, 237, 0.12)',
        fill: true,
        tension: 0.4,
        yAxisID: 'ySessoes',
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: 'Receita (R$)',
        data: evolucao.map((p) => p.receita),
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        fill: false,
        tension: 0.4,
        yAxisID: 'yReceita',
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  }

  const lineChartOptions = {
    responsive: true,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        labels: { color: '#9ca3af', boxWidth: 12, padding: 16 },
      },
      title: { display: false },
    },
    scales: {
      ySessoes: {
        type: 'linear' as const,
        position: 'left' as const,
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.07)' },
        ticks: { color: '#9ca3af', stepSize: 1 },
        title: { display: true, text: 'Sessões', color: '#9ca3af', font: { size: 11 } },
      },
      yReceita: {
        type: 'linear' as const,
        position: 'right' as const,
        beginAtZero: true,
        grid: { drawOnChartArea: false },
        ticks: {
          color: '#10b981',
          callback: (value: number | string) =>
            `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`,
        },
        title: { display: true, text: 'Receita', color: '#10b981', font: { size: 11 } },
      },
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#9ca3af', maxTicksLimit: 12 },
      },
    },
  }

  const comparativo = metricas?.comparativoAnterior ?? 0
  const comparativoPositivo = comparativo >= 0

  return (
    <div className="p-8 space-y-8 bg-gray-900 min-h-full">
      {/* Header + period selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-2xl font-bold text-white">Dashboard</div>
          <p className="text-gray-400 text-sm mt-1">Visão geral da plataforma</p>
        </div>

        <div className="flex gap-1 bg-gray-800 rounded-lg p-1 border border-gray-700">
          {(['7d', '30d', '90d'] as Periodo[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                periodo === p
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {PERIODO_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Metric cards */}
      {isLoadingMentores || isLoadingMetricas ? (
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-6 border border-gray-700 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-24 mb-3" />
              <div className="h-8 bg-gray-700 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
          <MetricCard label="Total Usuários" value={totalMentores} />
          <MetricCard label="Mentores Ativos" value={mentores.filter((m) => m.aprovado).length} />

          {/* Sessões do período */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <p className="text-sm text-gray-400 font-medium">Sessões do Período</p>
            <p className="text-3xl font-bold text-white mt-1">
              {metricas?.totalSessoesPeriodo ?? 0}
            </p>
            <div
              className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                comparativoPositivo ? 'text-green-400' : 'text-red-400'
              }`}
            >
              <span className="text-sm">{comparativoPositivo ? '↑' : '↓'}</span>
              <span>{Math.abs(comparativo)}% vs anterior</span>
            </div>
          </div>

          {/* Comparativo */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <p className="text-sm text-gray-400 font-medium">Comparativo</p>
            <p
              className={`text-3xl font-bold mt-1 ${
                comparativoPositivo ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {comparativoPositivo ? '↑' : '↓'} {Math.abs(comparativo)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">período anterior</p>
          </div>

          <MetricCard
            label="Receita do Período"
            value={formatCurrency(metricas?.totalReceitaPeriodo ?? 0)}
          />
        </div>
      )}

      {/* Line chart — evolução temporal */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <p className="text-base font-semibold text-white mb-4">
          Evolução de Sessões e Receita — últimos {PERIODO_LABELS[periodo]}
        </p>
        {isLoadingMetricas ? (
          <div className="h-64 bg-gray-700 rounded animate-pulse" />
        ) : evolucao.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
            Nenhum dado no período selecionado
          </div>
        ) : (
          <Line data={lineChartData} options={lineChartOptions} />
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Bar chart — mantido como estava */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <p className="text-base font-semibold text-white mb-4">Sessões por Especialidade</p>
          <Bar data={sessoesPorEspecialidade} options={barChartOptions} />
        </div>

        {/* Ranking de mentores — mantido como estava */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <p className="text-base font-semibold text-white mb-4">Ranking de Mentores</p>
          {isLoadingMentores ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 font-medium pb-3 pr-4">#</th>
                    <th className="text-left text-gray-400 font-medium pb-3 pr-4">Nome</th>
                    <th className="text-left text-gray-400 font-medium pb-3 pr-4">Especialidade</th>
                    <th className="text-right text-gray-400 font-medium pb-3 pr-4">Sessões</th>
                    <th className="text-right text-gray-400 font-medium pb-3 pr-4">Avaliação</th>
                    <th className="text-right text-gray-400 font-medium pb-3">Receita</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {rankingMentores.map((mentor, idx) => (
                    <tr key={mentor.id} className="hover:bg-gray-700 transition-colors">
                      <td className="py-3 pr-4 text-gray-500 font-medium">{idx + 1}</td>
                      <td className="py-3 pr-4 font-medium text-white">{mentor.usuario.nome}</td>
                      <td className="py-3 pr-4 text-gray-400">
                        {mentor.especialidades[0]?.nome ?? '—'}
                      </td>
                      <td className="py-3 pr-4 text-right text-gray-300">{mentor.totalSessoes}</td>
                      <td className="py-3 pr-4 text-right text-yellow-400">
                        ★ {parseFloat(mentor.avaliacaoMedia).toFixed(1)}
                      </td>
                      <td className="py-3 text-right text-green-400 font-medium">
                        {formatCurrency(parseFloat(mentor.precoHora) * mentor.totalSessoes)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
