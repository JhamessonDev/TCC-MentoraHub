import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import type { Mentor, PaginatedResponse } from '../../types/mentor'

function StatusBadge({ aprovado }: { aprovado: boolean }) {
  return aprovado ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300">
      Aprovado
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900 text-yellow-300">
      Pendente
    </span>
  )
}

export default function MentoresAdminPage() {
  const [busca, setBusca] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<PaginatedResponse<Mentor>>({
    queryKey: ['admin-mentores-list'],
    queryFn: () =>
      api.get<PaginatedResponse<Mentor>>('/mentores', { params: { limit: 50 } }).then((r) => r.data),
  })

  const aprovarMutation = useMutation({
    mutationFn: ({ id, aprovado }: { id: number; aprovado: boolean }) =>
      api.patch(`/mentores/${id}/aprovar`, { aprovado }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-mentores-list'] }),
  })

  const resetSenhaMutation = useMutation({
    mutationFn: (usuarioId: number) => api.patch(`/usuarios/${usuarioId}/reset-senha`),
  })

  const mentores = (data?.data ?? []).filter((m) =>
    m.usuario.nome.toLowerCase().includes(busca.toLowerCase()),
  )

  function formatCurrency(value: string) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
      parseFloat(value),
    )
  }

  function handleResetSenha(mentor: Mentor) {
    if (!window.confirm(`Redefinir a senha de ${mentor.usuario.nome} para Mentora@2026?`)) return
    resetSenhaMutation.mutate(mentor.usuarioId, {
      onSuccess: () => {
        setToast(`Senha de ${mentor.usuario.nome} redefinida para Mentora@2026`)
        setTimeout(() => setToast(null), 4000)
      },
    })
  }

  return (
    <div className="p-8 space-y-6 bg-gray-900 min-h-full">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-green-800 border border-green-600 text-green-100 text-sm font-medium px-4 py-3 rounded-xl shadow-lg">
          <span>✓</span>
          <span>{toast}</span>
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold text-white">Mentores</h1>
        <p className="text-gray-400 text-sm mt-1">Gerencie os mentores da plataforma</p>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full max-w-sm px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-gray-400 font-medium px-6 py-3">Nome</th>
                <th className="text-left text-gray-400 font-medium px-6 py-3">Especialidades</th>
                <th className="text-left text-gray-400 font-medium px-6 py-3">Preço/Hora</th>
                <th className="text-left text-gray-400 font-medium px-6 py-3">Avaliação</th>
                <th className="text-left text-gray-400 font-medium px-6 py-3">Sessões</th>
                <th className="text-left text-gray-400 font-medium px-6 py-3">Status</th>
                <th className="text-left text-gray-400 font-medium px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {isLoading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-700 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : mentores.map((mentor) => (
                    <tr key={mentor.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{mentor.usuario.nome}</td>
                      <td className="px-6 py-4 text-gray-400">
                        {mentor.especialidades.slice(0, 2).map((e) => e.nome).join(', ') || '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-300">{formatCurrency(mentor.precoHora)}</td>
                      <td className="px-6 py-4 text-yellow-400">
                        ★ {parseFloat(mentor.avaliacaoMedia).toFixed(1)}
                      </td>
                      <td className="px-6 py-4 text-gray-300">{mentor.totalSessoes}</td>
                      <td className="px-6 py-4">
                        <StatusBadge aprovado={mentor.aprovado} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {mentor.aprovado ? (
                            <button
                              onClick={() =>
                                aprovarMutation.mutate({ id: mentor.id, aprovado: false })
                              }
                              disabled={aprovarMutation.isPending}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-900 text-red-300 hover:bg-red-800 transition-colors disabled:opacity-50"
                            >
                              Revogar
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                aprovarMutation.mutate({ id: mentor.id, aprovado: true })
                              }
                              disabled={aprovarMutation.isPending}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-900 text-green-300 hover:bg-green-800 transition-colors disabled:opacity-50"
                            >
                              Aprovar
                            </button>
                          )}
                          {mentor.usuarioId !== 1 && (
                            <button
                              onClick={() => handleResetSenha(mentor)}
                              disabled={resetSenhaMutation.isPending}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-yellow-400 hover:text-yellow-300 bg-yellow-900/30 hover:bg-yellow-900/50 transition-colors disabled:opacity-50"
                            >
                              🔑 Redefinir senha
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {!isLoading && mentores.length === 0 && (
            <div className="text-center py-12 text-gray-400">Nenhum mentor encontrado.</div>
          )}
        </div>

        {!isLoading && (
          <div className="px-6 py-3 border-t border-gray-700 text-xs text-gray-500">
            {mentores.length} {mentores.length === 1 ? 'mentor' : 'mentores'}
          </div>
        )}
      </div>
    </div>
  )
}
