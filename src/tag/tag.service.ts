import { Injectable } from '@nestjs/common';
import { Tag } from './schemas/tag.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class TagService {
    constructor(
        @InjectModel(Tag.name) private tagModel: Model<Tag>
    ) { }

    async lookupByName(name: string, create: boolean) {
        const displayText = await this.tagModel.findOne({ tagName: name }).exec();
        if (!displayText && create) {
            const createdDisplayText = new this.tagModel({
                tagName: name,
            });
            return (await createdDisplayText.save())._id;
        } else if (!displayText) {
            return null;
        } else {
            return displayText._id;
        }
    }
}
