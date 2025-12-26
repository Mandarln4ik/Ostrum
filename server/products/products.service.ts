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

  // Метод для создания тестовых данных (можно вызвать один раз)
  async seed() {
    const count = await this.productsRepository.count();
    if (count === 0) {
      await this.productsRepository.save([
        { 
          name: 'Assault Rifle', 
          shortname: 'rifle.ak', 
          price: 150, 
          image_url: 'https://rustlabs.com/img/items180/rifle.ak.png', 
          category: 'weapons',
          contents: [{ itemId: 'rifle.ak', quantity: 1 }],
          lootTable: [],
          isCrate: false,
          isFree: false,
          servers: ['srv_1', 'srv_2'] // 👈 Добавили список серверов
        },
        { 
          name: 'Metal Facemask', 
          shortname: 'metal.facemask', 
          price: 50, 
          image_url: 'https://rustlabs.com/img/items180/metal.facemask.png', 
          category: 'armor',
          contents: [{ itemId: 'metal.facemask', quantity: 1 }],
          lootTable: [],
          isCrate: false,
          isFree: false,
          servers: ['srv_1', 'srv_2'] // 👈 И тут тоже
        },
      ]);
    }
  }
}