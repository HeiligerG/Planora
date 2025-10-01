import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateTaskDto, UpdateTaskDto, UpdateTaskTagsDto } from './dto'
import { Prisma } from '@prisma/client'
import { normalize } from 'path/posix'

@Injectable()
export class TasksService {
    constructor(private prisma: PrismaService) {}

    async create(userId: string, dto: CreateTaskDto) {
        const data = this.mapCreateDtoToPrisma(userId, dto)
        return this.prisma.task.create({
        data,
        include: { subject: true },
        })
    }

    async findAll(userId: string, dueDate?: string) {
        const where: Prisma.TaskWhereInput = { userId }

        if (dueDate) {
        const { start, end } = startEndOfDay(new Date(dueDate))
        where.dueDate = { gte: start, lt: end }
        }

        return this.prisma.task.findMany({
        where,
        include: { subject: true },
        orderBy: { createdAt: 'asc' },
        })
    }

    async findOne(userId: string, id: string) {
        const task = await this.prisma.task.findFirst({
        where: { id, userId },
        include: { subject: true },
        })
        if (!task) throw new NotFoundException('Task nicht gefunden')
        return task
    }

    async update(userId: string, id: string, dto: UpdateTaskDto) {
        await this.ensureOwned(userId, id)
        const data = this.mapUpdateDtoToPrisma(dto)

        return this.prisma.task.update({
        where: { id },
        data,
        include: { subject: true },
        })
    }

    async updateTaskTags(userId: string, taskId: string, dto: UpdateTaskTagsDto) {
        await this.ensureOwned(userId, taskId)

        let targetTagIds: string[] = []

        if (dto.tagIds) {
            targetTagIds = dto.tagIds
        } else if (dto.tags) {
            const names = dto.tags.map(normalize)
            const ensured = await Promise.all(
            names.map(name =>
                this.prisma.tag.upsert({
                where: { userId_name: { userId, name } },
                create: { userId, name },
                update: {},
                select: { id: true },
                })
            )
            )
            targetTagIds = ensured.map(t => t.id)
        } else {
            targetTagIds = []
        }

        await this.prisma.$transaction([
            this.prisma.taskTag.deleteMany({ where: { taskId } }),
            ...(targetTagIds.length
            ? [
                this.prisma.task.update({
                    where: { id: taskId },
                    data: {
                    tags: {
                        create: targetTagIds.map(tagId => ({ tagId })),
                    },
                    },
                }),
                ]
            : []),
        ])

        return this.prisma.task.findFirst({
            where: { id: taskId, userId },
            include: { subject: true, tags: { include: { tag: true } } },
        })
    }

    async remove(userId: string, id: string) {
        await this.ensureOwned(userId, id)
        return this.prisma.task.delete({ where: { id } })
    }

    async search(userId: string, query: string) {
        const q = query.trim()
        if (!q) {
        return this.findAll(userId)
        }
        return this.prisma.task.findMany({
        where: {
            userId,
            OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            ],
        },
        include: { subject: true },
        orderBy: { createdAt: 'asc' },
        })
    }

    private async ensureOwned(userId: string, id: string) {
        const exists = await this.prisma.task.findFirst({
        where: { id, userId },
        select: { id: true },
        })
        if (!exists) throw new NotFoundException('Task nicht gefunden')
    }

    private mapCreateDtoToPrisma(
        userId: string,
        dto: CreateTaskDto
    ): Prisma.TaskCreateInput {
        return {
        user: { connect: { id: userId } },
        title: dto.title,
        description: dto.description ?? null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        priority: dto.priority ?? 2,
        status: dto.status ?? 'TODO',
        estimatedMinutes: dto.estimatedMinutes ?? null,
        subject: dto.subjectId ? { connect: { id: dto.subjectId } } : undefined,
        }
    }

    private mapUpdateDtoToPrisma(
        dto: UpdateTaskDto
    ): Prisma.TaskUpdateInput {
        const data: Prisma.TaskUpdateInput = {}

        if (dto.title !== undefined) data.title = dto.title
        if (dto.description !== undefined) data.description = dto.description ?? null
        if (dto.dueDate !== undefined) data.dueDate = dto.dueDate ? new Date(dto.dueDate) : null
        if (dto.priority !== undefined) data.priority = dto.priority
        if (dto.status !== undefined) data.status = dto.status
        if (dto.estimatedMinutes !== undefined) data.estimatedMinutes = dto.estimatedMinutes ?? null
        if (dto.subjectId !== undefined) {
        data.subject = dto.subjectId
            ? { connect: { id: dto.subjectId } }
            : { disconnect: true }
        }
        return data
    }
}

function startEndOfDay(d: Date) {
  const start = new Date(d)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start, end }
}