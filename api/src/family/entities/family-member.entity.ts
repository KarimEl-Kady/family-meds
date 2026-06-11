import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export const FamilyStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
} as const;

export type FamilyStatus = typeof FamilyStatus[keyof typeof FamilyStatus];

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

  /** pending | accepted | rejected — stored as varchar to avoid PostgreSQL enum DDL issues */
  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
