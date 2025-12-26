import { Controller, Get } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getAll() {
    // Временно вызовем сид, чтобы БД не была пустой при первом запуске
    await this.productsService.seed(); 
    return this.productsService.findAll();
  }
}