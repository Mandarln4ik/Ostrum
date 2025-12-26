import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server } from './server.entity';

@Injectable()
export class ServersService {
  constructor(
    @InjectRepository(Server)
    private serversRepository: Repository<Server>,
  ) {}

  findAll(): Promise<Server[]> {
    return this.serversRepository.find();
  }

  async seed() {
    const count = await this.serversRepository.count();
    if (count === 0) {
      await this.serversRepository.save([
        { 
          identifier: 'srv_1', 
          name: 'Main Server', 
          ip: '127.0.0.1', 
          port: 28015 
        },
        { 
          identifier: 'srv_2', 
          name: 'Monday Server', 
          ip: '127.0.0.1', 
          port: 28025 
        },
      ]);
      console.log('✅ Servers seeded');
    }
  }
}