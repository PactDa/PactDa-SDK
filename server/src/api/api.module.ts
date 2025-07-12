import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiService } from './api.service';
import { Api } from './api.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Api])],
  providers: [ApiService],
  exports: [ApiService],
})
export class ApiModule {} 