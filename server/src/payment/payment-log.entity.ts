import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity('payment_logs')
export class PaymentLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })
  provider: string;

  @CreateDateColumn({ type: 'timestamptz', nullable: false })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  paid_at: Date;

  @Column({ type: 'text', nullable: false, unique: true })
  provider_transaction_id: string;

  @Column({ type: 'decimal', nullable: false })
  amount: number;

  @Column({ type: 'integer', nullable: false })
  credit_amount: number;

  @Column({ type: 'text', nullable: false })
  status: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ type: 'jsonb', nullable: true })
  raw_response: any;

  // Relationships
  @ManyToOne(() => User, (user) => user.paymentLogs)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
