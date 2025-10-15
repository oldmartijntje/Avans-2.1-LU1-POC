import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';

@Module({
    imports: [
        // MongooseModule.forFeature([{ name: DisplayText.name, schema: DisplayTextSchema }]),
        // MongooseModule.forFeature([{ name: Subject.name, schema: SubjectSchema }]),
        // UsersModule
    ],
    providers: [CourseService],
    controllers: [CourseController],
    exports: [CourseService]
})
export class CourseModule { }
