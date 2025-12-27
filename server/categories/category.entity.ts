import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string; // например 'weapons' (код для URL и фильтров)

  @Column()
  name: string; // например 'Оружие' (для отображения)

  @Column({ default: 0 })
  sortOrder: number; // Для сортировки в меню
}