import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { subjectsApi, Subject as ServerSubject, CreateSubjectDto, UpdateSubjectDto } from '../lib/api'

export interface SubjectUI {
  id: string
  name: string
  color: string | null
  weeklyGoalMinutes: number
  tasksCount: number
  createdAt?: string
  updatedAt?: string
}

function toUI(s: ServerSubject): SubjectUI {
  const anyS = s as any
  const goal = s.weeklyGoalMinutes ?? anyS.weeklyGoal ?? 120

  return {
    id: s.id,
    name: s.name,
    color: s.color ?? null,
    weeklyGoalMinutes: typeof goal === 'number' ? goal : Number(goal) || 120,
    tasksCount: s._count?.tasks ?? 0,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }
}

function fromUICreate(input: Omit<SubjectUI, 'id' | 'tasksCount' | 'createdAt' | 'updatedAt'>): CreateSubjectDto {
  return {
    name: input.name,
    color: input.color ?? undefined,
    weeklyGoalMinutes: input.weeklyGoalMinutes,
  }
}

function fromUIUpdate(input: Partial<Omit<SubjectUI, 'tasksCount' | 'createdAt' | 'updatedAt'>>): UpdateSubjectDto {
  const dto: UpdateSubjectDto = {}
  if (input.name !== undefined) dto.name = input.name
  if (input.color !== undefined) dto.color = input.color ?? undefined
  if (input.weeklyGoalMinutes !== undefined) dto.weeklyGoalMinutes = input.weeklyGoalMinutes
  return dto
}


export function useSubjects() {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectsApi.getAll().then(arr => arr.map(toUI)),
  })
}

export function useSubject(id?: string) {
  return useQuery({
    queryKey: ['subjects', id],
    enabled: !!id,
    queryFn: () => subjectsApi.getOne(id as string).then(toUI),
  })
}

export function useSearchSubjects(q: string) {
  return useQuery({
    queryKey: ['subjects-search', q],
    enabled: q.trim().length > 0,
    queryFn: () => subjectsApi.search(q).then(arr => arr.map(toUI)),
  })
}

export function useCreateSubject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Omit<SubjectUI, 'id' | 'tasksCount' | 'createdAt' | 'updatedAt'>) =>
      subjectsApi.create(fromUICreate(input)).then(toUI),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects'] }),
  })
}

export function useUpdateSubject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (args: { id: string; patch: Partial<Omit<SubjectUI, 'tasksCount' | 'createdAt' | 'updatedAt'>> }) =>
      subjectsApi.update(args.id, fromUIUpdate(args.patch)).then(toUI),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['subjects'] })
      qc.invalidateQueries({ queryKey: ['subjects', v.id] })
    },
  })
}

export function useDeleteSubject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => subjectsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects'] }),
  })
}