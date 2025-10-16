import { Controller, Get, Post, Body, Param, Request, UseGuards, ValidationPipe, Patch, ParseUUIDPipe, Delete, Req, Query, BadRequestException } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { AuthGuard } from '../auth/auth.guard';
import { AddSubjectDto } from './dto/add-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { CaslAbilityFactory } from '../casl/casl-ability.factory/casl-ability.factory';
import { UsersService } from '../users/users.service';
import { AllowAnon } from '../auth/auth.decorator';

@Controller('subjects')
export class SubjectsController {
    constructor(
        private readonly subjectsService: SubjectsService
    ) { }

    @Post()
    create(@Body(ValidationPipe) createSubjectDto: AddSubjectDto, @Request() req) {
        return this.subjectsService.create(createSubjectDto, req.user?.sub);
    }

    @Get('favourites')
    getFavourites(@Request() req) {
        return this.subjectsService.findFavourites(req.user?.sub)
    }

    @Post('favourite/:uuid')
    setFavourite(@Param('uuid') uuid: string, @Request() req) {
        return this.subjectsService.addFavouriteBySubjectUuid(req.user?.sub, uuid);
    }

    @Delete('favourite/:uuid')
    removeFavourite(@Param('uuid') uuid: string, @Request() req) {
        return this.subjectsService.removeFavouriteBySubjectUuid(req.user?.sub, uuid);
    }

    @AllowAnon()
    @Get()
    findAll(@Request() req, @Query('level') level?: 'NLQF-5' | 'NLQF-6', @Query('points') studyPoints?: string, @Query('tag') tag?: string) {
        let pointsFilter: number | undefined;
        if (studyPoints) {
            if (!isNaN(Number(studyPoints))) {
                pointsFilter = Number(studyPoints);
            } else {
                throw new BadRequestException("'points' is not a number")
            }
        }
        if (level && level != 'NLQF-5' && level != 'NLQF-6') {
            throw new BadRequestException("'level' is either 'NLQF-5' or 'NLQF-6'")
        }
        return this.subjectsService.findAll(req.user?.sub, level, pointsFilter, tag);
    }

    @Get(':uuid')
    findOne(@Param('uuid') uuid: string, @Request() req) {
        return this.subjectsService.findOne(uuid, req.user?.sub);
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
