export const ADMIN_TOKEN_KEY  = 'mentora_admin_token'
export const ADMIN_USER_KEY   = 'mentora_admin_user'
export const PUBLIC_TOKEN_KEY = 'mentora_token'

export function getToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

export function getPublicToken(): string | null {
  return localStorage.getItem(PUBLIC_TOKEN_KEY)
}
