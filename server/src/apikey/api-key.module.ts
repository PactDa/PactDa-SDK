import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeyService } from './api-key.service';
import { ApiKey } from './api-key.entity';
import { User } from '../user/user.entity';
import { ApiKeysController } from './api-key.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKey, User])],
  providers: [ApiKeyService],
  controllers: [ApiKeysController],
  exports: [ApiKeyService],
})
export class ApiKeyModule {}
