import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../user/user.entity';
import { ApiKeyPermission } from '../permission/api-key-permission.entity';
import { Exclude } from 'class-transformer';

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'create_at', type: 'timestamptz', nullable: false })
  createAt: Date;

  @Column({ name: 'expired_at', type: 'timestamptz', nullable: true })
  expiredAt: Date;

  @Column({ name: 'quota', type: 'integer', nullable: true })
  quota: number;

  @Exclude()
  @Column({ name: 'api_key_encrypt', type: 'text', nullable: false })
  apiKeyEncrypt: string;

  @Exclude()
  @Column({ name: 'api_key_hash', type: 'varchar', nullable: false, unique: true })
  apiKeyHash: string;

  @Column({ name: 'revoked', type: 'boolean', nullable: false })
  revoked: boolean;

  // Relationships
  @ManyToOne(() => User, (user) => user.apiKeys)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(
    () => ApiKeyPermission,
    (apiKeyPermission) => apiKeyPermission.apiKey,
  )
  apiKeyPermissions: ApiKeyPermission[];
}
