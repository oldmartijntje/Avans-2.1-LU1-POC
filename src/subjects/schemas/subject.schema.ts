
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SubjectDocument = HydratedDocument<Subject>;

@Schema()
export class Subject {
    @Prop()
    uuid: string;

    @Prop({ type: Types.ObjectId, ref: 'DisplayText' })
    title: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'DisplayText' })
    description: Types.ObjectId;

    @Prop()
    ownerUuid: string;

    @Prop()
    level: 'NLQF-5' | 'NLQF-6';

    @Prop()
    studyPoints: number;

    @Prop({ type: Types.ObjectId, ref: 'DisplayText' })
    moreInfo: Types.ObjectId;

    @Prop()
    languages: string[];

    @Prop()
    isFavourite?: boolean;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Tag' }] })
    tags: Types.ObjectId[];
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);
