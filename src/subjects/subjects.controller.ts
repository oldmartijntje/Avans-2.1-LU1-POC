import { Controller, Get, Post, Body, Param, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { AuthGuard } from '../auth/auth.guard';
import { AddSubjectDto } from './dto/add-subject.dto';

@Controller('subjects')
export class SubjectsController {
    constructor(private readonly subjectsService: SubjectsService) { }

    @Post()
    @UseGuards(AuthGuard)
    create(@Body(ValidationPipe) createSubjectDto: AddSubjectDto, @Request() req) {
        return this.subjectsService.create(createSubjectDto, req.user?.sub);
    }

    @Get()
    findAll() {
        return this.subjectsService.findAll();
    }

    @Get(':uuid')
    findOne(@Param('uuid') uuid: string) {
        return this.subjectsService.findOne(uuid);
    }
}
