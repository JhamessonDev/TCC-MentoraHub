import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { getPublicToken } from '../services/auth'

interface Especialidade {
  id: number
  nome: string
}

interface UsuarioResumo {
  id: number
  nome: string
  email: string
}

interface MentorResumo {
  id: number
  usuario: UsuarioResumo
  especialidades: Especialidade[]
}

interface Sessao {
  id: number
  dataHora: string
  duracaoMin: number
  modalidade: string
  status: 'agendada' | 'confirmada' | 'realizada' | 'cancelada'
  valor: number
  mentor: MentorResumo
  mentorando: UsuarioResumo
}

interface Perfil {
  id: number
  nome: string
  email: string
  tipoUsuario: string
}

const STATUS_BADGE: Record<Sessao['status'], string> = {
  agendada:   'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40',
  confirmada: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
  realizada:  'bg-green-500/20 text-green-300 border border-green-500/40',
  cancelada:  'bg-red-500/20 text-red-300 border border-red-500/40',
}

const STATUS_LABEL: Record<Sessao['status'], string> = {
  agendada:   'Agendada',
  confirmada: 'Confirmada',
  realizada:  'Realizada',
  cancelada:  'Cancelada',
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function initials(nome: string) {
  const parts = nome.trim().split(' ')
  const first = parts[0]?.[0] ?? ''
  const last  = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

function CardMentor({ sessao }: { sessao: Sessao }) {
  const nome = sessao.mentor?.usuario?.nome ?? '—'
  const especialidade = sessao.mentor?.especialidades?.[0]?.nome ?? '—'

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 flex flex-col sm:flex-row gap-5 items-start hover:border-gray-600 transition-colors">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
        {initials(nome)}
      </div>
      <div className="flex-1 min-w-0 space-y-1.5">
        <p className="text-white font-semibold text-base">{nome}</p>
        <p className="text-purple-400 text-sm">{especialidade}</p>
        <p className="text-gray-400 text-sm">📅 {formatDateTime(sessao.dataHora)}</p>
      </div>
      <div className="flex flex-col items-end gap-3 shrink-0">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_BADGE[sessao.status]}`}>
          {STATUS_LABEL[sessao.status]}
        </span>
        <p className="text-purple-400 font-bold text-lg">
          R$ {Number(sessao.valor).toFixed(2)}
        </p>
      </div>
    </div>
  )
}

function CardMentorando({ sessao }: { sessao: Sessao }) {
  const nome  = sessao.mentorando?.nome  ?? '—'
  const email = sessao.mentorando?.email ?? '—'

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 flex flex-col sm:flex-row gap-5 items-start hover:border-gray-600 transition-colors">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
        {initials(nome)}
      </div>
      <div className="flex-1 min-w-0 space-y-1.5">
        <p className="text-white font-semibold text-base">{nome}</p>
        <p className="text-gray-400 text-sm">{email}</p>
        <p className="text-gray-400 text-sm">📅 {formatDateTime(sessao.dataHora)}</p>
      </div>
      <div className="flex flex-col items-end gap-3 shrink-0">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_BADGE[sessao.status]}`}>
          {STATUS_LABEL[sessao.status]}
        </span>
        <p className="text-purple-400 font-bold text-lg">
          R$ {Number(sessao.valor).toFixed(2)}
        </p>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="text-gray-300 text-lg font-medium mb-2">Você ainda não tem sessões agendadas</p>
      <p className="text-gray-500 text-sm mb-8">Explore nossos mentores e agende sua primeira sessão</p>
      <Link
        to="/mentores"
        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
      >
        Encontrar mentor
      </Link>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-gray-800 border border-gray-700 rounded-2xl p-6 flex gap-5">
          <div className="w-12 h-12 rounded-full bg-gray-700 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-700 rounded w-1/3" />
            <div className="h-3 bg-gray-700 rounded w-1/4" />
            <div className="h-3 bg-gray-700 rounded w-1/5" />
          </div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-700 rounded-full w-24" />
            <div className="h-6 bg-gray-700 rounded w-20 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function MinhasSessoesPage() {
  const navigate = useNavigate()
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [sessoes, setSessoes] = useState<Sessao[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!getPublicToken()) {
      navigate('/login', { replace: true })
      return
    }

    async function carregar() {
      try {
        const [{ data: perfilData }, { data: sessoesData }] = await Promise.all([
          api.get<Perfil>('/auth/profile'),
          api.get<Sessao[]>('/sessoes/minhas'),
        ])
        setPerfil(perfilData)
        setSessoes(sessoesData)
      } catch {
        setErro('Não foi possível carregar suas sessões. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }

    carregar()
  }, [navigate])

  const titulo = perfil?.tipoUsuario === 'mentor'
    ? 'Minhas Sessões como Mentor'
    : 'Minhas Sessões Agendadas'

  return (
    <div className="bg-gray-950 min-h-screen w-full px-6 sm:px-16 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">{titulo}</h1>
        {perfil && (
          <p className="text-gray-400 text-sm mb-8">
            Olá, <span className="text-purple-400">{perfil.nome}</span>
          </p>
        )}

        {erro && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-xl px-5 py-4 text-sm mb-6">
            {erro}
          </div>
        )}

        {loading ? (
          <Skeleton />
        ) : sessoes.length === 0 ? (
          perfil?.tipoUsuario === 'mentorando' ? (
            <EmptyState />
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-gray-300 text-lg font-medium">Nenhuma sessão agendada ainda</p>
              <p className="text-gray-500 text-sm mt-2">As sessões aparecerão aqui quando mentorandos agendarem com você</p>
            </div>
          )
        ) : (
          <div className="space-y-4">
            {perfil?.tipoUsuario === 'mentor'
              ? sessoes.map((s) => <CardMentorando key={s.id} sessao={s} />)
              : sessoes.map((s) => <CardMentor key={s.id} sessao={s} />)
            }
          </div>
        )}
      </div>
    </div>
  )
}
