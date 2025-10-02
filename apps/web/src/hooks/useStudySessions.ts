import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  studySessionsApi,
  sessionSubtasksApi,
  type CreateStudySessionDto,
  type BulkCreateStudySessionsDto,
  type StudySessionUpdate,
} from '../lib/api'

export function useStudySessions(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['study-sessions', startDate, endDate],
    queryFn: () => studySessionsApi.getAll({ startDate, endDate }),
  })
}

export function useCreateSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateStudySessionDto) => studySessionsApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['study-sessions'] }),
  })
}

export function useBulkCreateSessions() {
  const qc = useQueryClient()
  return useMutation({
    mutationKey: ['study-sessions', 'bulkCreate'],
    mutationFn: (payload: BulkCreateStudySessionsDto) =>
      studySessionsApi.bulkCreate(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['study-sessions'] })
    },
  })
}

export function useUpdateSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: StudySessionUpdate }) =>
      studySessionsApi.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['study-sessions'] }),
  })
}

export function useDeleteSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => studySessionsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['study-sessions'] }),
  })
}

export function useCreateSessionFromTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      task: { id: string; title: string; estimatedMinutes?: number }
      whenISO: string
    }) => studySessionsApi.createFromTask(input.task, input.whenISO),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['study-sessions'] }),
  })
}

export function useCreateSessionSubtask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: sessionSubtasksApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['study-sessions'] }),
  })
}

/** Start → setzt actualStart=now, actualEnd=null */
export function useStartSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const now = new Date().toISOString()
      return studySessionsApi.update(id, { actualStart: now, actualEnd: null })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['study-sessions'] }),
  })
}

/** Complete → setzt actualEnd=now */
export function useCompleteSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const now = new Date().toISOString()
      return studySessionsApi.update(id, { actualEnd: now })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['study-sessions'] }),
  })
}