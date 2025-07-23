import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { PaymentLog } from './payment-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentLog])],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
