import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DisplayText } from './schemas/display-text.schema';
import { Model } from 'mongoose';
import { GetDisplayTextsDto } from './dto/get-display-texts.dto';
import { DisplayTextResponse } from './dto/diplay-text-response.dto';
import { UsersService } from '../users/users.service';
import { CaslAbilityFactory } from '../casl/casl-ability.factory/casl-ability.factory';
import { CaslAction } from '../casl/dto/caslAction.enum';
import { Subject } from 'rxjs';
import { SubjectDocument } from '../subjects/schemas/subject.schema';
import { Course, CourseDocument } from '../course/schema/course.schema';
import { UpdateDisplayText } from './dto/update-display-text.dto';
import { MassUpdateDisplayTextDto, DisplayTextUpdateItem } from './dto/mass-update-display-text.dto';

@Injectable()
export class DisplayTextService {

    constructor(
        @InjectModel(DisplayText.name) private displayTextModel: Model<DisplayText>,
        @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
        private readonly usersService: UsersService,
        private caslAbilityFactory: CaslAbilityFactory
    ) { }

    findOne(uiKey: string, isAdmin: boolean, userUuid: string): Promise<DisplayText> {
        return this.displayTextModel.findOne({ uiKey }).exec().then(displayText => {
            if (!displayText) {
                if (isAdmin) {
                    const createdDisplayText = new this.displayTextModel({
                        dutch: uiKey + " (nieuw)",
                        creatorUuid: userUuid,
                        english: uiKey + " (new)",
                        uiKey: uiKey
                    });
                    return createdDisplayText.save();
                }
                throw new NotFoundException('DisplayText Not Found');
            }
            return displayText;
        });
    }

    findAll(getDisplayTextsDto: GetDisplayTextsDto, isAdmin: boolean, userUuid: string): Promise<DisplayTextResponse[]> {
        const { uiKeys } = getDisplayTextsDto;

        return Promise.all(
            uiKeys.map(async (uiKey) => {
                const displayText = await this.displayTextModel.findOne({ uiKey }).exec();
                if (!displayText) {
                    if (isAdmin) {
                        const createdDisplayText = new this.displayTextModel({
                            dutch: uiKey + " (nieuw)",
                            creatorUuid: userUuid,
                            english: uiKey + " (new)",
                            uiKey: uiKey
                        });
                        return createdDisplayText.save();
                    }
                    return {
                        uiKey: uiKey,
                        notFound: true
                    } as DisplayTextResponse;
                }
                return displayText;
            })
        );
    }

    async lookupByTranslations(dutch: string, english: string, create: boolean, userUuid: string) {
        const displayText = await this.displayTextModel.findOne({ dutch, english }).exec();
        if (!displayText && create) {
            const createdDisplayText = new this.displayTextModel({
                dutch: dutch,
                creatorUuid: userUuid,
                english: english
            });
            return (await createdDisplayText.save())._id;
        } else if (!displayText) {
            return null;
        } else {
            return displayText._id;
        }
    }

    async findUnused(userUuid: string) {
        // this is the logic to check whether it is allowed
        const user = await this.usersService.findOne(userUuid);
        const ability = this.caslAbilityFactory.createForUser(user);
        if (!ability.can(CaslAction.Read, DisplayText)) {
            throw new UnauthorizedException();
        }
        const items = await this.displayTextModel.find({ uiKey: { $exists: false } });
        const subjects = await this.subjectModel.find({}, { title: 1, description: 1, moreInfo: 1 });
        const courses = await this.courseModel.find({}, { title: 1, description: 1 });

        const usedIds = new Set();

        // Check subjects for title, description, and moreInfo
        for (const subject of subjects) {
            const text = `${subject.title ?? ''} ${subject.description ?? ''} ${subject.moreInfo ?? ''}`;
            for (const item of items) {
                if (text.includes(item._id.toString())) {
                    usedIds.add(item._id.toString());
                }
            }
        }

        // Check courses for title and description
        for (const course of courses) {
            const text = `${course.title ?? ''} ${course.description ?? ''}`;
            for (const item of items) {
                if (text.includes(item._id.toString())) {
                    usedIds.add(item._id.toString());
                }
            }
        }

        const unusedItems = items.filter(item => !usedIds.has(item._id.toString()));
        return unusedItems;
    }

    async deleteUnused(userUuid: string) {
        const user = await this.usersService.findOne(userUuid);
        const ability = this.caslAbilityFactory.createForUser(user);
        if (!ability.can(CaslAction.Delete, DisplayText)) {
            throw new UnauthorizedException();
        }
        let unused = await this.findUnused(userUuid);

        const unusedIds = unused.map(item => item._id);
        if (unusedIds.length === 0) {
            return { message: 'No unused display texts found.' };
        }

        const result = await this.displayTextModel.deleteMany({
            _id: { $in: unusedIds },
        });

        return {
            deletedCount: result.deletedCount,
            message: `Deleted ${result.deletedCount} unused display texts.`,
        };
    }

