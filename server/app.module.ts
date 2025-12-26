import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { ProductsModule } from './products/products.module';
import { Product } from './products/product.entity';

import { ServersModule } from './servers/servers.module';
import { Server } from './servers/server.entity';

import { ItemsModule } from './items/items.module';
import { Item } from './items/item.entity';

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
      entities: [Product, Server, Item], // Сюда потом добавим User и Order
      synchronize: true, // В продакшене лучше ставить false и использовать миграции! Но для старта true ок.
    }),
    ProductsModule,
    ServersModule,
    ItemsModule,
  ],
})
export class AppModule {}