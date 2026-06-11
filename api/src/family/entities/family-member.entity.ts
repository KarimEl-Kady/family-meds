import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum FamilyStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('family_members')
export class FamilyMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** The caregiver (person who sent the invite) */
  @Column()
  caregiverId: string;

  /** The patient (person being followed) */
  @Column()
  patientId: string;

  @Column({
    type: 'enum',
    enum: FamilyStatus,
    default: FamilyStatus.PENDING,
  })
  status: FamilyStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
