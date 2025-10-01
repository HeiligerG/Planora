import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ExamsService } from './exams.service'
import { CreateExamDto } from './dto/create-exam.dto'
import { UpdateExamDto } from './dto/update-exam.dto'

@Controller('exams')
@UseGuards(JwtAuthGuard)
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateExamDto) {
    return this.examsService.create(req.user.userId, dto)
  }

  @Get()
  findAll(@Request() req: any, @Query('from') from?: string, @Query('to') to?: string) {
    if (!from && !to) return this.examsService.findAll(req.user.userId)
    return this.examsService['prisma'].exam.findMany({
      where: {
        userId: req.user.userId,
        ...(from || to ? {
          date: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lt: new Date(to) } : {}),
          }
        } : {})
      },
      include: { subject: true },
      orderBy: { date: 'asc' },
    })
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.examsService.findOne(req.user.userId, id)
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateExamDto) {
    return this.examsService.update(req.user.userId, id, dto)
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.examsService.remove(req.user.userId, id)
  }
}
