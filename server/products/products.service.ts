import { Injectable } from '@nestjs/common';
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

  // 1. Создание товара
  create(product: Partial<Product>): Promise<Product> {
    return this.productsRepository.save(product);
  }

  // 2. Обновление товара
  async update(id: number, productData: Partial<Product>): Promise<Product> {
    await this.productsRepository.update(id, productData);
    return this.productsRepository.findOneBy({ id });
  }

  // 3. Удаление товара
  async remove(id: number): Promise<void> {
    await this.productsRepository.delete(id);
  }

  // Метод для создания тестовых данных (можно вызвать один раз)
  async seed() {
    const count = await this.productsRepository.count();
    if (count === 0) {
      await this.productsRepository.save([
        { 
          name: 'Assault Rifle', 
          shortname: 'rifle.ak', 
          price: 150, 
          currency: 'RUB', // 👈 ЯВНО УКАЗЫВАЕМ РУБЛИ
          image_url: 'https://rustlabs.com/img/items180/rifle.ak.png', 
          category: 'weapons',
          contents: [{ itemId: 'rifle.ak', quantity: 1 }],
          servers: ['srv_1', 'srv_2'],
          isCrate: false
        },
        { 
          name: 'Metal Facemask', 
          shortname: 'metal.facemask', 
          price: 50, 
          currency: 'RUB', // 👈 ЯВНО УКАЗЫВАЕМ РУБЛИ
          image_url: 'https://rustlabs.com/img/items180/metal.facemask.png', 
          category: 'armor',
          contents: [{ itemId: 'metal.facemask', quantity: 1 }],
          servers: ['srv_1', 'srv_2'],
          isCrate: false
        },
        // Можешь добавить тестовый товар за снежинки для проверки
        { 
          name: 'Ice AK-47', 
          shortname: 'rifle.ak.ice', 
          price: 500, 
          currency: 'EVENT', // 👈 А ЭТО БУДЕТ ЗА СНЕЖИНКИ
          image_url: 'https://rustlabs.com/img/items180/rifle.ak.png', 
          category: 'weapons',
          contents: [{ itemId: 'rifle.ak', quantity: 1 }],
          servers: ['srv_1'],
          isCrate: false
        },
      ]);
      console.log('✅ Products seeded');
    }
  }
}