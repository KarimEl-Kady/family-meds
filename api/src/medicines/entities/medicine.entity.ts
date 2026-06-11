import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('medicines')
export class Medicine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'text' })
  imageUrl: string | null;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'int', default: 1 })
  dosagePerIntake: number;

  @Column({ type: 'int', default: 5 })
  lowStockThreshold: number;

  @Column({ length: 50, default: 'tablet' })
  unit: string;

  @Column('simple-array')
  scheduleTimes: string[];

  @Column({ nullable: true, type: 'text' })
  notes: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}