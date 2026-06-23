import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import type { Mentor, PaginatedResponse, QueryMentorParams } from '../types/mentor'

export function useMentores(params: QueryMentorParams = {}) {
  const { especialidadeId, page, limit } = params
  const apiParams = { especialidadeId, page, limit }
  return useQuery<PaginatedResponse<Mentor>>({
    queryKey: ['mentores', apiParams],
    queryFn: () =>
      api.get<PaginatedResponse<Mentor>>('/mentores', { params: apiParams }).then((r) => r.data),
  })
}

export function useMentor(id: number | string) {
  return useQuery<Mentor>({
    queryKey: ['mentor', id],
    queryFn: () => api.get<Mentor>(`/mentores/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}
