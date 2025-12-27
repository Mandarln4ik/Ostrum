import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 1. Игрок заходит сюда -> летит на Steam
  @Get('steam')
  @UseGuards(AuthGuard('steam'))
  async steamAuth() {}

  // 2. Steam возвращает игрока сюда
  @Get('steam/return')
  @UseGuards(AuthGuard('steam'))
  async steamAuthRedirect(@Req() req, @Res() res) {
    // Генерируем токен
    const jwt = await this.authService.login(req.user);
    
    // Редиректим на Фронтенд с токеном в URL
    // http://localhost:5173?token=eyJhb...
    res.redirect(`${process.env.APP_URL}?token=${jwt.access_token}`);
  }
}