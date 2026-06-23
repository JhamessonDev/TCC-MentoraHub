import { useState, useEffect } from 'react'
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

function initials(nome: string) {
  const parts = nome.trim().split(' ')
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

function StarRating({ value }: { value: number }) {
  const rounded = Math.min(5, Math.max(0, Math.round(value)))
  return (
    <span className="text-yellow-500 text-sm">
      {'★'.repeat(rounded)}{'☆'.repeat(5 - rounded)}
    </span>
  )
}

function MentorCardSkeleton() {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 animate-pulse">
      <div className="w-16 h-16 rounded-full bg-gray-700 mb-4" />
      <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-700 rounded w-1/2 mb-4" />
      <div className="h-3 bg-gray-700 rounded w-2/3" />
    </div>
  )
}

function MentorCard({ mentor }: { mentor: Mentor }) {
  const navigate = useNavigate()
  const primaryEsp = mentor.especialidades[0]?.nome ?? '—'
  const preco = Number(mentor.precoHora)
  const avaliacao = Number(mentor.avaliacaoMedia)

  return (
    <button
      onClick={() => navigate(`/mentores/${mentor.id}`)}
      className="bg-gray-800 rounded-xl border border-gray-700 p-5 text-left hover:shadow-lg hover:border-purple-500 transition-all flex flex-col gap-3 cursor-pointer"
    >
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
        {initials(mentor.usuario.nome)}
      </div>
      <div>
        <p className="font-semibold text-white">{mentor.usuario.nome}</p>
        <p className="text-sm text-purple-400">{primaryEsp}</p>
      </div>
      <div className="flex items-center gap-2">
        <StarRating value={avaliacao} />
        <span className="text-xs text-gray-400">({mentor.totalSessoes})</span>
      </div>
      <p className="text-sm font-medium text-gray-300">
        R$ {preco.toFixed(2)}<span className="font-normal text-gray-500">/hora</span>
      </p>
    </button>
  )
}

const AVATAR_GRADIENTS = [
  'from-purple-500 to-indigo-600',
  'from-pink-500 to-rose-500',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-500',
  'from-blue-500 to-cyan-600',
  'from-violet-500 to-purple-600',
]

