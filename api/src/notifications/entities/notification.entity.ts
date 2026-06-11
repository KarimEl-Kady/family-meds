import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum NotificationType {
  REMINDER = 'REMINDER',
  MISSED = 'MISSED',
  TAKEN = 'TAKEN',
  WARNING = 'WARNING',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  medicineId: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.REMINDER,
  })
  type: NotificationType;

  @Column()
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
