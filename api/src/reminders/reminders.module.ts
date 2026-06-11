import { Module } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medicine } from 'src/medicines/entities/medicine.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { DoseCheckService } from './dose-check.service';
import { DoseLog } from 'src/medicines/entities/dose-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Medicine, DoseLog]), NotificationsModule],
  providers: [RemindersService, DoseCheckService],
})
export class RemindersModule {}
