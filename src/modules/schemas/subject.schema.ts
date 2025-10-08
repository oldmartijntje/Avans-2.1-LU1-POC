
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SubjectDocument = HydratedDocument<Subject>;

@Schema()
export class Subject {
    @Prop()
    uuid: string;

    @Prop()
    name: string;

    @Prop()
    password?: string;

    @Prop()
    email: string;

    @Prop()
    role: 'TEACHER' | 'STUDENT' | 'ADMIN';
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);
