import { Controller, Get } from '@nestjs/common';
import { ServersService } from './servers.service';

@Controller('api/servers')
export class ServersController {
  constructor(private readonly serversService: ServersService) {}

  @Get()
  async getAll() {
    await this.serversService.seed(); // Создаст сервера, если их нет
    return this.serversService.findAll();
  }
}