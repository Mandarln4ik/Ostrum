import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SteamStrategy } from './steam.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UsersModule, // Подключаем UsersModule, чтобы работать с БД
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' }, // Токен живет 7 дней
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SteamStrategy],
})
export class AuthModule {}