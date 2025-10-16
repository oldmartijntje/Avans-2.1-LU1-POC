import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subject, SubjectDocument } from './schemas/subject.schema';
import { UsersService } from '../users/users.service';
import { AddSubjectDto } from './dto/add-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { DisplayTextService } from '../display-text/display-text.service';
import { v4 as uuidv4 } from 'uuid';
import { CaslAbilityFactory } from '../casl/casl-ability.factory/casl-ability.factory';
import { CaslAction } from '../casl/dto/caslAction.enum';
import { User } from '../users/schemas/user.schema';
import { TagService } from '../tag/tag.service';

@Injectable()
export class SubjectsService {
    constructor(
        @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
        private readonly usersService: UsersService,
        private readonly tagService: TagService,
        private readonly displayTextService: DisplayTextService,
        private caslAbilityFactory: CaslAbilityFactory
    ) { }

    // LIMIT TO TEACHERS AND ADMINS
    async create(createSubjectDto: AddSubjectDto, userUuid: string) {
        // this is the logic to check whether it is allowed
        const user = await this.usersService.findOne(userUuid);
        const ability = this.caslAbilityFactory.createForUser(user);
        if (!ability.can(CaslAction.Create, Subject)) {
            throw new UnauthorizedException();
        }
        let newTagsArray: Types.ObjectId[] = [];
        createSubjectDto.tags.forEach(async element => {
            let tag = await this.tagService.lookupByName(element, true);
            if (tag) {
                newTagsArray.push(tag);
            }
        });
        let description = await this.displayTextService.lookupByTranslations(createSubjectDto.descriptionNL, createSubjectDto.descriptionEN, true, userUuid);
        let title = await this.displayTextService.lookupByTranslations(createSubjectDto.titleNL, createSubjectDto.titleEN, true, userUuid);
        let moreInfo = await this.displayTextService.lookupByTranslations(createSubjectDto.moreInfoNL, createSubjectDto.moreInfoEN, true, userUuid);
        const createdSubject = new this.subjectModel({
            uuid: uuidv4(),
            title,
            description,
            ownerUuid: userUuid,
            level: createSubjectDto.level,
            studyPoints: createSubjectDto.studyPoints,
            moreInfo,
            languages: createSubjectDto.languages,
            tags: newTagsArray
        });
        let subject = await createdSubject.save();
        subject = await subject.populate("description");
        subject = await subject.populate("title");
        subject = await subject.populate('moreInfo');
        subject = await subject.populate("tags");
        return subject;
    }

    async findAll(userUuid: string | undefined, level?: 'NLQF-5' | 'NLQF-6', pointsFilter?: number, tag?: string) {
        const query: any = {};

        if (level) {
            query.level = level;
        }

        if (pointsFilter) {
            query.studyPoints = { $gte: pointsFilter };
        }

        if (tag) {
            const tagDocument = await this.tagService.lookupByName(tag, false);
            if (tagDocument) {
                query.tags = { $in: [tagDocument._id] };
            } else {
                return []
            }
        }

        if (userUuid != undefined) {
            const user = await this.usersService.findOne(userUuid);
            if (!user) {
                return this.subjectModel.find(query).exec();
            }
            const subjects = await this.subjectModel.find(query)
                .populate('description')
                .populate('title')
                .populate('moreInfo')
                .populate('tags')
                .exec();
            subjects.forEach(element => {
                const isFavourite = user.favourites.includes(element._id);
                element.isFavourite = isFavourite;
            });
            return subjects;
        }
        return this.subjectModel.find(query)
            .populate('description')
            .populate('title')
            .populate('moreInfo')
            .populate('tags')
            .exec();
    }

    async findFavourites(userUuid: string) {
        const user = await this.usersService.findOne(userUuid);
        if (!user) {
            throw new NotFoundException('User Not Found');
        }

        if (!user.favourites || user.favourites.length === 0) {
            return [];
        }

        const subjects = await this.subjectModel
            .find({ _id: { $in: user.favourites } })
            .populate('description')
            .populate('title')
            .populate('moreInfo')
            .populate('tags')
            .exec();

        return subjects.map(subject => ({
            ...subject.toObject(),
            isFavourite: true,
        }));
    }

