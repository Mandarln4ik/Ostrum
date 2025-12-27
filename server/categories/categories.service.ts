import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private repo: Repository<Category>,
  ) {}

  findAll() {
    return this.repo.find({ order: { sortOrder: 'ASC' } });
  }

  create(dto: Partial<Category>) {
    return this.repo.save(dto);
  }

  async update(id: number, dto: Partial<Category>) {
    await this.repo.update(id, dto);
    return this.repo.findOneBy({ id });
  }

  delete(id: number) {
    return this.repo.delete(id);
  }

  // Начальные категории
  async seed() {
    if (await this.repo.count() === 0) {
      await this.repo.save([
        { slug: 'resources', name: 'Ресурсы', sortOrder: 1 },
        { slug: 'weapons', name: 'Оружие', sortOrder: 2 },
        { slug: 'armor', name: 'Броня', sortOrder: 3 },
        { slug: 'misc', name: 'Разное', sortOrder: 4 },
      ]);
    }
  }
}