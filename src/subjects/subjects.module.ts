import { Module } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SubjectsController } from './subjects.controller';
import { Subject, SubjectSchema } from './schemas/subject.schema';
import { UsersModule } from '../users/users.module';
import { DisplayTextModule } from '../display-text/display-text.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Subject.name, schema: SubjectSchema }]),
        UsersModule,
        DisplayTextModule
    ],
    controllers: [SubjectsController],
    providers: [SubjectsService],
    exports: [SubjectsService]
})
export class SubjectsModule { }
