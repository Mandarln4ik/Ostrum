import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  shortname: string; // Важно для выдачи в игре

  @Column({ type: 'bigint', default: 0 })
  skin_id: number;

  @Column({ default: 1 })
  amount: number;

  @Column()
  price: number;

  @Column({ default: 'RUB' })
  currency: string;

  @Column()
  image_url: string;

  @Column({ default: 'misc' })
  category: string;
  
  @Column({ default: false })
  isCrate: boolean;

  @Column({ default: false })
  isFree: boolean;

  @Column({ default: 0 })
  cooldownHours: number;

  @Column({ type: 'float', default: 0 })
  eventBonus: number;

  // Храним содержимое обычного товара (массив)
  @Column({ type: 'json', nullable: true })
  contents: any;

  // Храним содержимое кейса (массив с шансами)
  @Column({ type: 'json', nullable: true })
  lootTable: any;

  // Список серверов
  @Column({ type: 'json', nullable: true })
  servers: any;
  
  // Скидка (объект { percent: 10, endsAt: ... })
  @Column({ type: 'json', nullable: true })
  discount: any;
}