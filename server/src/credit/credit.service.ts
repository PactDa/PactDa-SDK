import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditTransaction } from './credit-transaction.entity';

@Injectable()
export class CreditService {
  constructor(
    @InjectRepository(CreditTransaction)
    private creditTransactionRepository: Repository<CreditTransaction>,
  ) {}

  async findAll(): Promise<CreditTransaction[]> {
    return this.creditTransactionRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<CreditTransaction | null> {
    return this.creditTransactionRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findByUserId(userId: number): Promise<CreditTransaction[]> {
    return this.creditTransactionRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(
    creditTransactionData: Partial<CreditTransaction>,
  ): Promise<CreditTransaction> {
    const creditTransaction = this.creditTransactionRepository.create(
      creditTransactionData,
    );
    return this.creditTransactionRepository.save(creditTransaction);
  }

  async update(
    id: number,
    creditTransactionData: Partial<CreditTransaction>,
  ): Promise<CreditTransaction | null> {
    await this.creditTransactionRepository.update(id, creditTransactionData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.creditTransactionRepository.delete(id);
  }

  async getTransactionHistory(userId: number): Promise<CreditTransaction[]> {
    return this.creditTransactionRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getTransactionsByType(
    userId: number,
    type: string,
  ): Promise<CreditTransaction[]> {
    return this.creditTransactionRepository.find({
      where: { user: { id: userId }, type },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
}
