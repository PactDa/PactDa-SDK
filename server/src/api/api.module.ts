import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiService } from './api.service';
import { Api } from './api.entity';
import { SuiProvider } from './sui.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Api])],
  providers: [ApiService, SuiProvider],
  exports: [ApiService],
})
export class ApiModule {}
