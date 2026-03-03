import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PaymentHistory } from './payment-history.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('numeric', { precision: 15, scale: 2, default: 0 })
  balance!: string;

  @OneToMany(() => PaymentHistory, (history) => history.user)
  paymentHistory!: PaymentHistory[];
}

