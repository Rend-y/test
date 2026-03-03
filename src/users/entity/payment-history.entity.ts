import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

export type PaymentAction = 'debit' | 'credit';

@Entity({ name: 'payment_history' })
export class PaymentHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.paymentHistory, { onDelete: 'CASCADE' })
  user!: User;

  @Column()
  userId!: number;

  @Column({ type: 'varchar', length: 16 })
  action!: PaymentAction;

  @Column('numeric', { precision: 15, scale: 2 })
  amount!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  ts!: Date;
}

