import { IsEmail, IsEnum, IsNotEmpty, IsString, Matches } from "class-validator";

export class GetDisplayTextsDto {
    // all validation decorators can be found here: https://github.com/typestack/class-validator#validation-decorators
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    texts: string[];
}