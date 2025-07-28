import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { ApiKey } from './api-key.entity';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { User } from 'src/user/user.entity';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({
      relations: ['user'],
      order: { create_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<ApiKey | null> {
    return this.apiKeyRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findByUserId(userId: number): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({
      where: { user: { id: userId } },
      order: { create_at: 'DESC' },
    });
  }

  async findByApiKeyHash(apiKeyHash: string): Promise<ApiKey | null> {
    return this.apiKeyRepository.findOne({
      where: { api_key_hash: apiKeyHash },
      relations: ['user'],
    });
  }

  async findActiveByUserId(userId: number): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({
      where: { user: { id: userId }, revoked: false },
      relations: ['user'],
      order: { create_at: 'DESC' },
    });
  }

  async create(userId: number, dto: CreateApiKeyDto): Promise<ApiKey> {
    const plainApiKey = randomBytes(32).toString('hex');
    const apiKeyHash = await bcrypt.hash(plainApiKey, 10);

    const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
    const ALGORITHM: string = process.env.ALGORITHM as string;

    const iv = randomBytes(16);
    const cipher = createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

    let encrypted = cipher.update(plainApiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const ivHex = iv.toString('hex');
    const encryptedWithIv = ivHex + ':' + encrypted;

    const user = await this.userRepository.findOneByOrFail({ id: userId });

    const apiKey = this.apiKeyRepository.create({
      user,
      api_key_encrypt: encryptedWithIv,
      api_key_hash: apiKeyHash,
      revoked: false,
      expired_at: dto.expired_at ? new Date(dto.expired_at) : null,
      quota: dto.quota ?? null,
    } as DeepPartial<ApiKey>);

    const savedApiKey = await this.apiKeyRepository.save(apiKey);

    return savedApiKey;
  }

  async decryptWithIv(encryptedWithIv: string) {
    const [ivHex, encryptedHex] = encryptedWithIv.split(':');
    const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
    const ALGORITHM: string = process.env.ALGORITHM as string;

    if (!ivHex || !encryptedHex) {
      throw new Error('Invalid encrypted format. Expected iv:encryptedText');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const decipher = createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  async check_api_keys(plainApiKey: string): Promise<boolean> {
    const apiKeys = await this.apiKeyRepository.find({
      relations: ['user'],
      where: { revoked: false },
    });

    const matchedKey = await Promise.any(
      apiKeys.map(async (apiKey) => {
        const isMatch = await bcrypt.compare(plainApiKey, apiKey.api_key_hash);
        return isMatch ? apiKey : Promise.reject();
      }),
    ).catch(() => null);

    if (!matchedKey) {
      throw new NotFoundException('API Key not found or invalid');
    }

    if (matchedKey.revoked) {
      throw new ForbiddenException('This API key has been revoked');
    }

    if (!matchedKey.user.is_email_verified) {
      throw new ForbiddenException('User email has not been verified');
    }

    return true;
  }

  async update(
    id: number,
    apiKeyData: Partial<ApiKey>,
  ): Promise<ApiKey | null> {
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
