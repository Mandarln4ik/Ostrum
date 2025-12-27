import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';
import { InventoryItem } from '../inventory/inventory.entity';
import { Transaction } from '../transactions/transaction.entity';
import { Item } from '../items/item.entity';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(InventoryItem) private inventoryRepo: Repository<InventoryItem>,
    @InjectRepository(Transaction) private transactionRepo: Repository<Transaction>,
    @InjectRepository(Item) private itemsRepo: Repository<Item>,
  ) {}

    async buy(userId: number, productId: number, serverId: string, quantity: number = 1, isGift: boolean = false) {
    const user = await this.userRepo.findOneBy({ id: userId });
    const product = await this.productRepo.findOneBy({ id: productId });

    if (!user) throw new BadRequestException('User not found');
    if (!product) throw new BadRequestException('Product not found');
    
    // ... (код расчета цены и списания денег оставляем без изменений) ...
    let price = product.price;
    if (product.discount && (!product.discount.endsAt || new Date(product.discount.endsAt) > new Date())) {
        price = Math.floor(price * (1 - product.discount.percent / 100));
    }
    const totalCost = price * quantity;

    if (!isGift && !product.isFree) {
       if (product.currency === 'RUB' && user.balance < totalCost) throw new BadRequestException('Недостаточно средств');
       if (product.currency === 'EVENT' && user.eventBalance < totalCost) throw new BadRequestException('Недостаточно снежинок');

       if (product.currency === 'RUB') {
            user.balance -= totalCost;
            const bonus = product.eventBonus ? (product.eventBonus * quantity) : (totalCost * 0.01);
            user.eventBalance += bonus;
       } else {
            user.eventBalance -= totalCost;
       }
       await this.userRepo.save(user);
    }

    // 3. Определение предметов
    let wonItems: any[] = [];
    for (let i = 0; i < quantity; i++) {
        if (product.isCrate) {
            wonItems.push(this.rollCrate(product.lootTable));
        } else {
            wonItems.push(...(product.contents || []));
        }
    }

    // 👇 4. ПОДГОТОВКА И СОХРАНЕНИЕ В ИНВЕНТАРЬ (С КАРТИНКАМИ!)
    const inventoryEntities = [];
    
    // Предзагружаем данные о предметах (чтобы не делать 100 запросов в цикле)
    // Получаем все itemId, которые выпали
    const itemIds = wonItems.map(i => i.itemId);
    // Ищем их в БД одним запросом
    const dbItems = await this.itemsRepo.createQueryBuilder("item")
        .where("item.code IN (:...codes)", { codes: itemIds.length > 0 ? itemIds : ['empty'] })
        .getMany();

    for (const item of wonItems) {
        // Ищем совпадение в загруженных данных
        const itemInfo = dbItems.find(dbi => dbi.code === item.itemId);
        
        // Берем иконку из БД, или формируем ссылку RustLabs, если в БД нет
        const iconUrl = itemInfo?.icon_url || `https://rustlabs.com/img/items180/${item.itemId}.png`;
        const realName = itemInfo?.name || item.name || item.itemId;

        const invItem = this.inventoryRepo.create({
            userId: user.id,
            itemId: item.itemId,
            itemName: realName, // Сохраняем красивое имя
            quantity: item.quantity,
            serverId: serverId,
            icon: iconUrl,      // 👈 ТЕПЕРЬ ТУТ ВСЕГДА БУДЕТ ССЫЛКА
            status: 'PENDING'
        });
        inventoryEntities.push(invItem);
    }

    // Сохраняем в БД
    const savedInventory = await this.inventoryRepo.save(inventoryEntities);

    // 5. Запись в историю
    await this.transactionRepo.save({
        userId: user.id,
        totalAmount: isGift ? 0 : totalCost,
        currency: product.currency,
        serverId: serverId,
        type: isGift ? 'GIFT' : 'PURCHASE',
        products: wonItems.map(i => ({ name: i.itemId, quantity: i.quantity }))
    });

    // Возвращаем фронту items с уже заполненными иконками и именами!
    const responseItems = savedInventory.map(inv => ({
        itemId: inv.itemId,
        name: inv.itemName,
        quantity: inv.quantity,
        icon: inv.icon // 👈 Фронт получит это поле сразу
    }));

    return { success: true, items: responseItems, newBalance: user.balance, newEventBalance: user.eventBalance };
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