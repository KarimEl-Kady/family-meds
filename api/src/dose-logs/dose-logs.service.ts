import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { DoseLog } from './entities/dose-log.entity';

@Injectable()
export class DoseLogsService {
  constructor(
    @InjectRepository(DoseLog)
    private readonly doseLogRepository: Repository<DoseLog>,
  ) {}

  async createLog(data: Partial<DoseLog>): Promise<DoseLog> {
    const log = this.doseLogRepository.create(data);
    return this.doseLogRepository.save(log);
  }

  async findByUser(userId: string): Promise<DoseLog[]> {
    return this.doseLogRepository.find({
      where: { userId },
      order: { takenAt: 'DESC' },
    });
  }

  async findByMedicineAndUser(
    medicineId: string,
    userId: string,
  ): Promise<DoseLog[]> {
    return this.doseLogRepository.find({
      where: { medicineId, userId },
      order: { takenAt: 'DESC' },
    });
  }

  async findTodayByUser(userId: string): Promise<DoseLog[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.doseLogRepository.find({
      where: {
        userId,
        takenAt: Between(startOfDay, endOfDay),
      },
      order: { takenAt: 'DESC' },
    });
  }
}