import api from '../api/axios';
import { Product } from '../types/product';

export const ProductService = {
  async getAll(): Promise<Product[]> {
    const response = await api.get<Product[]>('/products');
    return response.data;
  },
  
  // Создать
  async create(product: Partial<Product>): Promise<Product> {
    const response = await api.post<Product>('/products', product);
    return response.data;
  },

  // Обновить
  async update(id: number, product: Partial<Product>): Promise<Product> {
    const response = await api.put<Product>(`/products/${id}`, product);
    return response.data;
  },

  // Удалить
  async delete(id: number): Promise<void> {
    await api.delete(`/products/${id}`);
  },
  
  // Купить
  async buy(userId: string, productId: string, serverId: string, quantity: number) {
    const response = await api.post('/store/buy', { 
        userId: Number(userId), // Временно передаем ID, пока нет токенов
        productId: Number(productId), 
        serverId, 
        quantity 
    });
    return response.data;
  }
};