import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Найти всех (для админки)
  findAll(): Promise<User[]> {
    return this.usersRepository.find({
        order: { id: 'DESC' } // Новые сверху
    });
  }

  // Найти одного по ID
  findOne(id: number): Promise<User> {
    return this.usersRepository.findOneBy({ id });
  }

  // Найти или создать (для Steam Auth в будущем)
  async findOrCreate(steamId: string, nickname: string, avatar: string): Promise<User> {
    let user = await this.usersRepository.findOneBy({ steamId });
    
    if (!user) {
      // Создаем нового
      user = this.usersRepository.create({
        steamId,
        nickname,
        avatar,
        referralCode: 'REF-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        role: steamId === '76561198123456789' ? 'admin' : 'user' // 👉 Сюда впиши свой SteamID64, чтобы стать админом сразу!
      });
      await this.usersRepository.save(user);
    } else {
      // Обновляем данные (если сменил ник/аву)
      user.nickname = nickname;
      user.avatar = avatar;
      await this.usersRepository.save(user);
    }
    return user;
  }

  // Изменение баланса (Для Админки)
  async addBalance(id: number, amount: number, type: 'RUB' | 'EVENT') {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found');

    if (type === 'RUB') {
        user.balance += amount;
    } else {
        user.eventBalance += amount;
    }

    return this.usersRepository.save(user);
  }
}