import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FamilyMember, FamilyStatus } from './entities/family-member.entity';
import { UsersService } from '../users/users.service';
import { MedicinesService } from '../medicines/medicines.service';
import { InviteDto } from './dto/invite.dto';

@Injectable()
export class FamilyService {
  constructor(
    @InjectRepository(FamilyMember)
    private readonly repo: Repository<FamilyMember>,

    private readonly usersService: UsersService,
    private readonly medicinesService: MedicinesService,
  ) {}

  /** Caregiver invites a patient by email */
  async invite(caregiverId: string, dto: InviteDto): Promise<FamilyMember> {
    const patient = await this.usersService.findByEmail(dto.patientEmail);
    if (!patient) {
      throw new NotFoundException('No user found with that email');
    }

    if (patient.id === caregiverId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const existing = await this.repo.findOne({
      where: { caregiverId, patientId: patient.id },
    });

    if (existing) {
      if (existing.status === FamilyStatus.ACCEPTED) {
        throw new ConflictException('You already follow this patient');
      }
      if (existing.status === FamilyStatus.PENDING) {
        throw new ConflictException('Invite already sent and pending');
      }
      // Rejected → allow re-invite by updating status
      existing.status = FamilyStatus.PENDING;
      return this.repo.save(existing);
    }

    const link = this.repo.create({
      caregiverId,
      patientId: patient.id,
      status: FamilyStatus.PENDING,
    });

    return this.repo.save(link);
  }

  /** Patient sees all pending invites addressed to them */
  async getPendingForPatient(patientId: string) {
    const links = await this.repo.find({
      where: { patientId, status: FamilyStatus.PENDING },
    });

    // Enrich with caregiver name
    return Promise.all(
      links.map(async (l) => {
        const caregiver = await this.usersService.findById(l.caregiverId);
        return {
          id: l.id,
          caregiver: { id: caregiver?.id, name: caregiver?.name, email: caregiver?.email },
          createdAt: l.createdAt,
        };
      }),
    );
  }

  /** Patient accepts an invite */
  async accept(linkId: string, patientId: string): Promise<FamilyMember> {
    const link = await this.repo.findOne({ where: { id: linkId } });
    if (!link) throw new NotFoundException('Invite not found');
    if (link.patientId !== patientId) throw new ForbiddenException();
    if (link.status !== FamilyStatus.PENDING) {
      throw new BadRequestException('Invite is no longer pending');
    }
    link.status = FamilyStatus.ACCEPTED;
    return this.repo.save(link);
  }

  /** Patient rejects an invite */
  async reject(linkId: string, patientId: string): Promise<FamilyMember> {
    const link = await this.repo.findOne({ where: { id: linkId } });
    if (!link) throw new NotFoundException('Invite not found');
    if (link.patientId !== patientId) throw new ForbiddenException();
    link.status = FamilyStatus.REJECTED;
    return this.repo.save(link);
  }

  /** Caregiver sees their accepted patients */
  async getMyPatients(caregiverId: string) {
    const links = await this.repo.find({
      where: { caregiverId, status: FamilyStatus.ACCEPTED },
    });
    return Promise.all(
      links.map(async (l) => {
        const patient = await this.usersService.findById(l.patientId);
        return {
          linkId: l.id,
          patient: { id: patient?.id, name: patient?.name, email: patient?.email },
        };
      }),
    );
  }

  /** Patient sees who is watching them */
  async getMyCaregivers(patientId: string) {
    const links = await this.repo.find({
      where: { patientId, status: FamilyStatus.ACCEPTED },
    });
    return Promise.all(
      links.map(async (l) => {
        const caregiver = await this.usersService.findById(l.caregiverId);
        return {
          linkId: l.id,
          caregiver: { id: caregiver?.id, name: caregiver?.name, email: caregiver?.email },
        };
      }),
    );
  }

  /** Caregiver views a patient's medicines — checks relationship first */
  async getPatientMedicines(caregiverId: string, patientId: string) {
    const link = await this.repo.findOne({
      where: { caregiverId, patientId, status: FamilyStatus.ACCEPTED },
    });
    if (!link) {
      throw new ForbiddenException('No accepted relationship with this patient');
    }
    return this.medicinesService.findAllByUser(patientId);
  }
}
