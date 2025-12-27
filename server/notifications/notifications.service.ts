import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private repo: Repository<NotificationEntity>,
  ) {}

  // Отправить одному
  async sendToUser(userId: string, title: string, message: string, type = 'info') {
    return this.repo.save({ userId, title, message, type });
  }

  // Отправить всем (Глобальное)
  async sendGlobal(title: string, message: string) {
    // В реальном проекте тут лучше использовать WebSocket или создавать копии записей.
    // Пока сделаем упрощенно: создаем запись с userId = 'GLOBAL'
    return this.repo.save({ userId: 'GLOBAL', title, message, type: 'info' });
  }
}