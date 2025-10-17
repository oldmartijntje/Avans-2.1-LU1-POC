import { Module } from '@nestjs/common';
import { DisplayTextService } from './display-text.service';
import { DisplayTextController } from './display-text.controller';
import { DisplayText, DisplayTextSchema } from './schemas/display-text.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { CaslAbilityFactory } from '../casl/casl-ability.factory/casl-ability.factory';
import { Subject, SubjectSchema } from '../subjects/schemas/subject.schema';
import { Course, CourseSchema } from '../course/schema/course.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: DisplayText.name, schema: DisplayTextSchema }]),
        MongooseModule.forFeature([{ name: Subject.name, schema: SubjectSchema }]),
        MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }]),
        UsersModule
    ],
    providers: [
        DisplayTextService,
        CaslAbilityFactory
    ],
    controllers: [DisplayTextController],
    exports: [DisplayTextService]
})
export class DisplayTextModule { }
