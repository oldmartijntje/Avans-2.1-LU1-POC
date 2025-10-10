import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DisplayText } from './schemas/display-text.schema';
import { Model } from 'mongoose';
import { GetDisplayTextsDto } from './dto/get-display-texts.dto';
import { DisplayTextResponse } from './dto/diplay-text-response.dto';

@Injectable()
export class DisplayTextService {

    constructor(@InjectModel(DisplayText.name) private displayTextModel: Model<DisplayText>) { }

    findOne(uiKey: string, isAdmin: boolean, userUuid: string): Promise<DisplayText> {
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

    findAll(getDisplayTextsDto: GetDisplayTextsDto, isAdmin: boolean, userUuid: string): Promise<DisplayTextResponse[]> {
        const { texts } = getDisplayTextsDto;

        return Promise.all(
            texts.map(async (uiKey) => {
                const displayText = await this.displayTextModel.findOne({ uiKey }).exec();
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
                    throw new NotFoundException(`DisplayText Not Found for uiKey: ${uiKey}`);
                }
                return displayText;
            })
        );
    }
}
