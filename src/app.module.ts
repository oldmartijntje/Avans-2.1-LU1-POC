import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CaslModule } from './casl/casl.module';
import { SubjectsController } from './subjects/subjects.controller';
import { SubjectsModule } from './subjects/subjects.module';
import { DisplayTextModule } from './display-text/display-text.module';
import { UsersController } from './users/users.controller';
import { DisplayTextController } from './display-text/display-text.controller';
import { CourseController } from './course/course.controller';
import { CourseModule } from './course/course.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        AuthModule,
        UsersModule,
        MongooseModule.forRoot(process.env.MONGO_URI ?? (() => { throw new Error("MONGO_URI is not set in the .env\nHave you used the command: `npm run setup`?\n"); })()),
        CaslModule,
        SubjectsModule,
        DisplayTextModule,
        CourseModule,
    ],
    controllers: [AppController, SubjectsController, CourseController],
    providers: [AppService],
})
export class AppModule { }
