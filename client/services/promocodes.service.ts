import api from '../api/axios';
import { PromoCode } from '../types';

export const PromocodesService = {
  // Получить список (обычно публичные, но мы пока грузим все для проверки на клиенте)
  async getAll(): Promise<PromoCode[]> {
    const response = await api.get<PromoCode[]>('/promocodes');
    return response.data;
  },
  
  // Активировать (для обычных кодов)
  async redeem(code: string, userId: number, serverId?: string) {
      const response = await api.post('/promocodes/redeem', { userId, code, serverId });
      return response.data;
  }
};