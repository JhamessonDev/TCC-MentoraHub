import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { PUBLIC_TOKEN_KEY, PUBLIC_USER_KEY, getCurrentUserData, isPublicAuthenticated } from '../../services/auth'
import api from '../../services/api'

interface Perfil {
  id: number
  nome: string
  email: string
  tipoUsuario: string
  avatarUrl: string | null
}

const TIPO_BADGE: Record<string, { label: string; cls: string }> = {
  mentorando: { label: 'Mentorando', cls: 'bg-green-100 text-green-700' },
  mentor:     { label: 'Mentor',     cls: 'bg-blue-100  text-blue-700'  },
  admin:      { label: 'Admin',      cls: 'bg-purple-100 text-purple-700' },
}

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [loggedIn, setLoggedIn] = useState(isPublicAuthenticated)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(
    () => getCurrentUserData()?.tipoUsuario ?? null,
  )

  // Re-check auth on every route change (handles post-login redirect)
  useEffect(() => {
    const authed = isPublicAuthenticated()
    setLoggedIn(authed)
    if (!authed) {
      setPerfil(null)
      setTipoUsuario(null)
    }
  }, [location.pathname])

  // Cross-tab logout/login sync
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== PUBLIC_TOKEN_KEY) return
      const authed = !!e.newValue
      setLoggedIn(authed)
      if (!authed) {
        setPerfil(null)
        setTipoUsuario(null)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Fetch user profile when authenticated
  useEffect(() => {
    if (!loggedIn) return
    api.get<Perfil>('/auth/profile')
      .then(({ data }) => {
        setPerfil(data)
        setTipoUsuario(data.tipoUsuario)
        localStorage.setItem(PUBLIC_USER_KEY, JSON.stringify(data))
      })
      .catch(() => {
        // Token inválido ou expirado — desloga silenciosamente
        localStorage.removeItem(PUBLIC_TOKEN_KEY)
        localStorage.removeItem(PUBLIC_USER_KEY)
        setLoggedIn(false)
      })
  }, [loggedIn])

  // Close dropdown on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function handleLogout() {
    localStorage.removeItem(PUBLIC_TOKEN_KEY)
    localStorage.removeItem(PUBLIC_USER_KEY)
    setLoggedIn(false)
    setPerfil(null)
    setTipoUsuario(null)
    setDropdownOpen(false)
    navigate('/')
  }

  const primeiroNome = perfil?.nome.split(' ')[0] ?? 'Conta'

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <nav className="max-w-full px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="MH" className="h-8 w-8 object-contain" />
          <span className="text-xl font-bold text-purple-600">Mentora Hub</span>
        </Link>

        {/* Middle nav links */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? 'text-purple-700' : 'text-gray-600 hover:text-gray-900'}`
            }
          >
            Início
          </NavLink>
          <NavLink
            to="/mentores"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? 'text-purple-700' : 'text-gray-600 hover:text-gray-900'}`
            }
          >
            Encontrar Mentor
          </NavLink>
          {loggedIn && (
            <NavLink
              to="/minhas-sessoes"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? 'text-purple-700' : 'text-gray-600 hover:text-gray-900'}`
              }
            >
              Minhas Sessões
            </NavLink>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="relative" ref={dropdownRef}>

            {loggedIn ? (
              /* ── Usuário logado: botão com nome + dropdown de conta ── */
              <>
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {primeiroNome[0]?.toUpperCase()}
                  </span>
                  {primeiroNome}
                  <svg
                    className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                    {/* Cabeçalho com nome, email e badge de tipo */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800 truncate">{perfil?.nome ?? '…'}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{perfil?.email ?? '…'}</p>
                      {tipoUsuario && (() => {
                        const badge = TIPO_BADGE[tipoUsuario]
                        return badge ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1.5 ${badge.cls}`}>
                            {badge.label}
                          </span>
                        ) : null
                      })()}
                    </div>

                    {/* Minhas Sessões */}
                    <Link
                      to="/minhas-sessoes"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Minhas Sessões
                    </Link>

                    {/* Divisor */}
                    <div className="border-t border-gray-100 my-1" />

                    {/* Sair */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sair
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* ── Usuário não logado: dropdown "Entrar" original ── */
              <>
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  Entrar
                  <svg
                    className={`inline ml-1 w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                    <button
                      onClick={() => { setDropdownOpen(false); navigate('/login') }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Sou mentorando
                    </button>
                    <button
                      onClick={() => { setDropdownOpen(false); navigate('/login?tipo=mentor') }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Sou mentor
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {!loggedIn && (
            <Link
              to="/cadastro?tipo=mentor"
              className="bg-purple-700 hover:bg-purple-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Quero mentorar
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
