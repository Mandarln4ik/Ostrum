import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-steam';
import { AuthService } from './auth.service';

@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy, 'steam') {
  constructor(private authService: AuthService) {
    super({
      returnURL: `${process.env.API_URL}/api/auth/steam/return`,
      realm: `${process.env.API_URL}/`,
      apiKey: process.env.STEAM_API_KEY,
    });
  }

  async validate(identifier: string, profile: any, done: Function) {
    // Steam возвращает данные профиля. Передаем их в сервис для сохранения в БД.
    const user = await this.authService.validateUser({
      steamId: profile._json.steamid,
      nickname: profile._json.personaname,
      avatar: profile._json.avatarfull,
    });
    return done(null, user);
  }
}