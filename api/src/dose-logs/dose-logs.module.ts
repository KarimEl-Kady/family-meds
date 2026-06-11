import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DoseLog } from './entities/dose-log.entity';
import { DoseLogsService } from './dose-logs.service';
import { DoseLogsController } from './dose-logs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DoseLog])],
  controllers: [DoseLogsController],
  providers: [DoseLogsService],
  exports: [DoseLogsService],
})
export class DoseLogsModule {}