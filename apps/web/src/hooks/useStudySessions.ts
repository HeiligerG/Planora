import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studySessionsApi, type CreateStudySessionDto, sessionSubtasksApi } from '../lib/api'

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

export function useUpdateSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<CreateStudySessionDto> }) =>
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
    mutationFn: (input: { task: { id: string; title: string; estimatedMinutes?: number }, whenISO: string }) =>
      studySessionsApi.createFromTask(input.task, input.whenISO),
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