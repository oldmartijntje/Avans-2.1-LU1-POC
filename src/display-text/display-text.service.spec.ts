import { Test, TestingModule } from '@nestjs/testing';
import { DisplayTextService } from './display-text.service';

describe('DisplayTextService', () => {
  let service: DisplayTextService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DisplayTextService],
    }).compile();

    service = module.get<DisplayTextService>(DisplayTextService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
