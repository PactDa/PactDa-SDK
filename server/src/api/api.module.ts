import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiService } from './api.service';
import { Api } from './api.entity';
import { SuiProvider } from './sui.provider';
import { ApiKeyModule } from 'src/apikey/api-key.module';
import { ApiController } from './api.controller';
import { ApiKey } from 'src/apikey/api-key.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Api]), ApiKeyModule, TypeOrmModule.forFeature([ApiKey])],
  providers: [ApiService, SuiProvider],
  controllers: [ApiController],
  exports: [ApiService],
})
export class ApiModule {}
