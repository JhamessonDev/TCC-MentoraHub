import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMentor } from '../hooks/useMentores'
import api from '../services/api'
import { getPublicToken } from '../services/tokens'

function initials(nome: string) {
  const parts = nome.trim().split(' ')
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

function StarRating({ value, total }: { value: number; total: number }) {
  const rounded = Math.min(5, Math.max(0, Math.round(value)))
  return (
    <span className="flex items-center gap-2">
      <span className="text-yellow-400 text-lg">
        {'★'.repeat(rounded)}{'☆'.repeat(5 - rounded)}
      </span>
      <span className="text-gray-400 text-sm">
        {value.toFixed(1)} ({total} sessões)
      </span>
    </span>
  )
}

function ProfileSkeleton() {
  return (
    <div className="bg-gray-950 min-h-screen w-full px-16 py-12 animate-pulse">
      <div className="h-4 bg-gray-800 rounded w-16 mb-8" />
      <div className="bg-gray-800 rounded-2xl p-8 mb-6 flex gap-6 items-start border border-gray-700">
        <div className="w-24 h-24 rounded-full bg-gray-700 shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-7 bg-gray-700 rounded w-1/3" />
          <div className="h-4 bg-gray-700 rounded w-1/4" />
          <div className="flex gap-2 mt-2">
            <div className="h-6 bg-gray-700 rounded-full w-20" />
            <div className="h-6 bg-gray-700 rounded-full w-24" />
          </div>
        </div>
        <div className="space-y-2 text-right">
          <div className="h-7 bg-gray-700 rounded w-28" />
          <div className="h-4 bg-gray-700 rounded w-16 ml-auto" />
        </div>
      </div>
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 space-y-3">
        <div className="h-4 bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-700 rounded w-5/6" />
        <div className="h-4 bg-gray-700 rounded w-4/6" />
      </div>
    </div>
  )
}

const HORARIOS = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']

const DURACOES = [
  { valor: '30min', label: '30 min', fator: 0.5, minutos: 30 },
  { valor: '1h',   label: '1 hora', fator: 1,   minutos: 60 },
  { valor: '1h30', label: '1h30',   fator: 1.5, minutos: 90 },
]

const MODALIDADES = [
  { valor: 'online',     label: 'Online'     },
  { valor: 'presencial', label: 'Presencial' },
]

function hoje() {
  return new Date().toISOString().split('T')[0]
}

function formatarData(iso: string) {
  if (!iso) return ''
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

interface ModalAgendamentoProps {
  mentorId: number
  nomeMentor: string
  precoHora: number
  onFechar: () => void
  onConfirmar: () => void
}

function ModalAgendamento({ mentorId, nomeMentor, precoHora, onFechar, onConfirmar }: ModalAgendamentoProps) {
  const navigate = useNavigate()
  const [data, setData] = useState('')
  const [horario, setHorario] = useState('')
  const [duracao, setDuracao] = useState('')
  const [modalidade, setModalidade] = useState('online')
  const [objetivo, setObjetivo] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const duracaoSelecionada = DURACOES.find((d) => d.valor === duracao)
  const valorTotal = duracaoSelecionada ? precoHora * duracaoSelecionada.fator : null

  async function handleConfirmar() {
    if (!data || !horario || !duracao || !objetivo.trim()) {
      setErro('Preencha todos os campos antes de confirmar.')
      return
    }

    if (!getPublicToken()) {
      navigate('/login')
      return
    }

    setLoading(true)
    setErro('')
    try {
      await api.post('/sessoes', {
        mentorId,
        dataHora: `${data}T${horario}:00`,
        duracaoMin: duracaoSelecionada!.minutos,
        modalidade,
        objetivo: objetivo.trim(),
        valor: valorTotal,
      })
      onConfirmar()
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 401) {
        navigate('/login')
        return
      }
      setErro('Erro ao agendar sessão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onFechar() }}
    >
      <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-lg p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-6">
          Agendar sessão com{' '}
          <span className="text-purple-400">{nomeMentor}</span>
        </h2>

        <div className="space-y-4">
          {/* Data */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Data</label>
            <input
              type="date"
              min={hoje()}
              value={data}
              onChange={(e) => { setData(e.target.value); setErro('') }}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 [color-scheme:dark]"
            />
          </div>

          {/* Horário */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Horário</label>
            <select
              value={horario}
              onChange={(e) => { setHorario(e.target.value); setErro('') }}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Selecione um horário</option>
              {HORARIOS.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          {/* Duração */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Duração</label>
            <select
              value={duracao}
              onChange={(e) => { setDuracao(e.target.value); setErro('') }}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Selecione a duração</option>
              {DURACOES.map((d) => (
                <option key={d.valor} value={d.valor}>
                  {d.label} — R$ {(precoHora * d.fator).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Modalidade */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Modalidade</label>
            <select
              value={modalidade}
              onChange={(e) => { setModalidade(e.target.value); setErro('') }}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {MODALIDADES.map((m) => (
                <option key={m.valor} value={m.valor}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Objetivo */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Objetivo da sessão</label>
            <textarea
              rows={3}
              value={objetivo}
              onChange={(e) => { setObjetivo(e.target.value); setErro('') }}
              placeholder="Descreva o que você quer alcançar nesta sessão..."
              className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* Resumo */}
          {(data || horario || duracao) && (
            <div className="bg-gray-900 border border-gray-700 rounded-xl px-5 py-4 space-y-1.5 text-sm">
              <p className="text-gray-400 font-medium mb-2">Resumo</p>
              {data    && <p className="text-gray-300">📅 Data: <span className="text-white">{formatarData(data)}</span></p>}
              {horario && <p className="text-gray-300">🕐 Horário: <span className="text-white">{horario}</span></p>}
              {duracaoSelecionada && (
                <p className="text-gray-300">⏱ Duração: <span className="text-white">{duracaoSelecionada.label}</span></p>
              )}
              {valorTotal !== null && (
                <p className="text-gray-300 font-semibold">
                  💰 Total: <span className="text-purple-400">R$ {valorTotal.toFixed(2)}</span>
                </p>
              )}
            </div>
          )}

          {/* Erro */}
          {erro && <p className="text-red-400 text-sm">{erro}</p>}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onFechar}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white transition-colors text-sm font-semibold"
          >
            {loading ? 'Agendando…' : 'Confirmar agendamento'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Toast({ onDismiss }: { onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div className="fixed top-5 right-5 z-[60] bg-gray-800 border border-gray-700 text-white text-sm font-medium px-5 py-4 rounded-xl shadow-2xl max-w-sm animate-fade-in">
      ✅ Sessão agendada com sucesso! Você receberá um e-mail de confirmação.
    </div>
  )
}

export default function MentorProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: mentor, isLoading, isError } = useMentor(id ?? '')
  const [modalAberto, setModalAberto] = useState(false)
  const [toastVisivel, setToastVisivel] = useState(false)

  if (isLoading) return <ProfileSkeleton />

  if (isError || !mentor) {
    return (
      <div className="bg-gray-950 min-h-screen w-full px-16 py-24 text-center">
        <p className="text-red-400 text-lg mb-4">Mentor não encontrado.</p>
        <button
          onClick={() => navigate('/mentores')}
          className="text-purple-400 underline text-sm hover:text-purple-300 transition-colors"
        >
          Voltar para a lista
        </button>
      </div>
    )
  }

  const preco = Number(mentor.precoHora)
  const avaliacao = Number(mentor.avaliacaoMedia)

  function handleConfirmar() {
    setModalAberto(false)
    setToastVisivel(true)
  }

  return (
    <div className="bg-gray-950 min-h-screen w-full px-16 py-12">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-400 hover:text-white mb-8 flex items-center gap-1 transition-colors"
      >
        ← Voltar
      </button>

      {/* Header card */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 mb-6 flex flex-col sm:flex-row gap-6 items-start">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl shrink-0">
          {initials(mentor.usuario.nome)}
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white mb-2">{mentor.usuario.nome}</h1>
          <StarRating value={avaliacao} total={mentor.totalSessoes} />
          <div className="flex flex-wrap gap-2 mt-4">
            {mentor.especialidades.map((esp) => (
              <span
                key={esp.id}
                className="bg-purple-900 text-purple-300 border border-purple-700 text-xs font-medium px-3 py-1 rounded-full"
              >
                {esp.nome}
              </span>
            ))}
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="text-3xl font-bold text-purple-400">R$ {preco.toFixed(2)}</p>
          <p className="text-sm text-gray-400 mt-1">por hora</p>
        </div>
      </div>

      {/* Bio card */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-6">
        <h2 className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-3">Sobre</h2>
        <p className="text-gray-300 leading-relaxed">{mentor.bio}</p>
      </div>

      {/* CTA card */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-white">Pronto para começar?</p>
          <p className="text-sm text-gray-400 mt-0.5">Sessões individuais e personalizadas</p>
        </div>
        <button
          onClick={() => setModalAberto(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors shrink-0"
        >
          Agendar sessão
        </button>
      </div>

      {modalAberto && (
        <ModalAgendamento
          mentorId={mentor.id}
          nomeMentor={mentor.usuario.nome}
          precoHora={preco}
          onFechar={() => setModalAberto(false)}
          onConfirmar={handleConfirmar}
        />
      )}

      {toastVisivel && (
        <Toast onDismiss={() => setToastVisivel(false)} />
      )}
    </div>
  )
}
