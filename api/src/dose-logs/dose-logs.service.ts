import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { DoseLog } from './entities/dose-log.entity';

@Injectable()
export class DoseLogsService {
  constructor(
    @InjectRepository(DoseLog)
    private readonly doseLogRepository: Repository<DoseLog>,
  ) {}

  async createLog(data: Partial<DoseLog>) {
    const log = this.doseLogRepository.create(data);

    return this.doseLogRepository.save(log);
  }

  async findByUser(userId: string) {
    return this.doseLogRepository.find({
      where: { userId },
      order: {
        takenAt: 'DESC',
      },
    });
  }
}