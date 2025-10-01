import { Controller, Post, UseGuards, Get } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { SubjectsService } from "./subjects.service";
import { Request, Body, Param, Patch, Query, Delete } from "@nestjs/common/decorators";
import { CreateSubjectDto } from "./dto";

@Controller('subjects')
@UseGuards(JwtAuthGuard)
export class SubjectsController {
    constructor(private readonly subjectService: SubjectsService) {}

    @Post()
    create(@Request() req: any, @Body() dto: CreateSubjectDto) {
        return this.subjectService.create(req.user.userId, dto)
    }

    @Get()
    findAll(@Request() req: any) {
        return this.subjectService.findAll(req.user.userId)
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        return this.subjectService.findOne(req.user.userId, id)
    }

    @Patch(':id')
    update(@Request() req: any, @Param('id') id: string, @Body() dto: CreateSubjectDto) {
        return this.subjectService.update(req.user.userId, id, dto)
    }

    @Get('search')
    search(@Request() req: any, @Query('q') q: string) {
        return this.subjectService.search(req.user.userId, q)
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.subjectService.remove(req.user.userId, id)
    }
}