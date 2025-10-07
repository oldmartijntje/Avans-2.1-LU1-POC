import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {
    // all validation decorators can be found here: https://github.com/typestack/class-validator#validation-decorators
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsEnum(['INTERN', 'ENGINEER', 'ADMIN'], {
        message: "Valid role required"
    })
    role: 'INTERN' | 'ENGINEER' | 'ADMIN';
}