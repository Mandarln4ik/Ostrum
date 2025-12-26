import api from '../api/axios';

export interface Server {
  id: number;
  identifier: string; // srv_1
  name: string;
  ip: string;
  port: number;
}

export const ServersService = {
  async getAll(): Promise<Server[]> {
    const response = await api.get<Server[]>('/servers');
    return response.data;
  },
};