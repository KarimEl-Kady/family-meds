import { Module } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medicine } from '../medicines/entities/medicine.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { DoseCheckService } from './dose-check.service';
import { DoseLogsModule } from '../dose-logs/dose-logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Medicine]),
    NotificationsModule,
    DoseLogsModule,
  ],
  providers: [RemindersService, DoseCheckService],
})
export class RemindersModule {}
