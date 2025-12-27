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

  async buy(userId: number, productId: number, serverId: string, quantity: number = 1) {
    const user = await this.userRepo.findOneBy({ id: userId });
    const product = await this.productRepo.findOneBy({ id: productId });

    if (!user) throw new BadRequestException('User not found');
    if (!product) throw new BadRequestException('Product not found');
    if (quantity < 1) throw new BadRequestException('Invalid quantity');

    // 1. Расчет цены
    let price = product.price;
    // Если есть скидка
    if (product.discount && (!product.discount.endsAt || new Date(product.discount.endsAt) > new Date())) {
        price = Math.floor(price * (1 - product.discount.percent / 100));
    }
    const totalCost = price * quantity;

    // 2. Проверка баланса
    if (product.isFree) {
       // Проверка кулдауна (если нужно)
    } else {
       if (product.currency === 'RUB' && user.balance < totalCost) throw new BadRequestException('Недостаточно средств');
       if (product.currency === 'EVENT' && user.eventBalance < totalCost) throw new BadRequestException('Недостаточно снежинок');
    }

    // 3. Списание средств
    if (!product.isFree) {
        if (product.currency === 'RUB') {
            user.balance -= totalCost;
            // Начисление бонуса снежинок
            const bonus = product.eventBonus ? (product.eventBonus * quantity) : (totalCost * 0.01);
            user.eventBalance += bonus;
        } else {
            user.eventBalance -= totalCost;
        }
        await this.userRepo.save(user);
    }

    // 4. Определение предметов (Логика Кейса vs Товара)
    let wonItems: any[] = [];

    for (let i = 0; i < quantity; i++) {
        if (product.isCrate) {
            // Рулетка
            const won = this.rollCrate(product.lootTable);
            wonItems.push(won);
        } else {
            // Обычный товар
            wonItems.push(...(product.contents || []));
        }
    }

    // 5. Выдача в инвентарь
    const inventoryEntities = wonItems.map(item => this.inventoryRepo.create({
        userId: user.id,
        itemId: item.itemId,
        itemName: item.name || item.itemId, // Тут лучше подтянуть реальное имя из таблицы Items, но пока так
        quantity: item.quantity,
        serverId: serverId,
        icon: item.icon || '', // Желательно передавать иконку
        status: 'PENDING'
    }));
    await this.inventoryRepo.save(inventoryEntities);

    // 6. Запись в историю
    await this.transactionRepo.save({
        userId: user.id,
        totalAmount: totalCost,
        currency: product.currency,
        serverId: serverId,
        type: 'PURCHASE',
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