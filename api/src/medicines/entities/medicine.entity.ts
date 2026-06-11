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

  @Column({ nullable: true })
  imageUrl: string;

  @Column()
  quantity: number;

  @Column({ default: 1 })
  dosagePerIntake: number;

  @Column('simple-array')
  scheduleTimes: string[];

  @Column({ nullable: true })
  notes: string;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}