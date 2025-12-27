import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ type: 'float' })
  totalAmount: number;

  @Column()
  currency: string; // RUB, EVENT

  @Column({ type: 'json' })
  products: any; // JSON список купленного [{name, quantity}]

  @Column()
  serverId: string;

  @Column({ default: 'PURCHASE' })
  type: string; // PURCHASE, DEPOSIT

  @CreateDateColumn()
  date: Date;
}