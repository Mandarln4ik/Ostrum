import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  shortname: string; // ak47.rifle и т.д.

  @Column({ type: 'bigint', default: 0 })
  skin_id: number;

  @Column({ default: 1 })
  amount: number;

  @Column()
  price: number;
  
  @Column({ default: 'RUB' }) 
  currency: string; // 'RUB' | 'EVENT'

  @Column()
  image_url: string;

  @Column({ default: 'misc' })
  category: string;

   @Column({ type: 'json', nullable: true })
  servers: string[]; 
}