import { Test, TestingModule } from '@nestjs/testing';
import { DisplayTextController } from './display-text.controller';

describe('DisplayTextController', () => {
  let controller: DisplayTextController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DisplayTextController],
    }).compile();

    controller = module.get<DisplayTextController>(DisplayTextController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
