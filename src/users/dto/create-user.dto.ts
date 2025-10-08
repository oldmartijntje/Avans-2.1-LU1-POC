import { IsEmail, IsEnum, IsNotEmpty, IsString, Matches } from "class-validator";

export class CreateUserDto {
    // all validation decorators can be found here: https://github.com/typestack/class-validator#validation-decorators
    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-z0-9_]+$/, {
        message: 'Username may only contain lowercase letters, numbers and underscore (_)',
    })
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsEnum(['TEACHER', 'STUDENT', 'ADMIN'], {
        message: "Valid role required"
    })
    role: 'TEACHER' | 'STUDENT' | 'ADMIN';
}