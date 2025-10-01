import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateExamDto } from './dto/create-exam.dto'
import { UpdateExamDto } from './dto/update-exam.dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class ExamsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateExamDto) {
    const data = this.mapCreate(userId, dto)
    return this.prisma.exam.create({
      data,
      include: { subject: true },
    })
  }

  async findAll(userId: string) {
    return this.prisma.exam.findMany({
      where: { userId },
      include: { subject: true },
      orderBy: { date: 'asc' },
    })
  }

  async findOne(userId: string, id: string) {
    const exam = await this.prisma.exam.findFirst({
      where: { id, userId },
      include: { subject: true },
    })
    if (!exam) throw new NotFoundException('Exam not found')
    return exam
  }

  async update(userId: string, id: string, dto: UpdateExamDto) {
    await this.ensureOwned(userId, id)
    const data = this.mapUpdate(dto)
    return this.prisma.exam.update({
      where: { id },
      data,
      include: { subject: true },
    })
  }

  async remove(userId: string, id: string) {
    await this.ensureOwned(userId, id)
    return this.prisma.exam.delete({ where: { id } })
  }

  private async ensureOwned(userId: string, id: string) {
    const found = await this.prisma.exam.findFirst({ where: { id, userId }, select: { id: true } })
    if (!found) throw new NotFoundException('Exam not found')
  }

  private mapCreate(userId: string, dto: CreateExamDto): Prisma.ExamCreateInput {
    return {
      user: { connect: { id: userId } },
      subject: { connect: { id: dto.subjectId } },
      title: dto.title,
      date: new Date(dto.date),
      duration: dto.duration ?? null,
      location: dto.location ?? null,
      description: dto.description ?? null,
      prepTimeNeeded: dto.prepTimeNeeded ?? null,
      risk: dto.risk ?? 2,
    }
  }

  private mapUpdate(dto: UpdateExamDto): Prisma.ExamUpdateInput {
    const data: Prisma.ExamUpdateInput = {}
    if (dto.title !== undefined) data.title = dto.title
    if (dto.date !== undefined) data.date = new Date(dto.date)
    if (dto.duration !== undefined) data.duration = dto.duration ?? null
    if (dto.location !== undefined) data.location = dto.location ?? null
    if (dto.description !== undefined) data.description = dto.description ?? null
    if (dto.prepTimeNeeded !== undefined) data.prepTimeNeeded = dto.prepTimeNeeded ?? null
    if (dto.risk !== undefined) data.risk = dto.risk
    if (dto.subjectId !== undefined) {
      data.subject = dto.subjectId ? { connect: { id: dto.subjectId } } : undefined
    }
    return data
  }
}