import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medicine } from './entities/medicine.entity';
import { MedicinesController } from './medicines.controller';
import { MedicinesService } from './medicines.service';
import { DoseLogsModule } from '../dose-logs/dose-logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Medicine]),
    DoseLogsModule,
  ],
  controllers: [MedicinesController],
  providers: [MedicinesService],
  exports: [MedicinesService],
})
export class MedicinesModule {}