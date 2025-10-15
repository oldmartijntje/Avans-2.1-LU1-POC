import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { Course, CourseSchema } from './schema/course.schema';
import { UsersModule } from '../users/users.module';
import { DisplayTextModule } from '../display-text/display-text.module';
import { TagModule } from '../tag/tag.module';
import { CaslAbilityFactory } from '../casl/casl-ability.factory/casl-ability.factory';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }]),
        UsersModule,
        DisplayTextModule,
        TagModule
    ],
    providers: [CourseService, CaslAbilityFactory],
    controllers: [CourseController],
    exports: [CourseService]
})
export class CourseModule { }
