import { Controller, Get, Post, Body, Param, Request, ValidationPipe, Patch, ParseUUIDPipe, Delete, Req } from '@nestjs/common';
import { CourseService } from './course.service';
import { AddCourseDto } from './dto/add-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('course')
export class CourseController {
    constructor(private readonly courseService: CourseService) { }

    @Post()
    create(@Body(ValidationPipe) createCourseDto: AddCourseDto, @Request() req) {
        return this.courseService.create(createCourseDto, req.user?.sub);
    }

    @Get()
    findAll(@Request() req) {
        return this.courseService.findAll(req.user?.sub);
    }

    @Get(':uuid')
    findOne(@Param('uuid') uuid: string, @Request() req) {
        return this.courseService.findOne(uuid, req.user?.sub);
    }

    @Patch(':uuid')
    async update(
        @Param('uuid', new ParseUUIDPipe()) uuid: string,
        @Body(ValidationPipe) updateCourseDto: UpdateCourseDto,
        @Request() req
    ) {
        return this.courseService.update(uuid, updateCourseDto, req.user?.sub);
    }

    @Delete(':uuid')
    async deleteCourse(@Param('uuid') uuid: string, @Req() req) {
        return this.courseService.delete(uuid, req.user?.sub);
    }
}
