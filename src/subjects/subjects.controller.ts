import { Controller, Get, Post, Body, Param, Request, UseGuards, ValidationPipe, Patch, ParseUUIDPipe, Delete, Req } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { AuthGuard } from '../auth/auth.guard';
import { AddSubjectDto } from './dto/add-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { CaslAbilityFactory } from '../casl/casl-ability.factory/casl-ability.factory';
import { UsersService } from '../users/users.service';

@Controller('subjects')
export class SubjectsController {
    constructor(
        private readonly subjectsService: SubjectsService
    ) { }

    @Post()
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

    @Patch(':uuid')
    async update(
        @Param('uuid', new ParseUUIDPipe()) uuid: string,
        @Body(ValidationPipe) updateSubjectDto: UpdateSubjectDto,
        @Request() req
    ) {
        return this.subjectsService.update(uuid, updateSubjectDto, req.user?.sub);
    }

    @Delete(':uuid')
    async deleteSubject(@Param('uuid') uuid: string, @Req() req) {
        const userUuid = req.user?.sub;
        return this.subjectsService.delete(uuid, userUuid);
    }
}
