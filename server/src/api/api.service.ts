import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Api } from './api.entity';

@Injectable()
export class ApiService {
  constructor(
    @InjectRepository(Api)
    private apiRepository: Repository<Api>,
  ) {}

  async findAll(): Promise<Api[]> {
    return this.apiRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Api | null> {
    return this.apiRepository.findOne({ where: { id } });
  }

  async findActive(): Promise<Api[]> {
    return this.apiRepository.find({
      where: { is_active: true },
      order: { name: 'ASC' },
    });
  }

  async findByPath(path: string): Promise<Api | null> {
    return this.apiRepository.findOne({ where: { path } });
  }

  async findByMethod(method: string): Promise<Api[]> {
    return this.apiRepository.find({
      where: { method },
      order: { name: 'ASC' },
    });
  }

  async create(apiData: Partial<Api>): Promise<Api> {
    const api = this.apiRepository.create(apiData);
    return this.apiRepository.save(api);
  }

  async update(id: number, apiData: Partial<Api>): Promise<Api | null> {
    await this.apiRepository.update(id, apiData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.apiRepository.delete(id);
  }

  async activate(id: number): Promise<Api | null> {
    await this.apiRepository.update(id, { is_active: true });
    return this.findOne(id);
  }

  async deactivate(id: number): Promise<Api | null> {
    await this.apiRepository.update(id, { is_active: false });
    return this.findOne(id);
  }

  async findByTags(tags: string): Promise<Api[]> {
    return this.apiRepository.find({
      where: { tags },
      order: { name: 'ASC' },
    });
  }
}
