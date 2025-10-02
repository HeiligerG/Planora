import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateStudySessionDto, UpdateStudySessionDto, CreateSubtaskDto, UpdateSubtaskDto, BulkCreateStudySessionsDto, BulkStudySessionItemDto } from './dto'

@Injectable()
export class StudySessionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateStudySessionDto) {
    return this.prisma.studySession.create({
      data: {
        ...dto,
        userId,
      },
      include: {
        subtasks: true,
      },
    })
  }

  async bulkCreate(userId: string, dto: BulkCreateStudySessionsDto) {
    const items = dto.sessions ?? []
    if (items.length === 0) return []

    // simple Validierung
    for (const s of items) {
      const start = new Date(s.scheduledStart)
      const end = new Date(s.scheduledEnd)
      if (!(start instanceof Date) || isNaN(start.getTime()) || !(end instanceof Date) || isNaN(end.getTime())) {
        throw new BadRequestException('Invalid date in sessions payload')
      }
      if (end <= start) {
        throw new BadRequestException('scheduledEnd must be after scheduledStart')
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const created = []
      for (const s of items) {
        const row = await tx.studySession.create({
          data: {
            userId,
            title: s.title,
            scheduledStart: new Date(s.scheduledStart),
            scheduledEnd: new Date(s.scheduledEnd),
            notes: s.notes ?? null,
          },
          include: { subtasks: true },
        })
        created.push(row)
      }
      return created
    })
  }

  async findAll(userId: string, params?: { startDate?: string; endDate?: string }) {
    const where: any = { userId }

    if (params?.startDate && params?.endDate) {
      where.scheduledStart = {
        gte: new Date(params.startDate),
        lte: new Date(params.endDate),
      }
    }

    return this.prisma.studySession.findMany({
      where,
      include: {
        subtasks: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { scheduledStart: 'asc' },
    })
  }

  async findOne(userId: string, id: string) {
    const session = await this.prisma.studySession.findUnique({
      where: { id },
      include: {
        subtasks: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!session) {
      throw new NotFoundException('Study session not found')
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('Access denied')
    }

    return session
  }

  async update(userId: string, id: string, dto: UpdateStudySessionDto) {
    await this.findOne(userId, id) // Check access

    return this.prisma.studySession.update({
      where: { id },
      data: dto,
      include: {
        subtasks: true,
      },
    })
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id)

    return this.prisma.studySession.delete({
      where: { id },
    })
  }

  async createSubtask(userId: string, sessionId: string, dto: CreateSubtaskDto) {
    await this.findOne(userId, sessionId)

    return this.prisma.sessionSubtask.create({
      data: {
        ...dto,
        sessionId,
      },
    })
  }

  async updateSubtask(userId: string, sessionId: string, subtaskId: string, dto: UpdateSubtaskDto) {
    const session = await this.findOne(userId, sessionId)
    
    const subtask = session.subtasks.find(st => st.id === subtaskId)
    if (!subtask) {
      throw new NotFoundException('Subtask not found')
    }

    return this.prisma.sessionSubtask.update({
      where: { id: subtaskId },
      data: dto,
    })
  }

  async removeSubtask(userId: string, sessionId: string, subtaskId: string) {
    const session = await this.findOne(userId, sessionId)
    
    const subtask = session.subtasks.find(st => st.id === subtaskId)
    if (!subtask) {
      throw new NotFoundException('Subtask not found')
    }

    return this.prisma.sessionSubtask.delete({
      where: { id: subtaskId },
    })
  }

  async getWeekStats(userId: string, weekStart: string) {
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const sessions = await this.prisma.studySession.findMany({
      where: {
        userId,
        scheduledStart: {
          gte: new Date(weekStart),
          lt: weekEnd,
        },
      },
      include: {
        subtasks: true,
      },
    })

    const byDay = Array(7).fill(0).map(() => ({
      planned: 0,
      actual: 0,
      sessions: 0,
    }))

    sessions.forEach(session => {
      const dayOfWeek = (new Date(session.scheduledStart).getDay() + 6) % 7 // Mo=0

      const plannedMinutes = Math.round(
        (new Date(session.scheduledEnd).getTime() - new Date(session.scheduledStart).getTime()) / 60000
      )

      byDay[dayOfWeek].planned += plannedMinutes
      byDay[dayOfWeek].sessions++

      if (session.actualStart && session.actualEnd) {
        const actualMinutes = Math.round(
          (new Date(session.actualEnd).getTime() - new Date(session.actualStart).getTime()) / 60000
        )
        byDay[dayOfWeek].actual += actualMinutes
      }
    })

    return byDay
  }
}