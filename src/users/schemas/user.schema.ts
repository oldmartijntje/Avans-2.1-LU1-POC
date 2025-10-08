
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
    @Prop()
    uuid: string;

    @Prop()
    name: string;

    @Prop()
    password: string;

    @Prop()
    email: string;

    @Prop()
    role: 'TEACHER' | 'STUDENT' | 'ADMIN';
}

export const UserSchema = SchemaFactory.createForClass(User);
