import { Controller, Get, Param, Query, UseGuards, Request, Post, Body, ValidationPipe, Delete, Patch, ParseUUIDPipe, BadRequestException } from '@nestjs/common';
import { AllowAnon } from '../auth/auth.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { DisplayTextService } from './display-text.service';
import { UsersService } from '../users/users.service';
import { GetDisplayTextsDto } from './dto/get-display-texts.dto';
import { UpdateDisplayText } from './dto/update-display-text.dto';

@Controller('display-text')
export class DisplayTextController {
    constructor(
        private readonly displayTextService: DisplayTextService,
        private readonly usersService: UsersService
    ) { }

    @Get()
    async findAllUiElements(@Request() req) {
        return this.displayTextService.findUiElements()
    }

    @Get('orphans')
    async findOrphans(@Request() req) {
        return this.displayTextService.findUnused(req.user?.sub)
    }

    @Get(':key')
    @AllowAnon()
    @UseGuards(AuthGuard)
    async findOne(@Param('key') uiKey: string, @Request() req) {
        // this is different from normal auth methods because the creation of these types of display-text items is restricted to 
        // the role type of ADMIN, and not to a specific CRUD type
        // A teacher is allowed to create displayItems, but not in this way.
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
        // this is different from normal auth methods because the creation of these types of display-text items is restricted to 
        // the role type of ADMIN, and not to a specific CRUD type
        // A teacher is allowed to create displayItems, but not in this way.
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

    @Delete('orphans')
    async deleteUnused(@Request() req) {
        return this.displayTextService.deleteUnused(req.user?.sub)
    }

    @Patch(':key')
    async update(
        @Param('key') uiKey: string,
        @Body(ValidationPipe) updateDisplayText: UpdateDisplayText,
        @Request() req
    ) {
        if (!uiKey) throw new BadRequestException();
        return this.displayTextService.update(uiKey, updateDisplayText, req.user?.sub);
    }
}
