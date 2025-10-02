import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { examsApi, CreateExamDto, UpdateExamDto, Exam } from '../lib/api'

export function useExams(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ['exams', params?.from, params?.to],
    queryFn: () => examsApi.getAll(params),
  })
}

export function useExam(id?: string) {
  return useQuery({
    queryKey: ['exams', id],
    queryFn: () => examsApi.getOne(id!),
    enabled: !!id,
  })
}

export function useCreateExam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateExamDto) => examsApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exams'] }),
  })
}

export function useUpdateExam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateExamDto }) => examsApi.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exams'] }),
  })
}

export function useDeleteExam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => examsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exams'] }),
  })
}