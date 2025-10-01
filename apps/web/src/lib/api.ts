import { useAuthStore } from '../stores/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  if (response.status === 401) {
    useAuthStore.getState().logout()
    throw new Error('Unauthorized')
  }

  if (!response.ok) {
    throw new Error('API request failed')
  }

  return response.json()
}

export const tasksApi = {
  getAll: () => apiRequest('/tasks'),
  create: (data: any) => apiRequest('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
}

export interface StudySession {
  id: string
  title: string
  scheduledStart: string
  scheduledEnd: string
  actualStart?: string
  actualEnd?: string
  notes?: string
  status: string
  userId: string
  createdAt: string
  updatedAt: string
  subtasks: Subtask[]
}

export interface Subtask {
  id: string
  sessionId: string
  description: string
  estimatedMinutes: number
  actualMinutes?: number
  completed: boolean
  order: number
}

export interface CreateStudySessionDto {
  title: string
  scheduledStart: string
  scheduledEnd: string
  notes?: string
  tags?: string[]
}

export const studySessionsApi = {
  getAll: (params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams()
    if (params?.startDate) query.append('startDate', params.startDate)
    if (params?.endDate) query.append('endDate', params.endDate)
    return apiRequest<StudySession[]>(`/study-sessions?${query}`)
  },

  getOne: (id: string) => 
    apiRequest<StudySession>(`/study-sessions/${id}`),

  create: (data: CreateStudySessionDto) =>
    apiRequest<StudySession>('/study-sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateStudySessionDto>) =>
    apiRequest<StudySession>(`/study-sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<void>(`/study-sessions/${id}`, {
      method: 'DELETE',
    }),

  getWeekStats: (weekStart: string) => {
    const query = new URLSearchParams({ weekStart })
    return apiRequest<Array<{ planned: number; actual: number; sessions: number }>>(
      `/study-sessions/week-stats?${query}`
    )
  },
}