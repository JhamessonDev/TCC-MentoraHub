import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

type TipoUsuario = 'mentorando' | 'mentor'

export default function CadastroPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const tipoInicial = searchParams.get('tipo') === 'mentor' ? 'mentor' : 'mentorando'

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [tipo, setTipo] = useState<TipoUsuario>(tipoInicial)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem.')
      return
    }
    if (senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      const cadastroRes = await fetch('/api/v1/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, tipoUsuario: tipo }),
      })

      if (cadastroRes.status === 409) {
        setError('Este e-mail já está cadastrado')
        return
      }
      if (cadastroRes.status === 400) {
        setError('Verifique os dados e tente novamente')
        return
      }
      if (cadastroRes.status !== 201) {
        setError('Verifique os dados e tente novamente')
        return
      }

      const loginRes = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      })

      if (loginRes.ok) {
        const { access_token } = await loginRes.json() as { access_token: string }
        localStorage.setItem('mentora_token', access_token)
        navigate('/')
      } else {
        navigate('/login')
      }
    } catch {
      setError('Verifique os dados e tente novamente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-purple-700">
            Mentora Hub
          </Link>
          <p className="text-gray-500 text-sm mt-1">Crie sua conta</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Você é</label>
            <div className="grid grid-cols-2 gap-2">
              {(['mentorando', 'mentor'] as TipoUsuario[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                    tipo === t
                      ? 'bg-purple-700 text-white border-purple-700'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-purple-400'
                  }`}
                >
                  {t === 'mentorando' ? 'Mentorando' : 'Mentor'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1.5">
              Nome completo
            </label>
            <input
              id="nome"
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1.5">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirmar senha
            </label>
            <input
              id="confirmarSenha"
              type="password"
              required
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-700 hover:bg-purple-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Já tem conta?{' '}
          <Link to="/login" className="text-purple-700 font-medium hover:underline">
            Entre
          </Link>
        </p>
      </div>
    </div>
  )
}
