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

@Injectable()
export class MedicinesService {
  constructor(
    @InjectRepository(Medicine)
    private readonly medicinesRepository: Repository<Medicine>,

    @InjectRepository(DoseLog)
    private readonly doseLogRepository: Repository<DoseLog>,
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

  async takeMedicine(userId: string, medicineId: string, quantity: number) {
    const medicine = await this.medicinesRepository.findOne({
      where: { id: medicineId, userId },
    });

    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }

    if (!quantity || quantity <= 0) {
      throw new BadRequestException('Invalid quantity');
    }

    if (medicine.quantity < quantity) {
      throw new BadRequestException('Not enough quantity left');
    }

    // 1. Reduce stock
    medicine.quantity -= quantity;

    await this.medicinesRepository.save(medicine);

    // 2. Create dose log
    const log = this.doseLogRepository.create({
      medicineId,
      userId,
      quantityTaken: quantity,
    });

    await this.doseLogRepository.save(log);

    return {
      medicine,
      log,
    };
  }

  async getDoseHistory(userId: string, medicineId: string) {
    return this.doseLogRepository.find({
      where: { userId, medicineId },
      order: { createdAt: 'DESC' },
    });
  }
}