function MentorCarousel({ mentors }: { mentors: Mentor[] }) {
  const [idx, setIdx] = useState(0)
  const [resetKey, setResetKey] = useState(0)

  useEffect(() => {
    if (mentors.length === 0) return
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 1) % mentors.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [mentors.length, resetKey])

  const prev = () => {
    setIdx((i) => (i - 1 + mentors.length) % mentors.length)
    setResetKey((k) => k + 1)
  }
  const next = () => {
    setIdx((i) => (i + 1) % mentors.length)
    setResetKey((k) => k + 1)
  }

  if (mentors.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs mx-auto md:mx-0 animate-pulse">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
        <div className="h-3 bg-gray-200 rounded w-2/3 mb-4" />
        <div className="h-px bg-gray-100 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    )
  }

  const mentor = mentors[idx]
  const primaryEsp = mentor.especialidades[0]?.nome ?? '—'
  const preco = Number(mentor.precoHora)
  const avaliacao = Number(mentor.avaliacaoMedia)
  const gradient = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs mx-auto md:mx-0">
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`w-16 h-16 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-xl flex-shrink-0`}
        >
          {initials(mentor.usuario.nome)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-lg leading-tight truncate">{mentor.usuario.nome}</p>
          <p className="text-purple-600 text-sm font-medium truncate">{primaryEsp}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <StarRating value={avaliacao} />
        <span className="text-gray-700 text-sm font-semibold">{avaliacao.toFixed(1)}</span>
        <span className="text-gray-400 text-xs">({mentor.totalSessoes} sessões)</span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Valor por hora</p>
          <p className="text-gray-900 font-bold text-lg">
            R$ {preco.toFixed(0)}<span className="text-gray-400 font-normal text-sm">/h</span>
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={prev}
            aria-label="Mentor anterior"
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ←
          </button>
          <span className="text-xs text-gray-400 w-10 text-center">
            {idx + 1}/{mentors.length}
          </span>
          <button
            onClick={next}
            aria-label="Próximo mentor"
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            →
          </button>
        </div>
      </div>

      <div className="flex justify-center gap-1.5 mt-4">
        {mentors.map((_, i) => (
          <button
            key={i}
            onClick={() => { setIdx(i); setResetKey((k) => k + 1) }}
            aria-label={`Ir para mentor ${i + 1}`}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === idx ? 'bg-purple-600' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

const WHY_ITEMS = [
  {
    icon: '✓',
    title: 'Mentores verificados',
    desc: 'Todos os mentores passam por rigoroso processo de validação de experiência e qualidade.',
  },
  {
    icon: '📅',
    title: 'Sessões online flexíveis',
    desc: 'Agende no horário que funciona para você, de qualquer lugar do mundo.',
  },
  {
    icon: '📈',
    title: 'Acompanhe seu progresso',
    desc: 'Visualize sua evolução e histórico de sessões em um painel completo e intuitivo.',
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [busca, setBusca] = useState('')
  const [especialidadeId, setEspecialidadeId] = useState<number | undefined>()

  const { data, isLoading, isError } = useMentores({
    especialidadeId,
    limit: 8,
  })

  const termo = busca.toLowerCase()
  const mentoresFiltrados = busca
    ? (data?.data ?? []).filter((m) =>
        m.usuario.nome.toLowerCase().includes(termo) ||
        m.especialidades.some((e) => e.nome.toLowerCase().includes(termo))
      )
    : (data?.data ?? [])

  return (
    <div className="bg-gray-900 min-h-screen">
      {/* Hero — two-column */}
      <section className="bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-600 text-white py-20">
        <div className="w-full px-16 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-left">
            <h1 className="text-5xl md:text-6xl xl:text-7xl font-bold leading-tight mb-4">
              Encontre mentores experientes e impulsione sua carreira
            </h1>
            <p className="text-purple-200 text-lg mb-8 max-w-lg">
              Conecte-se com profissionais de referência e acelere o seu crescimento com sessões
              personalizadas de mentoria.
            </p>
            <button
              onClick={() => navigate('/mentores')}
              className="bg-white text-purple-700 font-semibold px-8 py-3 rounded-lg hover:bg-purple-50 transition-colors"
            >
              Encontrar mentor
            </button>
          </div>

          <div className="w-full md:w-80 flex-shrink-0">
            <MentorCarousel mentors={(data?.data ?? []).slice(0, 6)} />
          </div>
        </div>
      </section>

      {/* Why Mentora Hub */}
      <section className="bg-gray-850 py-14 border-b border-gray-700" style={{ background: '#111827' }}>
        <div className="w-full px-16">
          <h2 className="text-2xl font-bold text-white text-center mb-10">Por que a Mentora Hub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {WHY_ITEMS.map((item) => (
              <div
                key={item.title}
                className="flex gap-4 items-start p-6 rounded-xl bg-gray-800 border border-gray-700"
              >
                <span className="text-2xl flex-shrink-0 mt-0.5">{item.icon}</span>
                <div>
                  <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search + Cards */}
      <section className="w-full px-16 py-10">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Buscar por nome ou área..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setEspecialidadeId(undefined)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              !especialidadeId
                ? 'bg-purple-700 text-white border-purple-700'
                : 'bg-gray-800 text-gray-400 border-gray-600 hover:border-purple-500'
            }`}
          >
            Todas
          </button>
          {ESPECIALIDADES.map((esp) => (
            <button
              key={esp.id}
              onClick={() => setEspecialidadeId(especialidadeId === esp.id ? undefined : esp.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                especialidadeId === esp.id
                  ? 'bg-purple-700 text-white border-purple-700'
                  : 'bg-gray-800 text-gray-400 border-gray-600 hover:border-purple-500'
              }`}
            >
              {esp.nome}
            </button>
          ))}
        </div>

        {isError && (
          <p className="text-center text-red-400 py-12">
            Erro ao carregar mentores. Tente novamente.
          </p>
        )}

        {!isError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <MentorCardSkeleton key={i} />)
              : mentoresFiltrados.map((mentor) => <MentorCard key={mentor.id} mentor={mentor} />)}
          </div>
        )}

        {!isLoading && !isError && mentoresFiltrados.length === 0 && (
          <p className="text-center text-gray-500 py-12">Nenhum mentor encontrado.</p>
        )}
      </section>

      {/* Como funciona */}
      <section className="bg-gray-900 py-16 border-t border-gray-800">
        <div className="w-full px-16">
          <h2 className="text-2xl font-bold text-white text-center mb-12">Como funciona</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { n: '1', title: 'Crie sua conta', desc: 'Cadastro rápido em menos de 2 minutos.' },
              { n: '2', title: 'Encontre seu mentor', desc: 'Filtre por área, experiência e avaliação.' },
              { n: '3', title: 'Agende a sessão', desc: 'Escolha data, horário e modalidade.' },
              { n: '4', title: 'Evolua', desc: 'Acompanhe seu progresso e avalie.' },
            ].map((step) => (
              <div key={step.n} className="flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {step.n}
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">{step.title}</p>
                  <p className="text-sm text-gray-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 py-6 border-t border-gray-800">
        <div className="w-full px-16">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <span className="text-white font-bold text-lg">Mentora Hub</span>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Termos de uso</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Contato</a>
            </div>
          </div>
          <p className="text-center text-xs text-gray-600">© 2026 · Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  )
}
