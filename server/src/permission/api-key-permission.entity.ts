import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiKey } from '../apikey/api-key.entity';
import { Api } from '../api/api.entity';

@Entity('api_key_permissions')
export class ApiKeyPermission {
  @PrimaryGeneratedColumn()
  id: number;

  // Relationships
  @ManyToOne(() => ApiKey, (apiKey) => apiKey.apiKeyPermissions)
  @JoinColumn({ name: 'api_key_id' })
  apiKey: ApiKey;                     

  @ManyToOne(() => Api, (api) => api.apiKeyPermissions)
  @JoinColumn({ name: 'api_id' })     
  api: Api;                          
}
