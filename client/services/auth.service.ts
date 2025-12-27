import api from '../api/axios';
import { User } from '../types';

export const AuthService = {
  /**
   * Получить данные пользователя по ID.
   * Обычно ID берется из декодированного JWT токена.
   */
  async getUser(id: number | string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  /**
   * Выход из системы.
   * Удаляет токен и перезагружает страницу.
   */
  logout() {
    localStorage.removeItem('token');
    window.location.href = '/'; // Редирект на главную
  }
};