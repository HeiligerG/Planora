export interface SessionSubtask {
  id: string
  description: string
  estimatedMinutes: number
  actualMinutes?: number | null
  completed: boolean
  order: number
}

export interface StudySession {
  id: string
  title: string
  scheduledStart: string
  scheduledEnd: string
  actualStart?: string | null
  actualEnd?: string | null
  notes?: string | null
  status: string
  userId: string
  createdAt: string
  updatedAt: string
  subtasks?: SessionSubtask[]
}