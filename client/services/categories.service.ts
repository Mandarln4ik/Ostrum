import api from '../api/axios';
import { Category } from '../types';

export const CategoriesService = {
  async getAll() {
    const res = await api.get<Category[]>('/categories');
    return res.data;
  },
  async create(data: Partial<Category>) { return api.post('/categories', data); },
  async update(id: number, data: Partial<Category>) { return api.put(`/categories/${id}`, data); },
  async delete(id: number) { return api.delete(`/categories/${id}`); }
};