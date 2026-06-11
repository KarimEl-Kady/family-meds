import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  async createReminder(userId: string, medicineId: string, message: string) {
    const notification = this.notificationRepo.create({
      userId,
      medicineId,
      type: NotificationType.REMINDER,
      message,
    });

    return this.notificationRepo.save(notification);
  }

  async findUserNotifications(userId: string) {
    return this.notificationRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}