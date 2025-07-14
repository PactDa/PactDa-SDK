import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('credit_transaction')
export class CreditTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: false })
  amount: number;

  @Column({ type: 'text', nullable: false })
  type: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: false })
  referenceType: string;

  @Column({ type: 'text', nullable: false })
  referenceId: string;

  @CreateDateColumn({ type: 'timestamptz', nullable: false })
  createdAt: Date;

  @Column({ type: 'integer', nullable: false })
  balance_after: number;

  // Relationships
  @ManyToOne(() => User, user => user.creditTransactions)
  @JoinColumn({ name: 'user_id' })
  user: User;
} 