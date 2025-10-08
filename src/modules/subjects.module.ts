import { Module } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SubjectsController } from './subjects.controller';
import { Subject, SubjectSchema } from './schemas/subject.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: Subject.name, schema: SubjectSchema }])],
    controllers: [SubjectsController],
    providers: [SubjectsService],
    exports: [SubjectsService]
})
export class SubjectsModule { }
