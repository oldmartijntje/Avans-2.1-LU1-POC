import { Module } from '@nestjs/common';
import { DisplayTextService } from './display-text.service';
import { DisplayTextController } from './display-text.controller';
import { DisplayText, DisplayTextSchema } from './schemas/display-text.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: DisplayText.name, schema: DisplayTextSchema }]),
        UsersModule
    ],
    providers: [
        DisplayTextService
    ],
    controllers: [DisplayTextController]
})
export class DisplayTextModule { }
