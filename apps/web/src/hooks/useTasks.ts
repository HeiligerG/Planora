import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tasksApi, Task as ServerTask, CreateTaskDto, UpdateTaskDto, TaskStatus } from '../lib/api'

export type PriorityUI = 'low' | 'medium' | 'high'
export type StatusUI = 'open' | 'in_progress' | 'done'

export interface TaskUI {
  id: string
  title: string
  subject: string
  effortMinutes: number
  due: string
  priority: PriorityUI
  tags: string[]
  status: StatusUI
  description?: string
  subjectId?: string | null
}

const priServerToUI = (p?: number | null): PriorityUI =>
  p === 3 ? 'high' : p === 1 ? 'low' : 'medium'
const priUIToServer = (p: PriorityUI): number =>
  p === 'high' ? 3 : p === 'low' ? 1 : 2

const statusServerToUI = (s: TaskStatus): StatusUI =>
  s === 'DONE' ? 'done' : s === 'IN_PROGRESS' ? 'in_progress' : 'open'
const statusUIToServer = (s: StatusUI): TaskStatus =>
  s === 'done' ? 'DONE' : s === 'in_progress' ? 'IN_PROGRESS' : 'TODO'

const mapServerToUI = (t: ServerTask): TaskUI => ({
  id: t.id,
  title: t.title,
  subject: t.subject?.name ?? '',
  subjectId: t.subject?.id ?? null,
  effortMinutes: t.estimatedMinutes ?? 0,
  due: t.dueDate ?? '',
  priority: priServerToUI(t.priority),
  tags: t.tags?.map(x => x.tag.name) ?? [],
  status: statusServerToUI(t.status),
  description: t.description ?? undefined,
})

const buildCreateDto = (u: Omit<TaskUI, 'id' | 'subject'>): CreateTaskDto => ({
  title: u.title,
  description: u.description,
  dueDate: u.due || null,
  priority: priUIToServer(u.priority),
  status: statusUIToServer(u.status),
  estimatedMinutes: u.effortMinutes ?? null,
  subjectId: u.subjectId ?? null,
  tags: u.tags,
})

const buildUpdateDto = (u: Partial<Omit<TaskUI, 'subject'>>): UpdateTaskDto => {
  const dto: UpdateTaskDto = {}
  if (u.title !== undefined) dto.title = u.title
  if (u.description !== undefined) dto.description = u.description
  if (u.due !== undefined) dto.dueDate = u.due || null
  if (u.priority !== undefined) dto.priority = priUIToServer(u.priority)
  if (u.status !== undefined) dto.status = statusUIToServer(u.status)
  if (u.effortMinutes !== undefined) dto.estimatedMinutes = u.effortMinutes ?? null
  if (u.subjectId !== undefined) dto.subjectId = u.subjectId
  if (u.tags !== undefined) dto.tags = u.tags
  return dto
}

/* ---------- Hooks ---------- */
export function useTasks(dueDate?: string) {
  return useQuery({
    queryKey: ['tasks', { dueDate }],
    queryFn: () => tasksApi.getAll(dueDate ? { dueDate } : undefined).then(arr => arr.map(mapServerToUI)),
  })
}

export function useTask(id?: string) {
  return useQuery({
    queryKey: ['task', id],
    enabled: !!id,
    queryFn: () => tasksApi.getOne(id as string).then(mapServerToUI),
  })
}

export function useSearchTasks(q: string) {
  return useQuery({
    queryKey: ['tasks-search', q],
    enabled: q.trim().length > 0,
    queryFn: () => tasksApi.search(q).then(arr => arr.map(mapServerToUI)),
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Omit<TaskUI, 'id' | 'subject'>) => tasksApi.create(buildCreateDto(input)).then(mapServerToUI),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (args: { id: string; patch: Partial<Omit<TaskUI, 'subject'>> }) =>
      tasksApi.update(args.id, buildUpdateDto(args.patch)).then(mapServerToUI),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      qc.invalidateQueries({ queryKey: ['task', v.id] })
    },
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export function useSetTaskTags() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, tags }: { id: string; tags: string[] }) => tasksApi.setTags(id, tags).then(mapServerToUI),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      qc.invalidateQueries({ queryKey: ['task', v.id] })
    },
  })
}