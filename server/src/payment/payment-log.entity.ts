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

  @Column({ name: 'provider', type: 'text', nullable: false })
  provider: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', nullable: false })
  createdAt: Date;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt: Date;

  @Column({ name: 'provider_transaction_id', type: 'text', nullable: false, unique: true })
  providerTransactionId: string;

  @Column({ name: 'amount', type: 'decimal', nullable: false })
  amount: number;

  @Column({ name: 'credit_amount', type: 'integer', nullable: false })
  creditAmount: number;

  @Column({ name: 'status', type: 'text', nullable: false })
  status: string;

  @Column({ name: 'note', type: 'text', nullable: true })
  note: string;

  @Column({ name: 'raw_response', type: 'jsonb', nullable: true })
  rawResponse: any;

  // Relationships
  @ManyToOne(() => User, (user) => user.paymentLogs)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
