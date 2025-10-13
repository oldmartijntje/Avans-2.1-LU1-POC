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
        const { uiKeys } = getDisplayTextsDto;

        return Promise.all(
            uiKeys.map(async (uiKey) => {
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
}
