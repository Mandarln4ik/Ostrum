import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(details: { steamId: string; nickname: string; avatar: string }) {
    // Ищем или создаем юзера через UsersService
    return this.usersService.findOrCreate(details.steamId, details.nickname, details.avatar);
  }

  async login(user: any) {
    const payload = { sub: user.id, steamId: user.steamId, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}