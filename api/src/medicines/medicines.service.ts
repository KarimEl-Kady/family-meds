import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Medicine } from './entities/medicine.entity';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { DoseLogsService } from '../dose-logs/dose-logs.service';

@Injectable()
export class MedicinesService {
  constructor(
    @InjectRepository(Medicine)
    private readonly medicinesRepository: Repository<Medicine>,

    private readonly doseLogsService: DoseLogsService,
  ) {}

  async create(userId: string, dto: CreateMedicineDto): Promise<Medicine> {
    const medicine = this.medicinesRepository.create({
      ...dto,
      userId,
    });

    return this.medicinesRepository.save(medicine);
  }

  async findAllByUser(userId: string): Promise<Medicine[]> {
    return this.medicinesRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Medicine> {
    const medicine = await this.medicinesRepository.findOne({
      where: { id, userId, isActive: true },
    });

    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }

    return medicine;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateMedicineDto,
  ): Promise<Medicine> {
    const medicine = await this.findOne(id, userId);

    Object.assign(medicine, dto);

    return this.medicinesRepository.save(medicine);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const medicine = await this.medicinesRepository.findOne({
      where: { id },
    });

    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }

    if (medicine.userId !== userId) {
      throw new ForbiddenException('You do not own this medicine');
    }

    // Soft-delete: preserve history
    medicine.isActive = false;
    await this.medicinesRepository.save(medicine);

    return { message: 'Medicine deleted' };
  }

  async takeMedicine(medicineId: string, userId: string): Promise<Medicine> {
    const medicine = await this.findOne(medicineId, userId);

    if (medicine.quantity <= 0) {
      throw new BadRequestException(
        'Medicine quantity is zero — please refill',
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
    return this.doseLogsService.findByMedicineAndUser(medicineId, userId);
  }

  async getLowStockMedicines(userId: string): Promise<Medicine[]> {
    const medicines = await this.findAllByUser(userId);
    return medicines.filter((m) => m.quantity <= m.lowStockThreshold);
  }
}
