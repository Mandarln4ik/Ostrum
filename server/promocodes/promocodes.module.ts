import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Promocode } from './promocode.entity';
import { PromocodeUsage } from './promocode-usage.entity';
import { PromocodesService } from './promocodes.service';
import { PromocodesController } from './promocodes.controller';
import { UsersModule } from '../users/users.module'; 
import { StoreModule } from '../store/store.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Promocode, PromocodeUsage]),
    UsersModule,
    StoreModule,
  ],
  controllers: [PromocodesController],
  providers: [PromocodesService],
})
export class PromocodesModule {}