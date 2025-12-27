import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  userId: string; // NULL = Глобальное уведомление для всех

  @Column()
  title: string;

  @Column()
  message: string;

  @Column({ default: 'info' })
  type: string; // info, success, error, gift

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}