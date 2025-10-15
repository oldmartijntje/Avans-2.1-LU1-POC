
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
    @Prop()
    uuid: string;

    @Prop()
    username: string;

    @Prop()
    password?: string;

    @Prop()
    email: string;

    @Prop()
    role: 'TEACHER' | 'STUDENT' | 'ADMIN';

    @Prop({ type: Types.ObjectId, ref: 'Study', default: null })
    study: Types.ObjectId | null;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Subject' }] })
    favourites: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
