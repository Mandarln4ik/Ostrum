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
    const count = await this.repo.count();
    if (count === 0) {
      await this.repo.save([
        { name: 'Все товары', slug: 'all', sortOrder: 0 }, // 👈 Та самая запись по умолчанию
        { name: 'Ресурсы', slug: 'resources', sortOrder: 1 },
        { name: 'Инструменты', slug: 'tools', sortOrder: 2 },
        { name: 'Оружие', slug: 'weapons', sortOrder: 3 },
        { name: 'Броня', slug: 'attire', sortOrder: 4 },
        { name: 'Боеприпасы', slug: 'ammo', sortOrder: 5 },
        { name: 'Медикаменты и еда', slug: 'medical', sortOrder: 6 },
        { name: 'Конструкции', slug: 'construction', sortOrder: 7 },
        { name: 'Компоненты', slug: 'components', sortOrder: 8 },
        { name: 'Электрика', slug: 'electric', sortOrder: 9 },
        { name: 'Наборы (KITS)', slug: 'kits', sortOrder: 10 },
      ]);
      console.log('✅ Categories seeded');
    }
  }
}