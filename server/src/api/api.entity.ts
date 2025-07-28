import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiKeyPermission } from '../permission/api-key-permission.entity';

@Entity('apis')
export class Api {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: false })
  path: string;

  @Column({ type: 'varchar', nullable: false })
  method: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  tags: string | null;

  @Column({ type: 'boolean', nullable: false, default: false })
  is_active: boolean;

  // Relationships
  @OneToMany(() => ApiKeyPermission, (apiKeyPermission) => apiKeyPermission.api)
  apiKeyPermissions: ApiKeyPermission[];
}
