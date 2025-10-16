import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateDisplayText {
    @IsString()
    @IsNotEmpty()
    english: string;

    @IsString()
    @IsNotEmpty()
    dutch: string;
}