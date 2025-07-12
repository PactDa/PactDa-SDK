import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditService } from './credit.service';
import { CreditTransaction } from './credit-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CreditTransaction])],
  providers: [CreditService],
  exports: [CreditService],
})
export class CreditModule {} 