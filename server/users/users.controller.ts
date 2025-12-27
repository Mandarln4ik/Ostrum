import { Controller, Get, Post, Param, Body, Req, UseGuards, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';


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

  @Get(':id')
  async findOne(@Param('id') id: string) {
    // Временное решение для фронта "me" (если вдруг фронт стучится на /users/me)
    if (id === 'me') {
        return null; // Или обработать логику извлечения из токена
    }
    
    const user = await this.usersService.findOne(+id);
    if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @Get(':id/inventory')
  getInventory(@Param('id') id: string) {
    return this.usersService.getInventory(+id);
  }

  @Get(':id/transactions')
  getTransactions(@Param('id') id: string) {
    return this.usersService.getTransactions(+id);
  }
}