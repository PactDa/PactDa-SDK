import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiKeyPermission } from '../permission/api-key-permission.entity';

@Entity('apis')
export class Api {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', type: 'text', nullable: false })
  name: string;

  @Column({ name: 'path', type: 'text', nullable: false })
  path: string;

  @Column({ name: 'method', type: 'varchar', nullable: false })
  method: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'tags', type: 'text', nullable: true })
  tags: string | null;

  @Column({ name: 'is_active', type: 'boolean', nullable: false, default: false })
  isActive: boolean;

  // Relationships
  @OneToMany(() => ApiKeyPermission, (apiKeyPermission) => apiKeyPermission.api)
  apiKeyPermissions: ApiKeyPermission[];
}
