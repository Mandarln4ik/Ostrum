import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promocode } from './promocode.entity';

@Injectable()
export class PromocodesService {
  constructor(
    @InjectRepository(Promocode)
    private repo: Repository<Promocode>,
  ) {}

  findAll() { return this.repo.find(); }
  
  create(dto: Partial<Promocode>) { return this.repo.save(dto); }
  
  async update(id: number, dto: Partial<Promocode>) {
    await this.repo.update(id, dto);
    return this.repo.findOneBy({ id });
  }
  
  delete(id: number) { return this.repo.delete(id); }
}