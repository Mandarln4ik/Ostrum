import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Controller('api/payments')
export class PaymentsController {
  constructor(private usersService: UsersService) {}

  // ФЕЙКОВОЕ ПОПОЛНЕНИЕ (Для тестов)
  @Post('fake')
  async fakeTopUp(@Body() body: { userId: number, amount: number, promoCode?: string }) {
    // Тут можно добавить логику бонуса от промокода (TOPUP_BONUS), если нужно
    const finalAmount = Number(body.amount);
    // Начисляем
    await this.usersService.addBalance(body.userId, finalAmount, 'RUB');
    // Возвращаем фейковый URL для редиректа
    return { confirmationUrl: '/?payment=success' }; 
  }

  @Post('create')
  async createPayment(@Body() body: { userId: number, amount: number, promoCode?: string }) {
    // Пока у нас нет ЮКассы, просто вызываем фейковое пополнение
    return this.fakeTopUp(body);
  }
}