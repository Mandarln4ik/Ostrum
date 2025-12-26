import api from '../api/axios';
import { Product } from '../types/product';

export const ProductService = {
  async getAll(): Promise<Product[]> {
    const response = await api.get<Product[]>('/products');
    return response.data;
  },
  
  // В будущем сюда добавим методы:
  // getById(id), buy(id) и т.д.
};