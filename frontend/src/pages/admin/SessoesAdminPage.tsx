import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'

type StatusSessao = 'agendada' | 'confirmada' | 'realizada' | 'cancelada'
type FiltroStatus = 'todas' | StatusSessao

interface UsuarioSimples {
  id: number
  nome: string
  email: string
}

interface MentorSimples {
  id: number
  usuario: UsuarioSimples
}

interface Sessao {
  id: number
  mentor: MentorSimples
  mentorando: UsuarioSimples
  dataHora: string
  modalidade: 'online' | 'presencial'
  status: StatusSessao
  valor: number
  duracaoMin: number
}

const STATUS_STYLES: Record<StatusSessao, string> = {
  agendada:  'bg-blue-900 text-blue-300',
  confirmada: 'bg-purple-900 text-purple-300',
  realizada:  'bg-green-900 text-green-300',
  cancelada:  'bg-red-900 text-red-300',
}

const STATUS_LABELS: Record<StatusSessao, string> = {
  agendada:  'Agendada',
  confirmada: 'Confirmada',
  realizada:  'Realizada',
  cancelada:  'Cancelada',
}

function StatusBadge({ status }: { status: StatusSessao }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status] ?? 'bg-gray-700 text-gray-300'}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

export default function SessoesAdminPage() {
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('todas')

  const { data: sessoes = [], isLoading } = useQuery<Sessao[]>({
    queryKey: ['admin-sessoes'],
    queryFn: () => api.get<Sessao[]>('/sessoes').then((r) => r.data),
  })

  const filtradas = sessoes.filter(
    (s) => filtroStatus === 'todas' || s.status === filtroStatus,
  )

  function formatDateTime(iso: string) {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso))
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  return (
    <div className="p-8 space-y-6 bg-gray-900 min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-white">Sessões</h1>
        <p className="text-gray-400 text-sm mt-1">Todas as sessões da plataforma</p>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as FiltroStatus)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="todas">Todas as sessões</option>
            <option value="agendada">Agendada</option>
            <option value="confirmada">Confirmada</option>
            <option value="realizada">Realizada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-gray-400 font-medium px-6 py-3">Mentor</th>
                <th className="text-left text-gray-400 font-medium px-6 py-3">Mentorando</th>
                <th className="text-left text-gray-400 font-medium px-6 py-3">Data / Hora</th>
                <th className="text-left text-gray-400 font-medium px-6 py-3">Modalidade</th>
                <th className="text-left text-gray-400 font-medium px-6 py-3">Status</th>
                <th className="text-left text-gray-400 font-medium px-6 py-3">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {isLoading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-700 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtradas.map((sessao) => (
                    <tr key={sessao.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">
                        {sessao.mentor?.usuario?.nome ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {sessao.mentorando?.nome ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-400">{formatDateTime(sessao.dataHora)}</td>
                      <td className="px-6 py-4 text-gray-400 capitalize">{sessao.modalidade}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={sessao.status} />
                      </td>
                      <td className="px-6 py-4 text-gray-300 font-medium">
                        {formatCurrency(sessao.valor)}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {!isLoading && filtradas.length === 0 && (
            <div className="text-center py-12 text-gray-400">Nenhuma sessão encontrada.</div>
          )}
        </div>

        {!isLoading && (
          <div className="px-6 py-3 border-t border-gray-700 text-xs text-gray-500">
            {filtradas.length} {filtradas.length === 1 ? 'sessão' : 'sessões'}
          </div>
        )}
      </div>
    </div>
  )
}
