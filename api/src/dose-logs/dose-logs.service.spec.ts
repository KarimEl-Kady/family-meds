import { Test, TestingModule } from '@nestjs/testing';
import { DoseLogsService } from './dose-logs.service';

describe('DoseLogsService', () => {
  let service: DoseLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DoseLogsService],
    }).compile();

    service = module.get<DoseLogsService>(DoseLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
