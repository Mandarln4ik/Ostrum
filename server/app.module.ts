import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { ProductsModule } from './products/products.module';
import { Product } from './products/product.entity';

import { ServersModule } from './servers/servers.module';
import { Server } from './servers/server.entity';

import { ItemsModule } from './items/items.module';
import { Item } from './items/item.entity';

import { UsersModule } from './users/users.module';
import { User } from './users/user.entity'; 

import { NotificationsModule } from './notifications/notifications.module';
import { NotificationEntity } from './notifications/notification.entity'; 

import { PromocodesModule } from 'promocodes/promocodes.module';
import { Promocode } from 'promocodes/promocode.entity';

import { StoreModule } from './store/store.module';
import { InventoryItem } from './inventory/inventory.entity';
import { Transaction } from './transactions/transaction.entity';

import { AuthModule } from './auth/auth.module';

import { CategoriesModule } from './categories/categories.module';
import { Category } from './categories/category.entity';

import { PromocodeUsage } from 'promocodes/promocode-usage.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [Product, Server, Item, User, NotificationEntity, Promocode, InventoryItem, Transaction, Category, PromocodeUsage], 
      synchronize: true, // В продакшене лучше ставить false и использовать миграции! Но для старта true ок.
    }),
    ProductsModule,
    ServersModule,
    ItemsModule,
    UsersModule,
    NotificationsModule,
    PromocodesModule,
    StoreModule,
    AuthModule,
    CategoriesModule,
  ],
})
export class AppModule {}