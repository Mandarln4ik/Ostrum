import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('promocode_usages')
export class PromocodeUsage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  promocodeId: number;

  @CreateDateColumn()
  activatedAt: Date;
}