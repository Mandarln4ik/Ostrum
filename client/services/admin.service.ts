
import api from '../api/axios';
import { PromoCode, User } from '../types';

export const AdminService = {
  // Промокоды
  async getPromos(): Promise<PromoCode[]> {
    const res = await api.get('/promocodes');
    return res.data;
  },
  async createPromo(data: Partial<PromoCode>) {
    return api.post('/promocodes', data);
  },
  async updatePromo(id: number | string, data: Partial<PromoCode>) {
    return api.put(`/promocodes/${id}`, data);
  },
  async deletePromo(id: number | string) {
    return api.delete(`/promocodes/${id}`);
  },

  // Пользователи
  async getUsers(): Promise<User[]> {
    const res = await api.get('/users');
    return res.data;
  },
  async updateUserBalance(userId: string, amount: number, type: 'RUB' | 'EVENT') {
    return api.post(`/users/${userId}/balance`, { amount, type });
  },

  // Уведомления
  async sendNotification(userId: string, title: string, message: string) {
    return api.post('/notifications/user', { userId, title, message });
  },
  async sendGlobalNotification(title: string, message: string) {
    return api.post('/notifications/global', { title, message });
  }
};