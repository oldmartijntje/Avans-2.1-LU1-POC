
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CourseDocument = HydratedDocument<Course>;

@Schema()
export class Course {
    @Prop()
    uuid: string;

    @Prop({ type: Types.ObjectId, ref: 'DisplayText' })
    title: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'DisplayText' })
    description: Types.ObjectId;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Tag' }] })
    tags: Types.ObjectId[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);
