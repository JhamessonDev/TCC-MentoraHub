export interface Especialidade {
  id: number
  nome: string
  descricao: string
  icone: string
  ativo: boolean
}

export interface Usuario {
  id: number
  nome: string
  email: string
  tipoUsuario: string
  ativo: boolean
  avatarUrl: string | null
}

export interface Mentor {
  id: number
  usuarioId: number
  bio: string
  precoHora: string
  anosExperiencia: number
  linkedinUrl: string
  aprovado: boolean
  avaliacaoMedia: string
  totalSessoes: number
  usuario: Usuario
  especialidades: Especialidade[]
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface QueryMentorParams {
  page?: number
  limit?: number
  especialidadeId?: number
  precoMin?: number
  precoMax?: number
}
