
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SubjectDocument = HydratedDocument<Subject>;

@Schema()
export class Subject {
    @Prop()
    uuid: string;

    @Prop({ type: Types.ObjectId, ref: 'Translation' })
    title: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Translation' })
    description: Types.ObjectId;

    @Prop()
    ownerUuid: string;

    @Prop()
    level: 'NLQF-5' | 'NLQF-6';

    @Prop()
    studyPoints: number;

    @Prop()
    languages: string[];
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);
