import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InventoryItem } from '../inventory/inventory.entity';
import { Transaction } from '../transactions/transaction.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) 
    private usersRepository: Repository<User>,
    
    @InjectRepository(InventoryItem) 
    private inventoryRepo: Repository<InventoryItem>,
    
    @InjectRepository(Transaction) 
    private transactionRepo: Repository<Transaction>,
  ) {}

  // --- ПОЛЬЗОВАТЕЛИ ---

  // Найти всех (для админки)
  findAll(): Promise<User[]> {
    return this.usersRepository.find({
        order: { id: 'DESC' } // Новые сверху
    });
  }

  // Найти одного по ID
  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  // Найти одного по SteamID
  findOneBySteamId(steamId: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ steamId });
  }

  // Логика входа через Steam
  async findOrCreate(steamId: string, nickname: string, avatar: string): Promise<User> {
    let user = await this.usersRepository.findOneBy({ steamId });
    
    if (!user) {
      // Создаем нового пользователя
      user = this.usersRepository.create({
        steamId,
        nickname,
        avatar,
        referralCode: 'REF-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        // 👇 ЗАМЕНИ ЭТОТ ID НА СВОЙ STEAMID64, ЧТОБЫ СТАТЬ АДМИНОМ
        role: steamId === '76561198123456789' ? 'admin' : 'user' 
      });
      await this.usersRepository.save(user);
    } else {
      // Обновляем данные (если сменил ник/аву в стиме)
      user.nickname = nickname;
      user.avatar = avatar;
      await this.usersRepository.save(user);
    }
    return user;
  }

  // Изменение баланса (Админка / Покупки)
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

  // --- ИНВЕНТАРЬ И ИСТОРИЯ (Чтобы фронт не падал) ---

  // Получить инвентарь игрока (только PENDING - не полученные)
  async getInventory(userId: number) {
    return this.inventoryRepo.find({
      where: { userId, status: 'PENDING' },
      order: { createdAt: 'DESC' }
    });
  }

  // Получить историю транзакций
  async getTransactions(userId: number) {
    return this.transactionRepo.find({
      where: { userId },
      order: { date: 'DESC' }
    });
  }
}