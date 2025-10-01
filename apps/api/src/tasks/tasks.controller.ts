import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common'
import { TasksService } from './tasks.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CreateTaskDto, UpdateTaskDto, UpdateTaskTagsDto } from './dto'

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

    @Post()
    create(@Request() req: any, @Body() dto: CreateTaskDto) {
      return this.tasksService.create(req.user.userId, dto)
    }

    @Get()
    findAll(@Request() req: any, @Query('dueDate') dueDate?: string) {
      return this.tasksService.findAll(req.user.userId, dueDate)
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
      return this.tasksService.findOne(req.user.userId, id)
    }

    @Patch(':id')
    update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
      return this.tasksService.update(req.user.userId, id, dto)
    }

    @Get('search')
    search(@Request() req: any, @Query('q') q: string) {
        return this.tasksService.search(req.user.userId, q)
    }

    @Patch(':id/tags')
    setTags(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateTaskTagsDto) {
        return this.tasksService.updateTaskTags(req.user.userId, id, dto)
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
      return this.tasksService.remove(req.user.userId, id)
    }
}