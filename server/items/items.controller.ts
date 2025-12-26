import { Controller, Get } from '@nestjs/common';
import { ItemsService } from './items.service';

@Controller('api/items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  async getAll() {
    await this.itemsService.seed();
    return this.itemsService.findAll();
  }
}