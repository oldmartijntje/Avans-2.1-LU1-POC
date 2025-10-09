
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DisplayTextDocument = HydratedDocument<DisplayText>;

@Schema()
export class DisplayText {
    @Prop()
    dutch: string;

    @Prop()
    creatorUuid: string;

    @Prop()
    english: string;

    @Prop()
    uiKey?: string;
}

export const DisplayTextSchema = SchemaFactory.createForClass(DisplayText);
