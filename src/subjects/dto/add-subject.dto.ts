import { IsString, IsNotEmpty, IsEnum, IsNumber, IsArray } from 'class-validator';

export class AddSubjectDto {
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

    @IsEnum(['NLQF-5', 'NLQF-6'], {
        message: 'level must be either NLQF-5 or NLQF-6'
    })
    level: 'NLQF-5' | 'NLQF-6';

    @IsNumber()
    studyPoints: number;

    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    languages: string[];

    @IsString()
    @IsNotEmpty()
    moreInfoNL: string;

    @IsString()
    @IsNotEmpty()
    moreInfoEN: string;

    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    tags: string[];
}