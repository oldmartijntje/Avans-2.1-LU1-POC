import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DisplayTextUpdateItem {
    @IsString()
    @IsNotEmpty()
    uiKey: string;

    @IsString()
    @IsNotEmpty()
    english: string;

    @IsString()
    @IsNotEmpty()
    dutch: string;
}

export class MassUpdateDisplayTextDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DisplayTextUpdateItem)
    uiKeys: DisplayTextUpdateItem[];
}