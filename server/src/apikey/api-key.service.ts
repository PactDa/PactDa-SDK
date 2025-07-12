import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from './api-key.entity';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
  ) {}

  async findAll(): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({
      relations: ['user'],
      order: { create_at: 'DESC' }
    });
  }

  async findOne(id: number): Promise<ApiKey | null> {
    return this.apiKeyRepository.findOne({ 
      where: { id },
      relations: ['user']
    });
  }

  async findByUserId(userId: number): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { create_at: 'DESC' }
    });
  }

  async findByApiKeyHash(apiKeyHash: string): Promise<ApiKey | null> {
    return this.apiKeyRepository.findOne({
      where: { api_key_hash: apiKeyHash },
      relations: ['user']
    });
  }

  async findActiveByUserId(userId: number): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({
      where: { user: { id: userId }, revoked: false },
      relations: ['user'],
      order: { create_at: 'DESC' }
    });
  }

  async create(apiKeyData: Partial<ApiKey>): Promise<ApiKey> {
    const apiKey = this.apiKeyRepository.create(apiKeyData);
    return this.apiKeyRepository.save(apiKey);
  }

  async update(id: number, apiKeyData: Partial<ApiKey>): Promise<ApiKey | null> {
    await this.apiKeyRepository.update(id, apiKeyData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.apiKeyRepository.delete(id);
  }

  async revoke(id: number): Promise<ApiKey | null> {
    await this.apiKeyRepository.update(id, { revoked: true });
    return this.findOne(id);
  }

  async activate(id: number): Promise<ApiKey | null> {
    await this.apiKeyRepository.update(id, { revoked: false });
    return this.findOne(id);
  }

  async isExpired(id: number): Promise<boolean> {
    const apiKey = await this.findOne(id);
    if (!apiKey || !apiKey.expired_at) {
      return false;
    }
    return new Date() > apiKey.expired_at;
  }

  async isRevoked(id: number): Promise<boolean> {
    const apiKey = await this.findOne(id);
    return apiKey?.revoked || false;
  }

  async hasQuota(id: number): Promise<boolean> {
    const apiKey = await this.findOne(id);
    if (!apiKey || apiKey.quota === null) {
      return true; // No quota limit
    }
    // This would need to be implemented based on usage tracking
    return true;
  }
} 