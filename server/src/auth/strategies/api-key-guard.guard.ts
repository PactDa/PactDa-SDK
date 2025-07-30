import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from 'src/apikey/api-key.entity';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const rawApiKey = authHeader.replace('Bearer ', '').trim();

    const apiKeyDigest = createHash('sha256').update(rawApiKey).digest('hex');

    const matchedKey = await this.apiKeyRepository.findOne({
      where: {
        apiKeyDigest,
        revoked: false,
      },
      relations: ['user'],
    });

    if (!matchedKey || !(await bcrypt.compare(rawApiKey, matchedKey.apiKeyHash))) {
      throw new NotFoundException('API Key not found or invalid');
    }

    if (matchedKey.revoked) {
      throw new ForbiddenException('This API key has been revoked');
    }

    if (!matchedKey.user.isEmailVerified) {
      throw new ForbiddenException('User email has not been verified');
    }

    if (matchedKey.expiredAt && new Date() > new Date(matchedKey.expiredAt)) {
      throw new ForbiddenException('API key has expired');
    }

    if (typeof matchedKey.quota === 'number' && matchedKey.quota <= 0) {
      throw new ForbiddenException('API key quota exceeded');
    }

    if (typeof matchedKey.quota === 'number') {
      matchedKey.quota -= 1;
      await this.apiKeyRepository.save(matchedKey);
    }

    return true;
  }
}
