import { Controller, Get, Param, Query, UseGuards, Request, Post, Body, ValidationPipe } from '@nestjs/common';
import { AllowAnon } from '../auth/auth.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { DisplayTextService } from './display-text.service';
import { UsersService } from '../users/users.service';
import { GetDisplayTextsDto } from './dto/get-display-texts.dto';

@Controller('display-text')
export class DisplayTextController {
    constructor(
        private readonly displayTextService: DisplayTextService,
        private readonly usersService: UsersService
    ) { }

    @Get(':key')
    @AllowAnon()
    @UseGuards(AuthGuard)
    async findOne(@Param('key') uiKey: string, @Request() req) {
        let isAdmin = false;
        try {
            const user = await this.usersService.findOne(req.user?.sub);
            if (user) {
                isAdmin = user.role === "ADMIN";
            }
        } catch (e) {

        }
        return this.displayTextService.findOne(uiKey, isAdmin, req.user?.sub)
    }

    @Post()
    @AllowAnon()
    @UseGuards(AuthGuard)
    async findAll(@Body(ValidationPipe) getDisplayTextsDto: GetDisplayTextsDto, @Request() req) {
        let isAdmin = false;
        try {
            const user = await this.usersService.findOne(req.user?.sub);
            if (user) {
                isAdmin = user.role === "ADMIN";
            }
        } catch (e) {

        }
        return this.displayTextService.findAll(getDisplayTextsDto, isAdmin, req.user?.sub);
    }
}
