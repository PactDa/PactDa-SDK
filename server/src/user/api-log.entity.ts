import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('api_log')
export class ApiLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'api', type: 'text', nullable: false })
  api: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', nullable: false })
  createdAt: Date;

  @Column({ name: 'credits_used', type: 'integer', nullable: false })
  creditsUsed: number;

  @Column({ name: 'success', type: 'boolean', nullable: false })
  success: boolean;

  @Column({ name: 'error_code', type: 'text', nullable: true })
  errorCode: string;

  // Relationships
  @ManyToOne(() => User, (user) => user.apiLogs)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
