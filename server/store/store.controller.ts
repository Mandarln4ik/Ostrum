import { Controller, Post, Body } from '@nestjs/common';
import { StoreService } from './store.service';

@Controller('api/store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post('buy')
  buy(@Body() body: { userId: number, productId: number, serverId: string, quantity: number }) {
    // В будущем userId будем брать из токена (req.user.id), а пока передаем руками для тестов
    return this.storeService.buy(body.userId, body.productId, body.serverId, body.quantity);
  }
}