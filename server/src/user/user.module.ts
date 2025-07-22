import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './user.entity';
import { ApiLog } from './api-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, ApiLog])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
