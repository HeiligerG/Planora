import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateSubjectDto, UpdateSubjectDto } from './dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateSubjectDto) {
    const data = this.mapCreateDtoToPrisma(userId, dto)
    return this.prisma.subject.create({
      data,
      include: { _count: { select: { tasks: true } } },
    })
  }

  async findAll(userId: string) {
    return this.prisma.subject.findMany({
      where: { userId },
      include: { _count: { select: { tasks: true } } },
      orderBy: { name: 'asc' },
    })
  }

  async findOne(userId: string, id: string) {
    const subject = await this.prisma.subject.findFirst({
      where: { id, userId },
      include: { _count: { select: { tasks: true } } },
    })
    if (!subject) throw new NotFoundException('Subject not found')
    return subject
  }

  async update(userId: string, id: string, dto: UpdateSubjectDto) {
    await this.ensureOwned(userId, id)
    const data = this.mapUpdateDtoToPrisma(dto)
    return this.prisma.subject.update({
      where: { id },
      data,
      include: { _count: { select: { tasks: true } } },
    })
  }

  async remove(userId: string, id: string) {
    await this.ensureOwned(userId, id)
    return this.prisma.subject.delete({ where: { id } })
  }

  async search(userId: string, query: string) {
    const q = query.trim()
    if (!q) return this.findAll(userId)
    return this.prisma.subject.findMany({
      where: {
        userId,
        OR: [{ name: { contains: q, mode: 'insensitive' } }],
      },
      include: { _count: { select: { tasks: true } } },
      orderBy: { name: 'asc' },
    })
  }

  private async ensureOwned(userId: string, id: string) {
    const exists = await this.prisma.subject.findFirst({
      where: { id, userId },
      select: { id: true },
    })
    if (!exists) throw new NotFoundException('Subject not found')
  }

  private mapCreateDtoToPrisma(
    userId: string,
    dto: CreateSubjectDto,
  ): Prisma.SubjectCreateInput {
    return {
      user: { connect: { id: userId } },
      name: dto.name,
      color: dto.color ?? null,
      weeklyGoalMinutes: dto.weeklyGoalMinutes ?? 120,
    }
  }

  private mapUpdateDtoToPrisma(dto: UpdateSubjectDto): Prisma.SubjectUpdateInput {
    const data: Prisma.SubjectUpdateInput = {}
    if (dto.name !== undefined) data.name = dto.name
    if (dto.color !== undefined) data.color = dto.color ?? null
    if (dto.weeklyGoalMinutes !== undefined) data.weeklyGoalMinutes = dto.weeklyGoalMinutes
    return data
  }
}