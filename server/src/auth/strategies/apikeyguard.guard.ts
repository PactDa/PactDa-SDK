import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from 'src/apikey/api-key.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['pactda-api-key']; // รับค่า API key จาก header

    if (!apiKey) {
      throw new UnauthorizedException('Missing pactda-api-key header');
    }

    const apiKeys = await this.apiKeyRepository.find({
      relations: ['user'],
      where: { revoked: false },
    });

    const matchedKey = await Promise.any(
      apiKeys.map(async (apiKeyObj) => {
        const isMatch = await bcrypt.compare(apiKey, apiKeyObj.apiKeyHash);
        return isMatch ? apiKeyObj : Promise.reject();
      }),
    ).catch(() => null);

    if (!matchedKey) {
      throw new NotFoundException('API Key not found or invalid');
    }

    if (matchedKey.revoked) {
      throw new ForbiddenException('This API key has been revoked');
    }

    if (!matchedKey.user.isEmailVerified) {
      throw new ForbiddenException('User email has not been verified');
    }

    return true;
  }
}
