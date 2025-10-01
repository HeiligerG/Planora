import { Controller, Post, Body, Param, Request, UseGuards, Get, Patch, Delete, Search } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TagsService } from "./tags.service";
import { CreateTagDto, UpdateTagDto } from "./dto";

@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
    constructor(private readonly tagsService: TagsService) {}

    @Post()
    create(@Request() req: any, @Body() dto: CreateTagDto) {
        return this.tagsService.create(req.user.userId, dto)
    }

    @Get()
    findAll(
        @Request() req: any,
    ) {
        return this.tagsService.findAll(req.user.userId)
    }
    
    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        return this.tagsService.findOne(req.user.userId, id)
    }

    @Patch(':id')
    update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateTagDto) {
        return this.tagsService.update(req.user.userId, id, dto)
    }

    @Search('q')
    search(@Request() req: any, @Param('q') q: string) {
        return this.tagsService.search(req.user.userId, q)
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.tagsService.remove(req.user.userId, id)
    }
}