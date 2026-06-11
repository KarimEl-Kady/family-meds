import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Medicine } from '../medicines/entities/medicine.entity';
import { DoseLog } from '../medicines/entities/dose-log.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class DoseCheckService {
  constructor(
    @InjectRepository(Medicine)
    private readonly medicineRepo: Repository<Medicine>,

    @InjectRepository(DoseLog)
    private readonly doseLogRepo: Repository<DoseLog>,

    private readonly notificationsService: NotificationsService,
  ) {}

  async checkMissedDoses() {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    const medicines = await this.medicineRepo.find();

    for (const med of medicines) {
      if (!med.scheduleTimes) continue;

      const hasScheduledNow =
        med.scheduleTimes.includes(currentTime);

      if (!hasScheduledNow) continue;

      // check if user already took it today
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const doseTaken = await this.doseLogRepo.findOne({
        where: {
          medicineId: med.id,
          userId: med.userId,
        },
      });

      if (!doseTaken) {
        await this.notificationsService.createReminder(
          med.userId,
          med.id,
          `MISSED dose: ${med.name}`,
        );
      }
    }
  }
}