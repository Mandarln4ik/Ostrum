import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('player_inventory')
export class InventoryItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number; // ID игрока

  @Column()
  itemId: string; // code предмета (rifle.ak)

  @Column()
  itemName: string; // Название на момент покупки

  @Column()
  quantity: number;

  @Column()
  serverId: string; // Identifier сервера (srv_1)

  @Column({ default: 'PENDING' })
  status: string; // PENDING (ждет выдачи), CLAIMED (выдано)

  @Column({ nullable: true })
  icon: string;

  @CreateDateColumn()
  createdAt: Date;
}