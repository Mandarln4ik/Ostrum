import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promocode } from './promocode.entity';
import { PromocodeUsage } from './promocode-usage.entity';
import { UsersService } from '../users/users.service';
import { StoreService } from '../store/store.service';

@Injectable()
export class PromocodesService {
  constructor(
    @InjectRepository(Promocode) private repo: Repository<Promocode>,
    @InjectRepository(PromocodeUsage) private usageRepo: Repository<PromocodeUsage>,
    private usersService: UsersService,
    private storeService: StoreService,
  ) {}

  findAll() { return this.repo.find(); }
  
  create(dto: Partial<Promocode>) { return this.repo.save(dto); }
  
  async update(id: number, dto: Partial<Promocode>) {
    await this.repo.update(id, dto);
    return this.repo.findOneBy({ id });
  }
  
  delete(id: number) { return this.repo.delete(id); }

  async redeem(userId: number, code: string) {
    const promo = await this.repo.findOneBy({ code: code.toUpperCase() });
    if (!promo) throw new NotFoundException('Промокод не найден');

    // 1. Проверки
    if (promo.currentActivations >= promo.maxActivations) throw new BadRequestException('Лимит активаций исчерпан');
    if (promo.userId && Number(promo.userId) !== userId) throw new BadRequestException('Этот код не для вас');
    if (promo.rewardType === 'TOPUP_BONUS') throw new BadRequestException('Этот код активируется при пополнении баланса');

    // 2. Проверка на повтор (если это не бонус пополнения)
    const used = await this.usageRepo.findOneBy({ userId, promocodeId: promo.id });
    if (used) throw new BadRequestException('Вы уже активировали этот код');

    // 3. Выдача награды
    let rewardMessage = '';
    if (promo.rewardType === 'RUB_BALANCE') {
        await this.usersService.addBalance(userId, promo.rewardValue, 'RUB');
        rewardMessage = `${promo.rewardValue} ₽`;
    } else if (promo.rewardType === 'EVENT_BALANCE') {
        await this.usersService.addBalance(userId, promo.rewardValue, 'EVENT');
        rewardMessage = `${promo.rewardValue} ❄`;
    } else if (promo.rewardType === 'PRODUCT' || promo.rewardType === 'FREE_CRATE') {
        // 👇 Передаем true последним аргументом (isGift)
        await this.storeService.buy(userId, promo.rewardValue, 'srv_1', 1, true);
        rewardMessage = 'Предмет выдан на склад (Main Server)';
    }

    // 4. Фиксация
    await this.usageRepo.save({ userId, promocodeId: promo.id });
    promo.currentActivations += 1;
    await this.repo.save(promo);

    return { success: true, reward: rewardMessage };
  }
}