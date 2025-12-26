import api from '../api/axios';

export interface GameItem {
  code: string;
  name: string;
  icon_url: string;
  category: string;
}

export const ItemsService = {
  async getAll(): Promise<GameItem[]> {
    const response = await api.get<GameItem[]>('/items');
    return response.data;
  },
};