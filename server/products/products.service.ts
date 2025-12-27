import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  findAll(): Promise<Product[]> {
    return this.productsRepository.find();
  }

  create(product: Partial<Product>): Promise<Product> {
    return this.productsRepository.save(product);
  }

  // 👇 ИСПРАВЛЕННЫЙ МЕТОД UPDATE
  async update(id: number, productData: Partial<Product>): Promise<Product> {
    // 1. Сначала ищем товар
    const product = await this.productsRepository.findOneBy({ id });
    if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // 2. Объединяем старые данные с новыми
    // Preload помогает правильно обновить сущность
    const updatedProduct = await this.productsRepository.preload({
      id: id,
      ...productData,
    });

    // 3. Сохраняем (это обновит JSON поля корректно)
    return this.productsRepository.save(updatedProduct);
  }

  async remove(id: number): Promise<void> {
    await this.productsRepository.delete(id);
  }

  async seed() {
    const count = await this.productsRepository.count();
    if (count === 0) {
      await this.productsRepository.save([
        { 
          name: 'Assault Rifle', 
          shortname: 'rifle.ak', 
          price: 150, 
          currency: 'RUB',
          image_url: 'https://rustlabs.com/img/items180/rifle.ak.png', 
          category: 'weapons',
          contents: [{ itemId: 'rifle.ak', quantity: 1 }],
          servers: ['srv_1', 'srv_2'],
          isCrate: false
        },
        { 
          name: 'Assault Rifle', 
          shortname: 'rifle.ak', 
          price: 5, 
          currency: 'EVENT',
          image_url: 'https://rustlabs.com/img/items180/rifle.ak.png', 
          category: 'weapons',
          contents: [{ itemId: 'rifle.ak', quantity: 1 }],
          servers: ['srv_1', 'srv_2'],
          isCrate: false
        },
      ]);
      console.log('✅ Products seeded');
    }
  }
}