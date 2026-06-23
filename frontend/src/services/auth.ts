import api from './api'
import {
  ADMIN_TOKEN_KEY,
  ADMIN_USER_KEY,
  PUBLIC_TOKEN_KEY,
  getToken,
  getPublicToken,
} from './tokens'

export { PUBLIC_TOKEN_KEY, getToken, getPublicToken }

export interface AuthUser {
  id: number
  nome: string
  email: string
  tipoUsuario: string
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const { data } = await api.post<{ access_token: string; user: AuthUser }>('/auth/login', {
    email,
    password,
  })
  localStorage.setItem(ADMIN_TOKEN_KEY, data.access_token)
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(data.user))
  return data.user
}

export function logout(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
  localStorage.removeItem(ADMIN_USER_KEY)
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

export function isPublicAuthenticated(): boolean {
  return !!getPublicToken()
}

export function getCurrentUser(): AuthUser | null {
  const raw = localStorage.getItem(ADMIN_USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}
