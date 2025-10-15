import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AddCourseDto } from './dto/add-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CaslAction } from '../casl/dto/caslAction.enum';
import { InjectModel } from '@nestjs/mongoose';
import { Course, CourseDocument } from './schema/course.schema';
import { UsersService } from '../users/users.service';
import { TagService } from '../tag/tag.service';
import { DisplayTextService } from '../display-text/display-text.service';
import { CaslAbilityFactory } from '../casl/casl-ability.factory/casl-ability.factory';
import { v4 as uuidv4 } from 'uuid';
import { Model, Types } from 'mongoose';

@Injectable()
export class CourseService {
    constructor(
        @InjectModel(Course.name) private subjectModel: Model<CourseDocument>,
        private readonly usersService: UsersService,
        private readonly tagService: TagService,
        private readonly displayTextService: DisplayTextService,
        private caslAbilityFactory: CaslAbilityFactory
    ) { }

    async create(createCourseDto: AddCourseDto, userUuid: string) {
        // this is the logic to check whether it is allowed
        const user = await this.usersService.getByUuid(userUuid);
        const ability = this.caslAbilityFactory.createForUser(user);
        if (!ability.can(CaslAction.Create, Course)) {
            throw new UnauthorizedException();
        }
        let newTagsArray: Types.ObjectId[] = [];
        createCourseDto.tags.forEach(async element => {
            let tag = await this.tagService.lookupByName(element, true);
            if (tag) {
                newTagsArray.push(tag);
            }
        });
        let description = await this.displayTextService.lookupByTranslations(createCourseDto.descriptionNL, createCourseDto.descriptionEN, true, userUuid);
        let title = await this.displayTextService.lookupByTranslations(createCourseDto.titleNL, createCourseDto.titleEN, true, userUuid);
        const createdSubject = new this.subjectModel({
            uuid: uuidv4(),
            title,
            description,
            ownerUuid: userUuid,
            tags: newTagsArray,
            languages: createCourseDto.languages
        });
        let subject = await createdSubject.save();
        subject = await subject.populate("description");
        subject = await subject.populate("title");
        subject = await subject.populate("tags");
        return subject;
    }

    async findAll(userUuid: string | undefined) {
        // Logic for finding all courses
        // Similar to the SubjectsService findAll method
    }

    async findOne(uuid: string, userUuid: string) {
        // Logic for finding a single course by UUID
        // Similar to the SubjectsService findOne method
    }

    async update(uuid: string, updateCourseDto: UpdateCourseDto, userUuid: string) {
        // Logic for updating a course
        // Similar to the SubjectsService update method
    }

    async delete(uuid: string, userUuid: string) {
        // Logic for deleting a course
        // Similar to the SubjectsService delete method
    }
}
