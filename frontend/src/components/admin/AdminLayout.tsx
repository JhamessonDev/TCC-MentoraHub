import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { logout } from '../../services/auth'

interface NavItem {
  to: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '▪' },
  { to: '/admin/mentores', label: 'Mentores', icon: '▪' },
  { to: '/admin/usuarios', label: 'Usuários', icon: '▪' },
  { to: '/admin/sessoes', label: 'Sessões', icon: '▪' },
]

export default function AdminLayout() {
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-60 bg-gray-950 flex flex-col shrink-0">
        <div className="px-6 py-6 border-b border-gray-800">
          <span className="text-white font-bold text-base leading-tight block">Mentora Hub</span>
          <span className="text-purple-400 text-xs font-medium mt-0.5 block">Admin</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-purple-700 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <span className="text-xs">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <span className="text-xs">▪</span>
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 w-full overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
