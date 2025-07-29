import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { ApiLog } from './api-log.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ApiLog)
    private apiLogRepository: Repository<ApiLog>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, userData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async updateCreditBalance(id: number, amount: number): Promise<User | null> {
    const user = await this.findOne(id);
    if (!user) {
      throw new Error('User not found');
    }
    user.creditBalance += amount;
    return this.userRepository.save(user);
  }

  async updateTotalSpend(id: number, amount: number): Promise<User | null> {
    const user = await this.findOne(id);
    if (!user) {
      throw new Error('User not found');
    }
    user.totalSpend += amount;
    return this.userRepository.save(user);
  }

  async createApiLog(apiLogData: Partial<ApiLog>): Promise<ApiLog> {
    const apiLog = this.apiLogRepository.create(apiLogData);
    return this.apiLogRepository.save(apiLog);
  }

  async getUserApiLogs(userId: number): Promise<ApiLog[]> {
    return this.apiLogRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }
}
