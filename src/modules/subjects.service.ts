import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subject, SubjectDocument } from './schemas/subject.schema';
import { UsersService } from '../users/users.service';
import { AddSubjectDto } from './dto/add-subject.dto';

@Injectable()
export class SubjectsService {
    constructor(
        @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
        private readonly usersService: UsersService
    ) { }

    async create(createSubjectDto: AddSubjectDto, userId: string) {

    }

    async findAll() {
        return this.subjectModel.find().exec();
    }

    async findOne(uuid: string) {
        const subject = await this.subjectModel.findOne({ uuid: uuid }).exec();
        if (!subject) {
            throw new NotFoundException('Subject Not Found');
        }
        return subject;
    }
}
