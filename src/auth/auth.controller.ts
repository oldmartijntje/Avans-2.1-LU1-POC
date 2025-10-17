
import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Request,
    UnauthorizedException,
    UseGuards,
    ValidationPipe
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { AllowAnon } from './auth.decorator';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private readonly usersService: UsersService) { }

    @AllowAnon()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    signIn(@Body() signInDto: Record<string, any>) {
        return this.authService.signIn(signInDto.username, signInDto.password);
    }

    @AllowAnon()
    @HttpCode(HttpStatus.OK)
    @Post('register')
    signup(@Body(ValidationPipe) createUserDto: CreateUserDto, @Request() req) {
        if (createUserDto.role === "ADMIN") {
            throw new UnauthorizedException("You do not have permissions to do this.")
        }
        return this.usersService.create(createUserDto);
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    async getProfile(@Request() req) {
        return { ...req.user, ... (await this.authService.getProfile(req.user?.sub)), ...{ "sub": undefined } }
    }
}
