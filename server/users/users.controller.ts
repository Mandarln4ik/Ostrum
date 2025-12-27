import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Получить список всех игроков
  @Get()
  getAll() {
    return this.usersService.findAll();
  }

  // Изменить баланс игрока (вызывается из Админки)
  @Post(':id/balance')
  updateBalance(
    @Param('id') id: string, 
    @Body() body: { amount: number, type: 'RUB' | 'EVENT' }
  ) {
    return this.usersService.addBalance(+id, body.amount, body.type);
  }
}