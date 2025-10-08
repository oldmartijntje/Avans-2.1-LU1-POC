import { Body, Controller, Delete, Get, Param, Patch, Post, Query, ParseIntPipe, ValidationPipe, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AllowAnon } from '../auth/auth.decorator';

@Controller('users')
export class UsersController {

    // dependency injection
    // this will create a new one, or use an already created one.
    // this also works with singletons
    constructor(private readonly usersService: UsersService) { }

    @Get() // GET /users or /users?role=value
    findAll(@Query('role') role?: 'TEACHER' | 'STUDENT' | 'ADMIN') {
        return this.usersService.findAll(role);
    }

    // static routes need t be before dynamic routes, otherwise it will be interperated as a param
    @AllowAnon()
    @Get(':uuid') // GET /users/:uuid
    findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
        return this.usersService.findOne(uuid);
    }

    @Post() // POST /users
    create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Patch(':uuid') // PATCH /users/:uuid
    update(@Param('uuid', new ParseUUIDPipe()) uuid: string, @Body(ValidationPipe) updateUserDto: UpdateUserDto) {
        return this.usersService.update(uuid, updateUserDto);
    }

    @Delete(':uuid') // DELETE /users/:uuid
    delete(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
        return this.usersService.delete(uuid);
    }
}
