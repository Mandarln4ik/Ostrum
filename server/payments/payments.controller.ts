import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Controller('api/payments')
export class PaymentsController {
  constructor(private usersService: UsersService) {}

  // ФЕЙКОВОЕ ПОПОЛНЕНИЕ (Для тестов)
  @Post('fake')
  async fakeTopUp(@Body() body: { userId: number, amount: number }) {
    console.log(`[FakePayment] User ${body.userId} topup ${body.amount}`);
    return this.usersService.addBalance(body.userId, body.amount, 'RUB');
  }
}