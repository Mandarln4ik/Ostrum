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
  }
};