import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateTagDto } from './dto/create-tag.dto'
import { UpdateTagDto } from './dto/update-tag.dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateTagDto) {
    const data = this.mapCreate(userId, dto)
    try {
      return await this.prisma.tag.create({ data })
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new ConflictException('Tag-Name existiert bereits')
      }
      throw e
    }
  }

  async findAll(userId: string) {
    return this.prisma.tag.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    })
  }

  async findOne(userId: string, id: string) {
    const tag = await this.prisma.tag.findFirst({ where: { id, userId } })
    if (!tag) throw new NotFoundException('Tag nicht gefunden')
    return tag
  }

  async update(userId: string, id: string, dto: UpdateTagDto) {
    await this.ensureOwned(userId, id)
    const data = this.mapUpdate(dto)
    try {
      return await this.prisma.tag.update({
        where: { id },
        data,
      })
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new ConflictException('Tag-Name existiert bereits')
      }
      throw e
    }
  }

  async remove(userId: string, id: string) {
    await this.ensureOwned(userId, id)
    return this.prisma.tag.delete({ where: { id } })
  }

  async search(userId: string, q: string) {
    const query = q.trim()
    if (!query) return this.findAll(userId)
    return this.prisma.tag.findMany({
      where: {
        userId,
        name: { contains: query, mode: 'insensitive' },
      },
      orderBy: { name: 'asc' },
    })
  }

  private async ensureOwned(userId: string, id: string) {
    const exists = await this.prisma.tag.findFirst({
      where: { id, userId },
      select: { id: true },
    })
    if (!exists) throw new NotFoundException('Tag nicht gefunden')
  }

  private mapCreate(userId: string, dto: CreateTagDto): Prisma.TagCreateInput | Prisma.TagUncheckedCreateInput {
    return {
      userId,
      name: normalizeTagName(dto.name),
      color: dto.color ?? null,
    }
  }

  private mapUpdate(dto: UpdateTagDto): Prisma.TagUpdateInput | Prisma.TagUncheckedUpdateInput {
    const data: Prisma.TagUpdateInput = {}
    if (dto.name !== undefined) data.name = normalizeTagName(dto.name)
    if (dto.color !== undefined) data.color = dto.color ?? null
    return data
  }
}

function normalizeTagName(name: string) {
  const trimmed = name.trim()
  return trimmed
}