    async addFavouriteBySubjectUuid(userUuid: string, subjectUuid: string): Promise<User> {
        const subject = await this.subjectModel.findOne({ uuid: subjectUuid }).exec();
        if (!subject) {
            throw new NotFoundException('Subject Not Found');
        }

        return this.usersService.addFavourite(userUuid, subject._id.toString());
    }

    async removeFavouriteBySubjectUuid(userUuid: string, subjectUuid: string): Promise<User> {
        const subject = await this.subjectModel.findOne({ uuid: subjectUuid }).exec();
        if (!subject) {
            throw new NotFoundException('Subject Not Found');
        }

        return this.usersService.removeFavourite(userUuid, subject._id.toString());
    }

    async findOne(uuid: string, userUuid: string) {
        const subject = await this.findByUuid(uuid, true);
        const user = await this.usersService.findOne(userUuid);
        if (!user) {
            throw new NotFoundException('User Not Found');
        }

        const isFavourite = user.favourites.includes(subject._id);

        return {
            ...subject.toObject(),
            isFavourite,
        };
    }

    async findByUuid(uuid: string, populate: boolean) {
        let subject;
        if (populate) {
            subject = await this.subjectModel.findOne({ uuid: uuid })
                .populate('description')
                .populate('title')
                .populate('moreInfo')
                .populate('tags')
                .exec();
        } else {
            subject = await this.subjectModel.findOne({ uuid: uuid }).exec();
        }
        if (!subject) {
            throw new NotFoundException('Subject Not Found');
        }
        return subject
    }

    // LIMIT TO TEACHERS AND ADMINS
    async update(uuid: string, updateSubjectDto: UpdateSubjectDto, userUuid: string) {
        const subject = await this.findByUuid(uuid, true);

        // this is the logic to check whether it is allowed
        const user = await this.usersService.findOne(userUuid);
        const ability = this.caslAbilityFactory.createForUser(user);
        if (!ability.can(CaslAction.Update, subject)) {
            throw new UnauthorizedException();
        }
        let newTagsArray: Types.ObjectId[] = [];
        updateSubjectDto.tags?.forEach(async element => {
            let tag = await this.tagService.lookupByName(element, true);
            if (tag) {
                newTagsArray.push(tag);
            }
        });

        // Ensure description and title are properly typed after population
        const description = subject.description as any;
        const title = subject.title as any;
        const moreInfo = subject.moreInfo as any;

        const descriptionNL = updateSubjectDto.descriptionNL || description?.nl;
        const descriptionEN = updateSubjectDto.descriptionEN || description?.en;
        const titleNL = updateSubjectDto.titleNL || title?.nl;
        const titleEN = updateSubjectDto.titleEN || title?.en;
        const moreInfoNL = updateSubjectDto.moreInfoNL || moreInfo?.nl;
        const moreInfoEN = updateSubjectDto.moreInfoEN || moreInfo?.en;

        const updatedDescription = await this.displayTextService.lookupByTranslations(descriptionNL, descriptionEN, true, userUuid);
        const updatedTitle = await this.displayTextService.lookupByTranslations(titleNL, titleEN, true, userUuid);
        const updatedInfo = await this.displayTextService.lookupByTranslations(moreInfoNL, moreInfoEN, true, userUuid);

        // Update the subject fields
        subject.title = updatedTitle || subject.title;
        subject.description = updatedDescription || subject.description;
        subject.level = updateSubjectDto.level || subject.level;
        subject.studyPoints = updateSubjectDto.studyPoints || subject.studyPoints;
        subject.languages = updateSubjectDto.languages || subject.languages;
        subject.moreInfo = updatedInfo || subject.moreInfo;
        subject.tags = newTagsArray;

        // Save the updated subject
        const updatedSubject = await subject.save();
        await updatedSubject.populate("description");
        await updatedSubject.populate("title");
        await updatedSubject.populate("moreInfo");
        await updatedSubject.populate("tags");

        return updatedSubject;
    }

    // LIMIT TO TEACHERS AND ADMINS
    async delete(uuid: string, userUuid: string) {
        const subject = await this.findByUuid(uuid, false);

        // this is the logic to check whether it is allowed
        const user = await this.usersService.findOne(userUuid);
        const ability = this.caslAbilityFactory.createForUser(user);
        if (!ability.can(CaslAction.Delete, subject)) {
            throw new UnauthorizedException();
        }

        await this.subjectModel.deleteOne({ uuid: uuid }).exec();
        return { message: 'Subject deleted successfully' };
    }
}
