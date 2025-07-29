import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity('credit_transaction')
export class CreditTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'amount', type: 'integer', nullable: false })
  amount: number;

  @Column({ name: 'type', type: 'text', nullable: false })
  type: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'reference_type', type: 'text', nullable: false })
  referenceType: string;

  @Column({ name: 'reference_id', type: 'text', nullable: false })
  referenceId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', nullable: false })
  createdAt: Date;

  @Column({ name: 'balance_after', type: 'integer', nullable: false })
  balanceAfter: number;

  // Relationships
  @ManyToOne(() => User, (user) => user.creditTransactions)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
