import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  steamId: string; // Уникальный ID от Steam

  @Column({ default: 'Player' })
  nickname: string;

  @Column({ nullable: true })
  avatar: string; // Ссылка на аватарку Steam

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ default: 0 })
  balance: number; // Рубли

  @Column({ type: 'float', default: 0 })
  eventBalance: number; // Снежинки

  @Column({ nullable: true })
  referralCode: string; // Его личный код

  @Column({ nullable: true })
  referredBy: string; // Кто его пригласил (ID)

  @Column({ type: 'float', default: 0 })
  totalReferralEarnings: number;

  @CreateDateColumn()
  createdAt: Date;
}