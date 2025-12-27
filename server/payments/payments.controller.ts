import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  async createPayment(@Body() body: { userId: number, amount: number, promoCode?: string, bonusPercent?: number }) {
    // В будущем тут будет ЮKassa. Сейчас перенаправляем на fake.
    return this.fakeTopUp(body);
  }

  @Post('fake')
  async fakeTopUp(@Body() body: { userId: number, amount: number, bonusPercent?: number }) {
    if (!body.userId || !body.amount) {
      throw new BadRequestException('ID пользователя и сумма обязательны');
    }

    const baseAmount = Number(body.amount);
    const bonus = body.bonusPercent ? (baseAmount * body.bonusPercent / 100) : 0;
    const finalAmount = baseAmount + bonus;

    console.log(`[Payment] Начисление: ${finalAmount} (База: ${baseAmount}, Бонус: ${bonus}%) юзеру ${body.userId}`);
    
    await this.usersService.addBalance(body.userId, finalAmount, 'RUB');

    return { 
      success: true, 
      confirmationUrl: '/#/profile?payment=success', // Редирект в профиль после "оплаты"
      finalAmount 
    };
  }
}