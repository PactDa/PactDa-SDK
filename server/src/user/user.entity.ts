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

  @Column({ name: 'username', type: 'varchar', nullable: false })
  username: string;

  @Column({ name: 'email', type: 'varchar', nullable: false, unique: true })
  email: string;

  @Exclude()
  @Column({ name: 'password_hash', type: 'varchar', nullable: true })
  passwordHash: string;

  @CreateDateColumn({ name: 'create_at', type: 'timestamptz', nullable: false })
  createAt: Date;

  @Column({
    name: 'last_login_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  lastLoginAt: Date;

  @Column({ name: 'is_email_verified', type: 'boolean', nullable: false, default: false })
  isEmailVerified: boolean;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true, default: {} })
  metadata: Record<string, any>;

  @Column({ name: 'credit_balance', type: 'integer', nullable: false, default: 0 })
  creditBalance: number;

  @Column({ name: 'total_spend', type: 'integer', nullable: false, default: 0 })
  totalSpend: number;

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
