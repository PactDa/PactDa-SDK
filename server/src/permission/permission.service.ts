import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKeyPermission } from './api-key-permission.entity';
import { ApiKey } from '../apikey/api-key.entity';
import { Api } from '../api/api.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(ApiKeyPermission)
    private apiKeyPermissionRepository: Repository<ApiKeyPermission>,
  ) {}

  async findAll(): Promise<ApiKeyPermission[]> {
    return this.apiKeyPermissionRepository.find({
      relations: ['apiKey', 'api'],
      order: { id: 'ASC' }
    });
  }

  async findOne(id: number): Promise<ApiKeyPermission | null> {
    return this.apiKeyPermissionRepository.findOne({ 
      where: { id },
      relations: ['apiKey', 'api']
    });
  }

  async findByApiKeyId(apiKeyId: number): Promise<ApiKeyPermission[]> {
    return this.apiKeyPermissionRepository.find({
      where: { apiKey: { id: apiKeyId } },
      relations: ['apiKey', 'api'],
      order: { id: 'ASC' }
    });
  }

  async findByApiId(apiId: number): Promise<ApiKeyPermission[]> {
    return this.apiKeyPermissionRepository.find({
      where: { api: { id: apiId } },
      relations: ['apiKey', 'api'],
      order: { id: 'ASC' }
    });
  }

  async findByApiKeyAndApi(apiKeyId: number, apiId: number): Promise<ApiKeyPermission | null> {
    return this.apiKeyPermissionRepository.findOne({
      where: { apiKey: { id: apiKeyId }, api: { id: apiId } },
      relations: ['apiKey', 'api']
    });
  }

  async create(permissionData: Partial<ApiKeyPermission>): Promise<ApiKeyPermission> {
    const permission = this.apiKeyPermissionRepository.create(permissionData);
    return this.apiKeyPermissionRepository.save(permission);
  }

  async update(id: number, permissionData: Partial<ApiKeyPermission>): Promise<ApiKeyPermission | null> {
    await this.apiKeyPermissionRepository.update(id, permissionData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.apiKeyPermissionRepository.delete(id);
  }

  async removeByApiKeyAndApi(apiKeyId: number, apiId: number): Promise<void> {
    await this.apiKeyPermissionRepository.delete({
      apiKey: { id: apiKeyId },
      api: { id: apiId }
    });
  }

  async hasPermission(apiKeyId: number, apiId: number): Promise<boolean> {
    const permission = await this.findByApiKeyAndApi(apiKeyId, apiId);
    return permission !== null;
  }

  async getApiKeyPermissions(apiKeyId: number): Promise<ApiKeyPermission[]> {
    return this.findByApiKeyId(apiKeyId);
  }

  async getApiPermissions(apiId: number): Promise<ApiKeyPermission[]> {
    return this.findByApiId(apiId);
  }

  async grantPermission(apiKeyId: number, apiId: number): Promise<ApiKeyPermission> {
    const existingPermission = await this.findByApiKeyAndApi(apiKeyId, apiId);
    if (existingPermission) {
      return existingPermission;
    }
    const permission = this.apiKeyPermissionRepository.create();
    permission.apiKey = { id: apiKeyId } as ApiKey;
    permission.api = { id: apiId } as Api;
    return this.apiKeyPermissionRepository.save(permission);
  }

  async revokePermission(apiKeyId: number, apiId: number): Promise<void> {
    await this.removeByApiKeyAndApi(apiKeyId, apiId);
  }
} 