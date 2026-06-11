import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Medicine } from './entities/medicine.entity';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { DoseLog } from './entities/dose-log.entity';
import { DoseLogsService } from 'src/dose-logs/dose-logs.service';

@Injectable()
export class MedicinesService {
  constructor(
    @InjectRepository(Medicine)
    private readonly medicinesRepository: Repository<Medicine>,

    @InjectRepository(DoseLog)
    private readonly doseLogRepository: Repository<DoseLog>,

    private readonly doseLogsService: DoseLogsService,
  ) {}

  async create(userId: string, dto: CreateMedicineDto) {
    const medicine = this.medicinesRepository.create({
      ...dto,
      userId,
    });

    return this.medicinesRepository.save(medicine);
  }

  async findAllByUser(userId: string) {
    return this.medicinesRepository.find({
      where: { userId },
    });
  }

  async takeMedicine(medicineId: string, userId: string) {
    const medicine = await this.medicinesRepository.findOne({
      where: {
        id: medicineId,
        userId,
      },
    });

  if (!medicine) {
    throw new NotFoundException('Medicine not found');
  }

  if (medicine.quantity <= 0) {
    throw new BadRequestException(
      'Medicine quantity is zero',
    );
  }

  medicine.quantity -= medicine.dosagePerIntake;

  await this.medicinesRepository.save(medicine);

  await this.doseLogsService.createLog({
    medicineId: medicine.id,
    medicineName: medicine.name,
    userId,
    quantityTaken: medicine.dosagePerIntake,
  });

  return medicine;
}

  async getDoseHistory(userId: string, medicineId: string) {
    return this.doseLogRepository.find({
      where: { userId, medicineId },
      order: { createdAt: 'DESC' },
    });
  }
}
