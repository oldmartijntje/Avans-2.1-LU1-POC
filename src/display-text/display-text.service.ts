import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DisplayText } from './schemas/display-text.schema';
import { Model } from 'mongoose';

@Injectable()
export class DisplayTextService {

    constructor(@InjectModel(DisplayText.name) private displayTextModel: Model<DisplayText>) { }

    findOne(uiKey: string, isAdmin: boolean, userUuid: string): Promise<DisplayText> | undefined {
        return this.displayTextModel.findOne({ uiKey }).exec().then(displayText => {
            if (!displayText) {
                if (isAdmin) {
                    const createdDisplayText = new this.displayTextModel({
                        dutch: uiKey,
                        creatorUuid: userUuid,
                        english: uiKey,
                        uiKey: uiKey
                    });
                    return createdDisplayText.save();
                }
                throw new NotFoundException('DisplayText Not Found');
            }
            return displayText;
        });
    }
}
