import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('items')
export class Item {
  @PrimaryColumn()
  code: string; // "rifle.ak" - уникальный ID предмета в Rust

  @Column()
  name: string; // "Assault Rifle"

  @Column()
  icon_url: string; // Ссылка на картинку

  @Column({ nullable: true })
  category: string; // weapon, construction, etc.
}