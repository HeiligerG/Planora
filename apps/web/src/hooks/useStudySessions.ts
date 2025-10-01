import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  studySessionsApi,
  type CreateStudySessionDto,
  type StudySession,
} from '../lib/api'

export interface WeekStatsEntry {
  planned: number
  actual: number
  sessions: number
}

export function useStudySessions(startDate?: string, endDate?: string) {
  return useQuery<StudySession[], Error>({
    queryKey: ['study-sessions', { startDate, endDate }],
    queryFn: () => studySessionsApi.getAll({ startDate, endDate }),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
    enabled: true,
  })
}

export function useStudySession(id?: string) {
  return useQuery<StudySession, Error>({
    queryKey: ['study-sessions', id],
    queryFn: () => studySessionsApi.getOne(id as string),
    enabled: !!id,
    staleTime: 30_000,
  })
}

export function useCreateStudySession() {
  const queryClient = useQueryClient()
  return useMutation<StudySession, Error, CreateStudySessionDto>({
    mutationFn: (data) => studySessionsApi.create(data),
    onSuccess: (_created, _vars, _ctx) => {
      queryClient.invalidateQueries({ queryKey: ['study-sessions'] })
    },
  })
}

export function useUpdateStudySession() {
  const queryClient = useQueryClient()
  return useMutation<
    StudySession,
    Error,
    { id: string; data: Partial<CreateStudySessionDto> }
  >({
    mutationFn: ({ id, data }) => studySessionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-sessions'] })
    },
  })
}

export function useDeleteStudySession() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: (id) => studySessionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-sessions'] })
    },
  })
}

export function useWeekStats(weekStart: string) {
  return useQuery<WeekStatsEntry[], Error>({
    queryKey: ['week-stats', weekStart],
    queryFn: () => studySessionsApi.getWeekStats(weekStart),
    enabled: !!weekStart,
    staleTime: 30_000,
  })
}

export type { StudySession } from '../lib/api'