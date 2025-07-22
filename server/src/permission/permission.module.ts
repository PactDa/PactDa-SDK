import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionService } from './permission.service';
import { ApiKeyPermission } from './api-key-permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKeyPermission])],
  providers: [PermissionService],
  exports: [PermissionService],
})
export class PermissionModule {}
