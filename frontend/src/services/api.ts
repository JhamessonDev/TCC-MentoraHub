import axios from 'axios'
import { getToken, getPublicToken } from './tokens'

const api = axios.create({
  baseURL: '/api/v1',
})

api.interceptors.request.use((config) => {
  config.headers['x-trace-id'] = crypto.randomUUID()
  const isAdminRoute = window.location.pathname.startsWith('/admin')
  const token = isAdminRoute ? (getToken() ?? getPublicToken()) : (getPublicToken() ?? getToken())
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

export default api
