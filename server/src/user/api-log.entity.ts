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

  @Column({ type: 'text', nullable: false })
  api: string;

  @CreateDateColumn({ type: 'timestamptz', nullable: false })
  createdAt: Date;

  @Column({ type: 'integer', nullable: false })
  credits_used: number;

  @Column({ type: 'boolean', nullable: false })
  success: boolean;

  @Column({ type: 'text', nullable: true })
  error_code: string;

  // Relationships
  @ManyToOne(() => User, (user) => user.apiLogs)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
