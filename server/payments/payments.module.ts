import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule], // Импортируем UsersModule, чтобы использовать UsersService
  controllers: [PaymentsController],
  providers: [],
})
export class PaymentsModule {}