    async deleteDuplicates(userUuid: string) {
        // Check if the user has permission to delete
        const user = await this.usersService.findOne(userUuid);
        const ability = this.caslAbilityFactory.createForUser(user);
        if (!ability.can(CaslAction.Delete, DisplayText)) {
            throw new UnauthorizedException();
        }

        // Find duplicates using aggregation - only consider items where uiKey is defined
        const duplicates = await this.displayTextModel.aggregate([
            {
                $match: {
                    uiKey: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: '$uiKey',
                    count: { $sum: 1 },
                    ids: { $push: '$_id' }
                }
            },
            { $match: { count: { $gt: 1 } } },
            {
                $project: {
                    uiKey: '$_id',
                    duplicateIds: '$ids',
                    _id: 0
                }
            }
        ], { maxTimeMS: 60000, allowDiskUse: true });

        if (duplicates.length === 0) {
            return {
                message: 'No duplicates found.',
                deletedCount: 0,
                duplicateGroups: 0
            };
        }

        let totalDeleted = 0;
        const deletionResults: Array<{
            uiKey: string;
            totalFound: number;
            deleted: number;
            kept: string;
        }> = [];

        // For each group of duplicates, keep the oldest (first created) and delete the rest
        for (const duplicate of duplicates) {
            const { uiKey, duplicateIds } = duplicate;

            // Get the actual documents to sort by creation time (_id contains timestamp)
            const documents = await this.displayTextModel.find({
                _id: { $in: duplicateIds }
            }).sort({ _id: 1 }).exec(); // Sort by _id ascending (oldest first)

            // Keep the first (oldest) document, delete the rest
            const toDelete = documents.slice(1);
            const idsToDelete = toDelete.map(doc => doc._id);

            if (idsToDelete.length > 0) {
                const result = await this.displayTextModel.deleteMany({
                    _id: { $in: idsToDelete }
                });

                totalDeleted += result.deletedCount;
                deletionResults.push({
                    uiKey,
                    totalFound: documents.length,
                    deleted: result.deletedCount,
                    kept: documents[0]._id.toString()
                });
            }
        }

        return {
            message: `Found ${duplicates.length} duplicate groups and deleted ${totalDeleted} duplicate display texts.`,
            deletedCount: totalDeleted,
            duplicateGroups: duplicates.length,
            results: deletionResults
        };
    }

    async findUiElements() {
        return this.displayTextModel.find({ uiKey: { $exists: true } }).exec();
    }

    async update(uiKey: string, updateDisplayText: UpdateDisplayText, userUuid: string) {
        const displayText = await this.displayTextModel.findOne({ uiKey }).exec();
        console.log(displayText, uiKey)

        if (!displayText) {
            throw new NotFoundException(`DisplayText with uiKey '${uiKey}' not found.`);
        }

        // Check if the user has permission to update
        const user = await this.usersService.findOne(userUuid);
        const ability = this.caslAbilityFactory.createForUser(user);
        if (!ability.can(CaslAction.Update, displayText)) {
            throw new UnauthorizedException();
        }

        // Update the fields
        displayText.english = updateDisplayText.english;
        displayText.dutch = updateDisplayText.dutch;

        return displayText.save();
    }

    async massUpdate(massUpdateDisplayTextDto: MassUpdateDisplayTextDto, userUuid: string) {
        const { uiKeys } = massUpdateDisplayTextDto;
        const results: any[] = [];
        const errors: any[] = [];

        // Check if the user has permission to update
        const user = await this.usersService.findOne(userUuid);
        const ability = this.caslAbilityFactory.createForUser(user);

        for (const item of uiKeys) {
            try {
                let displayText = await this.displayTextModel.findOne({ uiKey: item.uiKey }).exec();
                let isCreating = false;

                if (!displayText) {
                    // Create new display text if it doesn't exist
                    displayText = new this.displayTextModel({
                        uiKey: item.uiKey,
                        english: item.english,
                        dutch: item.dutch,
                        creatorUuid: userUuid
                    });
                    isCreating = true;
                }

                // Check permission for the action (create or update)
                const action = isCreating ? CaslAction.Create : CaslAction.Update;
                if (!ability.can(action, displayText)) {
                    errors.push({
                        uiKey: item.uiKey,
                        error: `Unauthorized to ${isCreating ? 'create' : 'update'} this display text.`
                    });
                    continue;
                }

                if (!isCreating) {
                    // Update existing fields
                    displayText.english = item.english;
                    displayText.dutch = item.dutch;
                }

                const savedDisplayText = await displayText.save();
                results.push({
                    uiKey: item.uiKey,
                    success: true,
                    created: isCreating,
                    data: savedDisplayText
                });

            } catch (error) {
                errors.push({
                    uiKey: item.uiKey,
                    error: error.message || 'Unknown error occurred'
                });
            }
        } return {
            successful: results.length,
            failed: errors.length,
            results,
            errors
        };
    }
}
