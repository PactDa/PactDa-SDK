import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../user/user.entity';
import { ApiKeyPermission } from '../permission/api-key-permission.entity';

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamptz', nullable: false })
  create_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expired_at: Date;

  @Column({ type: 'integer', nullable: true })
  quota: number;

  @Column({ type: 'text', nullable: false })
  api_key_encrypt: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  api_key_hash: string;

  @Column({ type: 'boolean', nullable: false })
  revoked: boolean;

  // Relationships
  @ManyToOne(() => User, user => user.apiKeys)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => ApiKeyPermission, apiKeyPermission => apiKeyPermission.apiKey)
  apiKeyPermissions: ApiKeyPermission[];
} 