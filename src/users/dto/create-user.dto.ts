import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {
    // all validation decorators can be found here: https://github.com/typestack/class-validator#validation-decorators
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsEnum(['TEACHER', 'STUDENT', 'ADMIN'], {
        message: "Valid role required"
    })
    role: 'TEACHER' | 'STUDENT' | 'ADMIN';
}