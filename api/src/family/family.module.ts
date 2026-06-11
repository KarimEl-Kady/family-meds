import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FamilyMember } from './entities/family-member.entity';
import { FamilyService } from './family.service';
import { FamilyController } from './family.controller';
import { UsersModule } from '../users/users.module';
import { MedicinesModule } from '../medicines/medicines.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FamilyMember]),
    UsersModule,
    MedicinesModule,
  ],
  controllers: [FamilyController],
  providers: [FamilyService],
})
export class FamilyModule {}
