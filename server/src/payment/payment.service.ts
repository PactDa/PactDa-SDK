import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentLog } from './payment-log.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentLog)
    private paymentLogRepository: Repository<PaymentLog>,
  ) {}

  async findAll(): Promise<PaymentLog[]> {
    return this.paymentLogRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: number): Promise<PaymentLog | null> {
    return this.paymentLogRepository.findOne({ 
      where: { id },
      relations: ['user']
    });
  }

  async findByUserId(userId: number): Promise<PaymentLog[]> {
    return this.paymentLogRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { createdAt: 'DESC' }
    });
  }

  async findByProviderTransactionId(providerTransactionId: string): Promise<PaymentLog | null> {
    return this.paymentLogRepository.findOne({
      where: { provider_transaction_id: providerTransactionId },
      relations: ['user']
    });
  }

  async create(paymentLogData: Partial<PaymentLog>): Promise<PaymentLog> {
    const paymentLog = this.paymentLogRepository.create(paymentLogData);
    return this.paymentLogRepository.save(paymentLog);
  }

  async update(id: number, paymentLogData: Partial<PaymentLog>): Promise<PaymentLog | null> {
    await this.paymentLogRepository.update(id, paymentLogData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.paymentLogRepository.delete(id);
  }

  async getPaymentHistory(userId: number): Promise<PaymentLog[]> {
    return this.paymentLogRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { createdAt: 'DESC' }
    });
  }

  async getPaymentsByStatus(userId: number, status: string): Promise<PaymentLog[]> {
    return this.paymentLogRepository.find({
      where: { user: { id: userId }, status },
      relations: ['user'],
      order: { createdAt: 'DESC' }
    });
  }

  async getPaymentsByProvider(userId: number, provider: string): Promise<PaymentLog[]> {
    return this.paymentLogRepository.find({
      where: { user: { id: userId }, provider },
      relations: ['user'],
      order: { createdAt: 'DESC' }
    });
  }
} 