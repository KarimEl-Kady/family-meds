import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Medicine } from '../medicines/entities/medicine.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { DoseLogsService } from '../dose-logs/dose-logs.service';

@Injectable()
export class DoseCheckService {
  constructor(
    @InjectRepository(Medicine)
    private readonly medicineRepo: Repository<Medicine>,

    private readonly doseLogsService: DoseLogsService,

    private readonly notificationsService: NotificationsService,
  ) {}

  async checkMissedDoses(): Promise<void> {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

    // Only check times in the past today
    const medicines = await this.medicineRepo.find({
      where: { isActive: true },
    });

    for (const med of medicines) {
      if (!med.scheduleTimes?.length) continue;

      const hasPastScheduleNow = med.scheduleTimes.some((t) => t <= currentTime);
      if (!hasPastScheduleNow) continue;

      // Get today's logs for this user & medicine
      const todayLogs = await this.doseLogsService.findByMedicineAndUser(
        med.id,
        med.userId,
      );

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const takenToday = todayLogs.filter(
        (log) => new Date(log.takenAt) >= startOfDay,
      );

      if (takenToday.length === 0) {
        await this.notificationsService.createReminder(
          med.userId,
          med.id,
          `MISSED dose: ${med.name}`,
        );
      }
    }
  }
}