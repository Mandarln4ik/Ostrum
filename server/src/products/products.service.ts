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
        { name: 'Assault Rifle', shortname: 'rifle.ak', price: 150, image_url: '/assets/ak.png', category: 'weapons' },
        { name: 'Metal Facemask', shortname: 'metal.facemask', price: 50, image_url: '/assets/mask.png', category: 'armor' },
      ]);
    }
  }
}