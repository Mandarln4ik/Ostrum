import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private itemsRepository: Repository<Item>,
  ) {}

  findAll(): Promise<Item[]> {
    return this.itemsRepository.find();
  }

  // Заполняем базу базовыми предметами Rust
  async seed() {
    const count = await this.itemsRepository.count();
    if (count === 0) {
      const items = [
        { code: 'rifle.ak', name: 'Assault Rifle', icon_url: 'https://rustlabs.com/img/items180/rifle.ak.png', category: 'Weapon' },
        { code: 'rifle.bolt', name: 'Bolt Action Rifle', icon_url: 'https://rustlabs.com/img/items180/rifle.bolt.png', category: 'Weapon' },
        { code: 'metal.facemask', name: 'Metal Facemask', icon_url: 'https://rustlabs.com/img/items180/metal.facemask.png', category: 'Attire' },
        { code: 'metal.plate.torso', name: 'Metal Chest Plate', icon_url: 'https://rustlabs.com/img/items180/metal.plate.torso.png', category: 'Attire' },
        { code: 'wood', name: 'Wood', icon_url: 'https://rustlabs.com/img/items180/wood.png', category: 'Resources' },
        { code: 'stones', name: 'Stones', icon_url: 'https://rustlabs.com/img/items180/stones.png', category: 'Resources' },
        { code: 'sulfur', name: 'Sulfur', icon_url: 'https://rustlabs.com/img/items180/sulfur.png', category: 'Resources' },
        { code: 'scrap', name: 'Scrap', icon_url: 'https://rustlabs.com/img/items180/scrap.png', category: 'Resources' },
        { code: 'ammo.rifle', name: '5.56 Rifle Ammo', icon_url: 'https://rustlabs.com/img/items180/ammo.rifle.png', category: 'Ammunition' },
        { code: 'syringe.medical', name: 'Medical Syringe', icon_url: 'https://rustlabs.com/img/items180/syringe.medical.png', category: 'Medical' },
      ];
      await this.itemsRepository.save(items);
      console.log('✅ Game Items seeded');
    }
  }
}