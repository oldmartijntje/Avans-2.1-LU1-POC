import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
        private readonly usersService: UsersService,
        private readonly tagService: TagService,
        private readonly displayTextService: DisplayTextService,
        private caslAbilityFactory: CaslAbilityFactory
    ) { }

    async create(createCourseDto: AddCourseDto, userUuid: string) {
        // this is the logic to check whether it is allowed
        const user = await this.usersService.findOne(userUuid);
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
        const createdSubject = new this.courseModel({
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
        return this.courseModel.find()
            .populate('description')
            .populate('title')
            .populate('tags')
            .exec();
    }

    async findOne(uuid: string, userUuid: string) {
        return await this.findByUuid(uuid, true);
    }

    async update(uuid: string, updateCourseDto: UpdateCourseDto, userUuid: string) {
        const subject = await this.findByUuid(uuid, true);

        // this is the logic to check whether it is allowed
        const user = await this.usersService.findOne(userUuid);
        const ability = this.caslAbilityFactory.createForUser(user);
        if (!ability.can(CaslAction.Update, subject)) {
            throw new UnauthorizedException();
        }
        let newTagsArray: Types.ObjectId[] = [];
        updateCourseDto.tags?.forEach(async element => {
            let tag = await this.tagService.lookupByName(element, true);
            if (tag) {
                newTagsArray.push(tag);
            }
        });

        const description = subject.description as any;
        const title = subject.title as any;

        const descriptionNL = updateCourseDto.descriptionNL || description?.nl;
        const descriptionEN = updateCourseDto.descriptionEN || description?.en;
        const titleNL = updateCourseDto.titleNL || title?.nl;
        const titleEN = updateCourseDto.titleEN || title?.en;

        const updatedDescription = await this.displayTextService.lookupByTranslations(descriptionNL, descriptionEN, true, userUuid);
        const updatedTitle = await this.displayTextService.lookupByTranslations(titleNL, titleEN, true, userUuid);

        // Update the course fields
        subject.title = updatedTitle || subject.title;
        subject.description = updatedDescription || subject.description;
        subject.languages = updateCourseDto.languages || subject.languages;
        subject.tags = newTagsArray;

        // Save the updated course
        const updatedSubject = await subject.save();
        await updatedSubject.populate("description");
        await updatedSubject.populate("title");
        await updatedSubject.populate("tags");

        return updatedSubject;
    }

    async delete(uuid: string, userUuid: string) {
        const course = await this.findByUuid(uuid, false);

        // this is the logic to check whether it is allowed
        const user = await this.usersService.findOne(userUuid);
        const ability = this.caslAbilityFactory.createForUser(user);
        if (!ability.can(CaslAction.Delete, course)) {
            throw new UnauthorizedException();
        }

        await this.courseModel.deleteOne({ uuid: uuid }).exec();
        return { message: 'Subject deleted successfully' };
    }

    async findByUuid(uuid: string, populate: boolean) {
        let course;
        if (populate) {
            course = await this.courseModel.findOne({ uuid: uuid })
                .populate('description')
                .populate('title')
                .populate('tags')
                .exec();
        } else {
            course = await this.courseModel.findOne({ uuid: uuid }).exec();
        }
        if (!course) {
            throw new NotFoundException('Course Not Found');
        }
        return course
    }

    async joinStudy(userUuid: string, studyUuid: string) {
        const study = await this.findByUuid(studyUuid, false);
        return await this.usersService.setStudy(userUuid, study._id);
    }

    async leaveStudy(userUuid: string) {
        return await this.usersService.deleteStudy(userUuid);
    }

    async getStudy(userUuid: string) {
        const user = await this.usersService.findOne(userUuid);
        if (!user.study) return [];
        let study = user.study as object;
        return [study];
    }
}
