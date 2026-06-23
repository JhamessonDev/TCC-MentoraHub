import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'

interface UsuarioAdmin {
  id: number
  nome: string
  email: string
  tipoUsuario: 'admin' | 'mentor' | 'mentorando'
  ativo: boolean
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

type FiltroTipo = 'todos' | 'admin' | 'mentor' | 'mentorando'

function TipoBadge({ tipo }: { tipo: string }) {
  const styles: Record<string, string> = {
    admin:      'bg-purple-900 text-purple-300',
    mentor:     'bg-blue-900 text-blue-300',
    mentorando: 'bg-green-900 text-green-300',
  }
  const labels: Record<string, string> = {
    admin:      'Admin',
    mentor:     'Mentor',
    mentorando: 'Mentorando',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[tipo] ?? 'bg-gray-700 text-gray-300'}`}>
      {labels[tipo] ?? tipo}
    </span>
  )
}

function StatusBadge({ ativo }: { ativo: boolean }) {
  return ativo ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300">
      Ativo
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-400">
      Inativo
    </span>
  )
}

export default function UsuariosAdminPage() {
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('todos')
  const queryClient = useQueryClient()

  const { data: usuarios = [], isLoading } = useQuery<UsuarioAdmin[]>({
    queryKey: ['admin-usuarios'],
    queryFn: () => api.get<UsuarioAdmin[]>('/usuarios').then((r) => r.data),
  })

  const toggleStatusMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/usuarios/${id}/status`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] }),
  })

  const filtrados = usuarios.filter(
    (u) => filtroTipo === 'todos' || u.tipoUsuario === filtroTipo,
  )

  function formatDate(iso: string) {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(iso))
  }

  return (
    <div className="p-8 space-y-6 bg-gray-900 min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-white">Usuários</h1>
        <p className="text-gray-400 text-sm mt-1">Gerencie os usuários da plataforma</p>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex items-center gap-3">
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as FiltroTipo)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="todos">Todos os tipos</option>
            <option value="admin">Admin</option>
            <option value="mentor">Mentor</option>
            <option value="mentorando">Mentorando</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-gray-400 font-medium px-6 py-3">Nome</th>
                <th className="text-left text-gray-400 font-medium px-6 py-3">E-mail</th>
                <th className="text-left text-gray-400 font-medium px-6 py-3">Tipo</th>
                <th className="text-left text-gray-400 font-medium px-6 py-3">Status</th>
                <th className="text-left text-gray-400 font-medium px-6 py-3">Cadastro</th>
                <th className="text-left text-gray-400 font-medium px-6 py-3">Ação</th>
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
                : filtrados.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{usuario.nome}</td>
                      <td className="px-6 py-4 text-gray-400">{usuario.email}</td>
                      <td className="px-6 py-4">
                        <TipoBadge tipo={usuario.tipoUsuario} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge ativo={usuario.ativo} />
                      </td>
                      <td className="px-6 py-4 text-gray-400">{formatDate(usuario.createdAt)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStatusMutation.mutate(usuario.id)}
                          disabled={toggleStatusMutation.isPending}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                            usuario.ativo
                              ? 'bg-red-900 text-red-300 hover:bg-red-800'
                              : 'bg-green-900 text-green-300 hover:bg-green-800'
                          }`}
                        >
                          {usuario.ativo ? 'Desativar' : 'Ativar'}
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {!isLoading && filtrados.length === 0 && (
            <div className="text-center py-12 text-gray-400">Nenhum usuário encontrado.</div>
          )}
        </div>

        {!isLoading && (
          <div className="px-6 py-3 border-t border-gray-700 text-xs text-gray-500">
            {filtrados.length} {filtrados.length === 1 ? 'usuário' : 'usuários'}
          </div>
        )}
      </div>
    </div>
  )
}
