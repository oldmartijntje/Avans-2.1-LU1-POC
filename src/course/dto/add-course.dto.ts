import { IsString, IsNotEmpty, IsArray } from 'class-validator';

export class AddCourseDto {
    @IsString()
    @IsNotEmpty()
    titleNL: string;

    @IsString()
    @IsNotEmpty()
    titleEN: string;

    @IsString()
    @IsNotEmpty()
    descriptionNL: string;

    @IsString()
    @IsNotEmpty()
    descriptionEN: string;

    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    languages: string[];

    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    tags: string[];
}