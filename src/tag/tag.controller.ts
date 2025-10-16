import { Controller, Get, Request } from '@nestjs/common';
import { AllowAnon } from '../auth/auth.decorator';
import { TagService } from './tag.service';

@Controller('tag')
export class TagController {

    constructor(
        private readonly tagService: TagService
    ) { }

    @AllowAnon()
    @Get()
    findAll(@Request() req) {
        return this.tagService.findAll();
    }
}
