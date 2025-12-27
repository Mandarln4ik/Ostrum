import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';
import { InventoryItem } from '../inventory/inventory.entity';
import { Transaction } from '../transactions/transaction.entity';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(InventoryItem) private inventoryRepo: Repository<InventoryItem>,
    @InjectRepository(Transaction) private transactionRepo: Repository<Transaction>,
  ) {}

   async buy(userId: number, productId: number, serverId: string, quantity: number = 1, isGift: boolean = false) {
    const user = await this.userRepo.findOneBy({ id: userId });
    const product = await this.productRepo.findOneBy({ id: productId });

    if (!user) throw new BadRequestException('User not found');
    if (!product) throw new BadRequestException('Product not found');
    if (quantity < 1) throw new BadRequestException('Invalid quantity');

    // 1. Расчет цены
    let price = product.price;
    if (product.discount && (!product.discount.endsAt || new Date(product.discount.endsAt) > new Date())) {
        price = Math.floor(price * (1 - product.discount.percent / 100));
    }
    const totalCost = price * quantity;

    // 2. Списание средств (ТОЛЬКО ЕСЛИ НЕ ПОДАРОК И НЕ БЕСПЛАТНЫЙ)
    if (!isGift && !product.isFree) {
       // Проверка баланса
       if (product.currency === 'RUB' && user.balance < totalCost) throw new BadRequestException('Недостаточно средств');
       if (product.currency === 'EVENT' && user.eventBalance < totalCost) throw new BadRequestException('Недостаточно снежинок');

       // Списание
       if (product.currency === 'RUB') {
            user.balance -= totalCost;
            // Бонус только при реальной покупке
            const bonus = product.eventBonus ? (product.eventBonus * quantity) : (totalCost * 0.01);
            user.eventBalance += bonus;
       } else {
            user.eventBalance -= totalCost;
       }
       await this.userRepo.save(user);
    }

    // 3. Определение предметов (Логика Кейса vs Товара)
    let wonItems: any[] = [];

    for (let i = 0; i < quantity; i++) {
        if (product.isCrate) {
            const won = this.rollCrate(product.lootTable);
            wonItems.push(won);
        } else {
            wonItems.push(...(product.contents || []));
        }
    }

    // 4. Выдача в инвентарь
    const inventoryEntities = wonItems.map(item => this.inventoryRepo.create({
        userId: user.id,
        itemId: item.itemId,
        itemName: item.name || item.itemId,
        quantity: item.quantity,
        serverId: serverId,
        icon: item.icon || '', 
        status: 'PENDING'
    }));
    await this.inventoryRepo.save(inventoryEntities);

    // 5. Запись в историю (Если это подарок - пишем, что бесплатно)
    await this.transactionRepo.save({
        userId: user.id,
        totalAmount: isGift ? 0 : totalCost,
        currency: product.currency,
        serverId: serverId,
        type: isGift ? 'GIFT' : 'PURCHASE', // 👈 Помечаем как подарок
        products: wonItems.map(i => ({ name: i.itemId, quantity: i.quantity }))
    });

    return { success: true, items: wonItems, newBalance: user.balance, newEventBalance: user.eventBalance };
  }

  // Алгоритм рулетки
  private rollCrate(lootTable: any[]) {
    if (!lootTable || lootTable.length === 0) return { itemId: 'empty', quantity: 0 };
    
    const totalWeight = lootTable.reduce((sum, item) => sum + Number(item.chance), 0);
    let random = Math.random() * totalWeight;
    
    for (const item of lootTable) {
        if (random < item.chance) {
            return item;
        }
        random -= item.chance;
    }
    return lootTable[0];
  }
}