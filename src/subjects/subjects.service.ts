import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subject, SubjectDocument } from './schemas/subject.schema';
import { UsersService } from '../users/users.service';
import { AddSubjectDto } from './dto/add-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { DisplayTextService } from '../display-text/display-text.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SubjectsService {
    constructor(
        @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
        private readonly usersService: UsersService,
        private readonly displayTextService: DisplayTextService
    ) { }

    // LIMIT TO TEACHERS AND ADMINS
    async create(createSubjectDto: AddSubjectDto, userUuid: string) {
        let description = await this.displayTextService.lookupByTranslations(createSubjectDto.descriptionNL, createSubjectDto.descriptionEN, true, userUuid);
        let title = await this.displayTextService.lookupByTranslations(createSubjectDto.titleNL, createSubjectDto.titleEN, true, userUuid);
        const createdSubject = new this.subjectModel({
            uuid: uuidv4(),
            title,
            description,
            ownerUuid: userUuid,
            level: createSubjectDto.level,
            studyPoints: createSubjectDto.studyPoints,
            languages: createSubjectDto.languages
        });
        let subject = await createdSubject.save();
        subject = await subject.populate("description");
        subject = await subject.populate("title");
        return subject;
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

    // LIMIT TO TEACHERS AND ADMINS
    async update(uuid: string, updateSubjectDto: UpdateSubjectDto) {

    }
}
