// src/lib/api.ts
import { useAuthStore } from '../stores/authStore'

/* -------------------------------- Core -------------------------------- */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = useAuthStore.getState().token

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 401) {
    useAuthStore.getState().logout()
    throw new Error('Unauthorized')
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API request failed (${res.status}): ${text || res.statusText}`)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

/* ------------------------------- Tasks ------------------------------- */

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'

export interface Task {
  id: string
  title: string
  description?: string | null
  dueDate?: string | null
  priority: number | null            // z. B. 1..3 (du hast default 2)
  status: TaskStatus
  estimatedMinutes?: number | null
  subject?: { id: string; name: string } | null
  // Prisma-include: { tags: { include: { tag: true } } }
  tags?: Array<{ tag: { name: string } }>
  createdAt?: string
  updatedAt?: string
}

export interface CreateTaskDto {
  title: string
  description?: string
  dueDate?: string | null            // ISO (oder weglassen)
  priority?: number                  // 1..3
  status?: TaskStatus                // wenn weggelassen -> DB-Default "TODO"
  estimatedMinutes?: number | null
  subjectId?: string | null
  // Tag-Namen; dein Backend kann connectOrCreate machen
  tags?: string[]
}

export type UpdateTaskDto = Partial<CreateTaskDto>

export const tasksApi = {
  /** GET /tasks?dueDate=YYYY-MM-DD (optional) */
  getAll: (params?: { dueDate?: string }) => {
    const qs = params?.dueDate ? `?dueDate=${encodeURIComponent(params.dueDate)}` : ''
    return apiRequest<Task[]>(`/tasks${qs}`)
  },

  /** GET /tasks/:id */
  getOne: (id: string) => apiRequest<Task>(`/tasks/${id}`),

  /** POST /tasks */
  create: (data: CreateTaskDto) =>
    apiRequest<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** PATCH /tasks/:id */
  update: (id: string, data: UpdateTaskDto) =>
    apiRequest<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  /** DELETE /tasks/:id */
  remove: (id: string) =>
    apiRequest<void>(`/tasks/${id}`, { method: 'DELETE' }),

  /** GET /tasks/search?q=...  (entspricht deinem Controller) */
  search: (q: string) =>
    apiRequest<Task[]>(`/tasks/search?q=${encodeURIComponent(q)}`),

  /** PATCH /tasks/:id/tags  (falls du den Tag-Endpoint nutzt: „ersetzen“) */
  setTags: (id: string, tags: string[]) =>
    apiRequest<Task>(`/tasks/${id}/tags`, {
      method: 'PATCH',
      body: JSON.stringify({ tags }),
    }),
}

/* --------------------------- Study Sessions --------------------------- */

export interface Subtask {
  id: string
  sessionId: string
  description: string
  estimatedMinutes: number
  actualMinutes?: number
  completed: boolean
  order: number
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

export interface CreateStudySessionDto {
  title: string
  scheduledStart: string
  scheduledEnd: string
  notes?: string
  tags?: string[]
}

export interface CreateSessionSubtaskDto {
  sessionId: string
  description: string
  estimatedMinutes: number
  taskId?: string
}

export const sessionSubtasksApi = {
  create: (data: CreateSessionSubtaskDto) =>
    apiRequest(`/session-subtasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

/* ---- StudySessions: kleine Quality-of-life Helfer ---- */
export interface CreateStudySessionDto {
  title: string
  scheduledStart: string // ISO
  scheduledEnd: string   // ISO
  notes?: string
}

export const studySessionsApi = {
  getAll: (params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams()
    if (params?.startDate) query.append('startDate', params.startDate)
    if (params?.endDate) query.append('endDate', params.endDate)
    const suffix = query.toString() ? `?${query.toString()}` : ''
    return apiRequest<StudySession[]>(`/study-sessions${suffix}`)
  },

  getOne: (id: string) => apiRequest<StudySession>(`/study-sessions/${id}`),

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
    apiRequest<void>(`/study-sessions/${id}`, { method: 'DELETE' }),

  getWeekStats: (weekStart: string) =>
    apiRequest<Array<{ planned: number; actual: number; sessions: number }>>(
      `/study-sessions/week-stats?${new URLSearchParams({ weekStart })}`
    ),
    
  createFromTask: async (task: { id: string; title: string; estimatedMinutes?: number }, whenISO: string) => {
    const minutes = Math.max(15, task.estimatedMinutes ?? 45)
    const start = new Date(whenISO)
    const end = new Date(start.getTime() + minutes * 60000)
    const session = await apiRequest<StudySession>('/study-sessions', {
      method: 'POST',
      body: JSON.stringify({
        title: task.title,
        scheduledStart: start.toISOString(),
        scheduledEnd: end.toISOString(),
      } satisfies CreateStudySessionDto),
    })
    await sessionSubtasksApi.create({
      sessionId: session.id,
      description: task.title,
      estimatedMinutes: minutes,
      taskId: task.id,
    })
    return session
  },
}

/* --------------------------- Subjects --------------------------- */
export interface Subject {
  id: string
  name: string
  color?: string | null
  weeklyGoalMinutes?: number | null
  createdAt?: string
  updatedAt?: string
  _count?: { tasks: number }
  userId?: string
}

export interface CreateSubjectDto {
  name: string
  color?: string
  weeklyGoalMinutes?: number
}

export type UpdateSubjectDto = Partial<CreateSubjectDto>

export const subjectsApi = {
  getAll: () => apiRequest<Subject[]>('/subjects'),
  getOne: (id: string) => apiRequest<Subject>(`/subjects/${id}`),

  create: (data: CreateSubjectDto) =>
    apiRequest<Subject>('/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateSubjectDto) =>
    apiRequest<Subject>(`/subjects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  remove: (id: string) =>
    apiRequest<void>(`/subjects/${id}`, { method: 'DELETE' }),

  search: (q: string) =>
    apiRequest<Subject[]>(`/subjects/search?q=${encodeURIComponent(q)}`),
}

/* --------------------------- Exams --------------------------- */
export interface Exam {
  id: string
  title: string
  date: string
  duration?: number | null
  location?: string | null
  description?: string | null
  subject: { id: string; name: string }
  subjectId?: string
  prepTimeNeeded?: number | null
  risk: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateExamDto {
  title: string
  date: string
  subjectId: string
  duration?: number
  location?: string
  description?: string
  prepTimeNeeded?: number
  risk?: number
}
export type UpdateExamDto = Partial<CreateExamDto>

export const examsApi = {
  getAll: (params?: { from?: string; to?: string }) => {
    const q = new URLSearchParams()
    if (params?.from) q.append('from', params.from)
    if (params?.to) q.append('to', params.to)
    const qs = q.toString()
    return apiRequest<Exam[]>(`/exams${qs ? `?${qs}` : ''}`)
  },
  getOne: (id: string) => apiRequest<Exam>(`/exams/${id}`),
  create: (data: CreateExamDto) =>
    apiRequest<Exam>('/exams', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UpdateExamDto) =>
    apiRequest<Exam>(`/exams/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: string) => apiRequest<void>(`/exams/${id}`, { method: 'DELETE' }),
}