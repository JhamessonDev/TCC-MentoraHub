import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMentores } from '../hooks/useMentores'
import type { Mentor } from '../types/mentor'

const ESPECIALIDADES = [
  { id: 2, nome: 'Tecnologia' },
  { id: 3, nome: 'Finanças' },
  { id: 4, nome: 'Negócios' },
  { id: 5, nome: 'Marketing Digital' },
  { id: 6, nome: 'Carreira' },
]
const LIMITE = 12

function initials(nome: string) {
  const parts = nome.trim().split(' ')
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

function MentorCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
      <div className="flex gap-4 items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-full mb-2" />
      <div className="h-3 bg-gray-200 rounded w-4/5" />
    </div>
  )
}

function MentorCard({ mentor }: { mentor: Mentor }) {
  const navigate = useNavigate()
  const preco = Number(mentor.precoHora)
  const avaliacao = Number(mentor.avaliacaoMedia)
  const rounded = Math.min(5, Math.max(0, Math.round(avaliacao)))

  return (
    <button
      onClick={() => navigate(`/mentores/${mentor.id}`)}
      className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:shadow-md hover:border-purple-300 transition-all cursor-pointer"
    >
      <div className="flex gap-4 items-center mb-3">
        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold shrink-0">
          {initials(mentor.usuario.nome)}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{mentor.usuario.nome}</p>
          <p className="text-sm text-purple-600 truncate">
            {mentor.especialidades[0]?.nome ?? '—'}
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{mentor.bio}</p>

      <div className="flex items-center justify-between">
        <span className="text-yellow-500 text-sm">
          {'★'.repeat(rounded)}{'☆'.repeat(5 - rounded)}
          <span className="text-gray-400 ml-1">({mentor.totalSessoes})</span>
        </span>
        <span className="text-sm font-semibold text-gray-700">
          R$ {preco.toFixed(2)}<span className="font-normal text-gray-400">/h</span>
        </span>
      </div>
    </button>
  )
}

function Pagination({
  pagina,
  totalPaginas,
  onChange,
}: {
  pagina: number
  totalPaginas: number
  onChange: (p: number) => void
}) {
  if (totalPaginas <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        disabled={pagina === 1}
        onClick={() => onChange(pagina - 1)}
        className="px-3 py-1.5 rounded border text-sm disabled:opacity-40 hover:bg-gray-100 transition-colors"
      >
        ← Anterior
      </button>
      {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-3 py-1.5 rounded border text-sm transition-colors ${
            p === pagina
              ? 'bg-purple-700 text-white border-purple-700'
              : 'hover:bg-gray-100'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        disabled={pagina === totalPaginas}
        onClick={() => onChange(pagina + 1)}
        className="px-3 py-1.5 rounded border text-sm disabled:opacity-40 hover:bg-gray-100 transition-colors"
      >
        Próxima →
      </button>
    </div>
  )
}

export default function MentoresPage() {
  const [busca, setBusca] = useState('')
  const [especialidadeId, setEspecialidadeId] = useState<number | undefined>()
  const [pagina, setPagina] = useState(1)

  const { data, isLoading, isError } = useMentores({
    especialidadeId,
    page: pagina,
    limit: LIMITE,
  })

  const termo = busca.toLowerCase()
  const mentoresFiltrados = busca
    ? (data?.data ?? []).filter((m) =>
        m.usuario.nome.toLowerCase().includes(termo) ||
        m.especialidades.some((e) => e.nome.toLowerCase().includes(termo))
      )
    : (data?.data ?? [])

  const totalPaginas = data ? Math.ceil(data.total / data.limit) : 0

  function handleEspecialidade(id: number) {
    setEspecialidadeId((prev) => (prev === id ? undefined : id))
    setPagina(1)
  }

return (
    <div className="w-full px-16 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Encontrar Mentor</h1>
      <p className="text-gray-500 mb-8">
        {data ? `${data.total} mentores disponíveis` : 'Carregando...'}
      </p>

      <div className="mb-4">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou área..."
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => { setEspecialidadeId(undefined); setPagina(1) }}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            !especialidadeId
              ? 'bg-purple-700 text-white border-purple-700'
              : 'bg-white text-gray-600 border-gray-300 hover:border-purple-400'
          }`}
        >
          Todas
        </button>
        {ESPECIALIDADES.map((esp) => (
          <button
            key={esp.id}
            onClick={() => handleEspecialidade(esp.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              especialidadeId === esp.id
                ? 'bg-purple-700 text-white border-purple-700'
                : 'bg-white text-gray-600 border-gray-300 hover:border-purple-400'
            }`}
          >
            {esp.nome}
          </button>
        ))}
      </div>

      {isError && (
        <p className="text-center text-red-500 py-16">
          Erro ao carregar mentores. Tente novamente.
        </p>
      )}

      {!isError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {isLoading
            ? Array.from({ length: LIMITE }).map((_, i) => <MentorCardSkeleton key={i} />)
            : mentoresFiltrados.map((mentor) => <MentorCard key={mentor.id} mentor={mentor} />)}
        </div>
      )}

      {!isLoading && !isError && mentoresFiltrados.length === 0 && (
        <p className="text-center text-gray-500 py-16">Nenhum mentor encontrado.</p>
      )}

      {data && (
        <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} />
      )}
    </div>
  )
}
