import { Module } from '@nestjs/common';
import { DisplayTextService } from './display-text.service';
import { DisplayTextController } from './display-text.controller';

@Module({
  providers: [DisplayTextService],
  controllers: [DisplayTextController]
})
export class DisplayTextModule {}
