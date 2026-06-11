import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Medicine } from '../medicines/entities/medicine.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { DoseCheckService } from './dose-check.service';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    @InjectRepository(Medicine)
    private readonly medicineRepo: Repository<Medicine>,

    private readonly notificationsService: NotificationsService,

    private readonly doseCheckService: DoseCheckService,
  ) {}

  @Cron('*/5 * * * *') // every 5 minutes
  async checkReminders() {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    const medicines = await this.medicineRepo.find();

    for (const med of medicines) {
      if (med.scheduleTimes.includes(currentTime)) {
        await this.notificationsService.createReminder(
          med.userId,
          med.id,
          `Time to take ${med.name}`,
        );
      }
    }
  }

  @Cron('*/5 * * * *')
  async checkMissed() {
    await this.doseCheckService.checkMissedDoses();
  }
}
