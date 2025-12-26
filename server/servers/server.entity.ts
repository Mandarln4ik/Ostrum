import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('servers')
export class Server {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  identifier: string; // Например 'srv_1' (для связки с конфигами)

  @Column()
  name: string; // 'Main Server'

  @Column()
  ip: string;

  @Column()
  port: number;
}