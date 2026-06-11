import { Test, TestingModule } from '@nestjs/testing';
import { DoseLogsController } from './dose-logs.controller';

describe('DoseLogsController', () => {
  let controller: DoseLogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DoseLogsController],
    }).compile();

    controller = module.get<DoseLogsController>(DoseLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
