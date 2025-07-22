import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { CreditTransaction } from '../credit/credit-transaction.entity';
import { ApiLog } from './api-log.entity';
import { PaymentLog } from '../payment/payment-log.entity';
import { ApiKey } from '../apikey/api-key.entity';
import { Exclude } from 'class-transformer';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  username: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', nullable: true })
  password_hash: string;

  @CreateDateColumn({ type: 'timestamptz', nullable: false })
  create_at: Date;

  @Column({
    type: 'timestamp',
    name: 'last_login_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  lastLoginAt: Date;

  @Column({ type: 'boolean', nullable: false, default: false })
  is_email_verified: boolean;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  metadata: Record<string, any>;

  @Column({ type: 'integer', nullable: false, default: 0 })
  credit_balance: number;

  @Column({ type: 'integer', nullable: false, default: 0 })
  total_spend: number;

  // Relationships
  @OneToMany(
    () => CreditTransaction,
    (creditTransaction) => creditTransaction.user,
  )
  creditTransactions: CreditTransaction[];

  @OneToMany(() => ApiLog, (apiLog) => apiLog.user)
  apiLogs: ApiLog[];

  @OneToMany(() => PaymentLog, (paymentLog) => paymentLog.user)
  paymentLogs: PaymentLog[];

  @OneToMany(() => ApiKey, (apiKey) => apiKey.user)
  apiKeys: ApiKey[];
}
