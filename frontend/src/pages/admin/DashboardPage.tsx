import { useQuery } from '@tanstack/react-query'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import api from '../../services/api'
import type { Mentor, PaginatedResponse } from '../../types/mentor'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

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

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(0,0,0,0.05)' },
      ticks: { stepSize: 10 },
    },
    x: { grid: { display: false } },
  },
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  )
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery<PaginatedResponse<Mentor>>({
    queryKey: ['admin-mentores'],
    queryFn: () => api.get<PaginatedResponse<Mentor>>('/mentores', { params: { limit: 50 } }).then((r) => r.data),
  })

  const mentores = data?.data ?? []
  const totalMentores = data?.total ?? 0
  const totalSessoes = mentores.reduce((acc, m) => acc + m.totalSessoes, 0)
  const receitaTotal = mentores.reduce(
    (acc, m) => acc + parseFloat(m.precoHora) * m.totalSessoes,
    0,
  )

  const rankingMentores = [...mentores]
    .sort((a, b) => b.totalSessoes - a.totalSessoes)
    .slice(0, 10)

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <div className="text-2xl font-bold text-gray-900">Dashboard</div>
        <p className="text-gray-500 text-sm mt-1">Visão geral da plataforma</p>
      </div>

      {/* Metric cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard label="Total Usuários" value={totalMentores} />
          <MetricCard label="Mentores Ativos" value={mentores.filter((m) => m.aprovado).length} />
          <MetricCard label="Sessões do Mês" value={totalSessoes} />
          <MetricCard label="Receita do Mês" value={formatCurrency(receitaTotal)} />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-base font-semibold text-gray-900 mb-4">Sessões por Especialidade</p>
          <Bar data={sessoesPorEspecialidade} options={chartOptions} />
        </div>

        {/* Mentor ranking */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-base font-semibold text-gray-900 mb-4">Ranking de Mentores</p>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-gray-600 font-medium pb-3 pr-4">#</th>
                    <th className="text-left text-gray-600 font-medium pb-3 pr-4">Nome</th>
                    <th className="text-left text-gray-600 font-medium pb-3 pr-4">Especialidade</th>
                    <th className="text-right text-gray-600 font-medium pb-3 pr-4">Sessões</th>
                    <th className="text-right text-gray-600 font-medium pb-3 pr-4">Avaliação</th>
                    <th className="text-right text-gray-600 font-medium pb-3">Receita</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rankingMentores.map((mentor, idx) => (
                    <tr key={mentor.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 pr-4 text-gray-500 font-medium">{idx + 1}</td>
                      <td className="py-3 pr-4 font-medium text-gray-900">{mentor.usuario.nome}</td>
                      <td className="py-3 pr-4 text-gray-600">
                        {mentor.especialidades[0]?.nome ?? '—'}
                      </td>
                      <td className="py-3 pr-4 text-right text-gray-700">{mentor.totalSessoes}</td>
                      <td className="py-3 pr-4 text-right text-yellow-600">
                        ★ {parseFloat(mentor.avaliacaoMedia).toFixed(1)}
                      </td>
                      <td className="py-3 text-right text-green-700 font-medium">
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
