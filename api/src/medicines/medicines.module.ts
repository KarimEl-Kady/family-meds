import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medicine } from './entities/medicine.entity';
import { MedicinesController } from './medicines.controller';
import { MedicinesService } from './medicines.service';
import { DoseLog } from './entities/dose-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Medicine , DoseLog])],
  controllers: [MedicinesController],
  providers: [MedicinesService],
})
export class MedicinesModule {}