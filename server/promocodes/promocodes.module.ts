import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Promocode } from './promocode.entity';
import { PromocodesService } from './promocodes.service';
import { PromocodesController } from './promocodes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Promocode])],
  controllers: [PromocodesController],
  providers: [PromocodesService],
})
export class PromocodesModule {}