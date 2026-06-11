import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('dose_logs')
export class DoseLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  medicineId: string;

  @Column()
  userId: string;

  @Column()
  medicineName: string;

  @Column()
  quantityTaken: number;

  @CreateDateColumn()
  takenAt: Date;
}