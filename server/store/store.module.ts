import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';
import { InventoryItem } from '../inventory/inventory.entity';
import { Transaction} from '../transactions/transaction.entity';
import { Item } from '../items/item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Product, InventoryItem, Transaction, Item])],
  controllers: [StoreController],
  providers: [StoreService],
  exports: [StoreService], 
})
export class StoreModule {}