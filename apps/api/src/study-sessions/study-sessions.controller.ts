import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common'
import { StudySessionsService } from './study-sessions.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CreateStudySessionDto, UpdateStudySessionDto, CreateSubtaskDto, UpdateSubtaskDto, BulkCreateStudySessionsDto } from './dto'

@Controller('study-sessions')
@UseGuards(JwtAuthGuard)
export class StudySessionsController {
  constructor(private readonly studySessionsService: StudySessionsService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateStudySessionDto) {
    return this.studySessionsService.create(req.user.userId, dto)
  }

  @Post('bulk')
  bulkCreate(@Request() req: any, @Body() dto: BulkCreateStudySessionsDto) {
    return this.studySessionsService.bulkCreate(req.user.userId, dto)
  }

  @Get()
  findAll(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.studySessionsService.findAll(req.user.userId, { startDate, endDate })
  }

  @Get('week-stats')
  getWeekStats(@Request() req: any, @Query('weekStart') weekStart: string) {
    return this.studySessionsService.getWeekStats(req.user.userId, weekStart)
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.studySessionsService.findOne(req.user.userId, id)
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateStudySessionDto) {
    return this.studySessionsService.update(req.user.userId, id, dto)
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.studySessionsService.remove(req.user.userId, id)
  }

  @Post(':sessionId/subtasks')
  createSubtask(
    @Request() req: any,
    @Param('sessionId') sessionId: string,
    @Body() dto: CreateSubtaskDto,
  ) {
    return this.studySessionsService.createSubtask(req.user.userId, sessionId, dto)
  }

  @Patch(':sessionId/subtasks/:subtaskId')
  updateSubtask(
    @Request() req: any,
    @Param('sessionId') sessionId: string,
    @Param('subtaskId') subtaskId: string,
    @Body() dto: UpdateSubtaskDto,
  ) {
    return this.studySessionsService.updateSubtask(req.user.userId, sessionId, subtaskId, dto)
  }

  @Delete(':sessionId/subtasks/:subtaskId')
  removeSubtask(
    @Request() req: any,
    @Param('sessionId') sessionId: string,
    @Param('subtaskId') subtaskId: string,
  ) {
    return this.studySessionsService.removeSubtask(req.user.userId, sessionId, subtaskId)
  }
}