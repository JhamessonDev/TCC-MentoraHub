import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import AdminLayout from './components/admin/AdminLayout'
import PrivateRoute from './components/admin/PrivateRoute'
import HomePage from './pages/HomePage'
import MentoresPage from './pages/MentoresPage'
import MentorProfilePage from './pages/MentorProfilePage'
import LoginPage from './pages/admin/LoginPage'
import PublicLoginPage from './pages/LoginPage'
import CadastroPage from './pages/CadastroPage'
import DashboardPage from './pages/admin/DashboardPage'
import MentoresAdminPage from './pages/admin/MentoresAdminPage'
import UsuariosAdminPage from './pages/admin/UsuariosAdminPage'
import SessoesAdminPage from './pages/admin/SessoesAdminPage'
import MinhasSessoesPage from './pages/MinhasSessoesPage'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public site */}
          <Route
            path="/*"
            element={
              <>
                <Navbar />
                <main>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/mentores" element={<MentoresPage />} />
                    <Route path="/mentores/:id" element={<MentorProfilePage />} />
                    <Route path="/login" element={<PublicLoginPage />} />
                    <Route path="/cadastro" element={<CadastroPage />} />
                    <Route path="/minhas-sessoes" element={<MinhasSessoesPage />} />
                  </Routes>
                </main>
              </>
            }
          />

          {/* Admin — unauthenticated */}
          <Route path="/admin/login" element={<LoginPage />} />

          {/* Admin — protected */}
          <Route element={<PrivateRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<DashboardPage />} />
              <Route path="/admin/mentores" element={<MentoresAdminPage />} />
              <Route path="/admin/usuarios" element={<UsuariosAdminPage />} />
              <Route path="/admin/sessoes" element={<SessoesAdminPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
