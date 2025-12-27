import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('promocodes')
export class Promocode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  rewardType: string; // RUB_BALANCE, EVENT_BALANCE, PRODUCT, etc.

  @Column({ default: 0 })
  rewardValue: number; // ID товара или сумма

  @Column({ default: 100 })
  maxActivations: number;

  @Column({ default: 0 })
  currentActivations: number;

  @Column({ nullable: true })
  userId: string; // Если привязан к конкретному юзеру (по id или steamId)
}