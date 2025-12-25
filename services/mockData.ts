
import { GameItem, Product, ProductCategory, ServerInfo, Transaction, User, UserRole, PendingItem } from '../types';

export const GAME_ITEMS: GameItem[] = [
  // --- RESOURCES ---
  { id: 'wood', name: 'Дерево', shortname: 'wood', icon: 'https://rustlabs.com/img/items180/wood.png', stackSize: 1000 },
  { id: 'stones', name: 'Камень', shortname: 'stones', icon: 'https://rustlabs.com/img/items180/stones.png', stackSize: 1000 },
  { id: 'metal.fragments', name: 'Фрагменты металла', shortname: 'metal.fragments', icon: 'https://rustlabs.com/img/items180/metal.fragments.png', stackSize: 1000 },
  { id: 'metal.refined', name: 'МВК', shortname: 'metal.refined', icon: 'https://rustlabs.com/img/items180/metal.refined.png', stackSize: 100 },
  { id: 'sulfur', name: 'Сера', shortname: 'sulfur', icon: 'https://rustlabs.com/img/items180/sulfur.png', stackSize: 1000 },
  { id: 'sulfur.ore', name: 'Серная руда', shortname: 'sulfur.ore', icon: 'https://rustlabs.com/img/items180/sulfur.ore.png', stackSize: 1000 },
  { id: 'charcoal', name: 'Уголь', shortname: 'charcoal', icon: 'https://rustlabs.com/img/items180/charcoal.png', stackSize: 1000 },
  { id: 'scrap', name: 'Металлолом', shortname: 'scrap', icon: 'https://rustlabs.com/img/items180/scrap.png', stackSize: 1000 },
  { id: 'cloth', name: 'Ткань', shortname: 'cloth', icon: 'https://rustlabs.com/img/items180/cloth.png', stackSize: 1000 },
  { id: 'leather', name: 'Кожа', shortname: 'leather', icon: 'https://rustlabs.com/img/items180/leather.png', stackSize: 1000 },
  { id: 'lowgradefuel', name: 'Топляк', shortname: 'lowgradefuel', icon: 'https://rustlabs.com/img/items180/lowgradefuel.png', stackSize: 500 },
  { id: 'animalfat', name: 'Жир животных', shortname: 'animalfat', icon: 'https://rustlabs.com/img/items180/animalfat.png', stackSize: 1000 },

  // --- WEAPONS (MELEE) ---
  { id: 'rock', name: 'Камень (Rock)', shortname: 'rock', icon: 'https://rustlabs.com/img/items180/rock.png', stackSize: 1 },
  { id: 'mace', name: 'Булава', shortname: 'mace', icon: 'https://rustlabs.com/img/items180/mace.png', stackSize: 1 },
  { id: 'longsword', name: 'Длинный меч', shortname: 'longsword', icon: 'https://rustlabs.com/img/items180/longsword.png', stackSize: 1 },
  { id: 'salvaged.sword', name: 'Самодельный меч', shortname: 'salvaged.sword', icon: 'https://rustlabs.com/img/items180/salvaged.sword.png', stackSize: 1 },
  { id: 'knife.combat', name: 'Боевой нож', shortname: 'knife.combat', icon: 'https://rustlabs.com/img/items180/knife.combat.png', stackSize: 1 },

  // --- WEAPONS (RANGED) ---
  { id: 'rifle.ak', name: 'AK-47', shortname: 'rifle.ak', icon: 'https://rustlabs.com/img/items180/rifle.ak.png', stackSize: 1 },
  { id: 'rifle.lr300', name: 'LR-300', shortname: 'rifle.lr300', icon: 'https://rustlabs.com/img/items180/rifle.lr300.png', stackSize: 1 },
  { id: 'rifle.bolt', name: 'Bolt Action Rifle', shortname: 'rifle.bolt', icon: 'https://rustlabs.com/img/items180/rifle.bolt.png', stackSize: 1 },
  { id: 'rifle.l96', name: 'L96 Rifle', shortname: 'rifle.l96', icon: 'https://rustlabs.com/img/items180/rifle.l96.png', stackSize: 1 },
  { id: 'rifle.m39', name: 'M39 Rifle', shortname: 'rifle.m39', icon: 'https://rustlabs.com/img/items180/rifle.m39.png', stackSize: 1 },
  { id: 'smg.mp5', name: 'MP5A4', shortname: 'smg.mp5', icon: 'https://rustlabs.com/img/items180/smg.mp5.png', stackSize: 1 },
  { id: 'smg.thompson', name: 'Thompson', shortname: 'smg.thompson', icon: 'https://rustlabs.com/img/items180/smg.thompson.png', stackSize: 1 },
  { id: 'smg.2', name: 'Custom SMG', shortname: 'smg.2', icon: 'https://rustlabs.com/img/items180/smg.2.png', stackSize: 1 },
  { id: 'pistol.m92', name: 'M92 Pistol', shortname: 'pistol.m92', icon: 'https://rustlabs.com/img/items180/pistol.m92.png', stackSize: 1 },
  { id: 'pistol.python', name: 'Python Revolver', shortname: 'pistol.python', icon: 'https://rustlabs.com/img/items180/pistol.python.png', stackSize: 1 },
  { id: 'pistol.revolver', name: 'Revolver', shortname: 'pistol.revolver', icon: 'https://rustlabs.com/img/items180/pistol.revolver.png', stackSize: 1 },
  { id: 'shotgun.pump', name: 'Pump Shotgun', shortname: 'shotgun.pump', icon: 'https://rustlabs.com/img/items180/shotgun.pump.png', stackSize: 1 },
  { id: 'shotgun.spas12', name: 'Spas-12 Shotgun', shortname: 'shotgun.spas12', icon: 'https://rustlabs.com/img/items180/shotgun.spas12.png', stackSize: 1 },
  { id: 'shotgun.double', name: 'Двустволка', shortname: 'shotgun.double', icon: 'https://rustlabs.com/img/items180/shotgun.double.png', stackSize: 1 },
  { id: 'shotgun.waterpipe', name: 'Водник', shortname: 'shotgun.waterpipe', icon: 'https://rustlabs.com/img/items180/shotgun.waterpipe.png', stackSize: 1 },
  { id: 'lmg.m249', name: 'M249', shortname: 'lmg.m249', icon: 'https://rustlabs.com/img/items180/lmg.m249.png', stackSize: 1 },
  { id: 'hmlmg', name: 'HMLMG', shortname: 'hmlmg', icon: 'https://rustlabs.com/img/items180/hmlmg.png', stackSize: 1 },
  { id: 'bow.hunting', name: 'Охотничий лук', shortname: 'bow.hunting', icon: 'https://rustlabs.com/img/items180/bow.hunting.png', stackSize: 1 },
  { id: 'bow.compound', name: 'Блочный лук', shortname: 'bow.compound', icon: 'https://rustlabs.com/img/items180/bow.compound.png', stackSize: 1 },
  { id: 'crossbow', name: 'Арбалет', shortname: 'crossbow', icon: 'https://rustlabs.com/img/items180/crossbow.png', stackSize: 1 },
  { id: 'rocket.launcher', name: 'Rocket Launcher', shortname: 'rocket.launcher', icon: 'https://rustlabs.com/img/items180/rocket.basic.png', stackSize: 1 },
  { id: 'pistol.semiauto', name: 'P250', shortname: 'pistol.semiauto', icon: 'https://rustlabs.com/img/items180/pistol.semiauto.png', stackSize: 1 },
  { id: 'rifle.semiauto', name: 'SAR', shortname: 'rifle.semiauto', icon: 'https://rustlabs.com/img/items180/rifle.semiauto.png', stackSize: 1 },

  // --- AMMO ---
  { id: 'ammo.rifle', name: '5.56 Патроны', shortname: 'ammo.rifle', icon: 'https://rustlabs.com/img/items180/ammo.rifle.png', stackSize: 128 },
  { id: 'ammo.rifle.explosive', name: 'Разрывные 5.56', shortname: 'ammo.rifle.explosive', icon: 'https://rustlabs.com/img/items180/ammo.rifle.explosive.png', stackSize: 128 },
  { id: 'ammo.rifle.incendiary', name: 'Зажигательные 5.56', shortname: 'ammo.rifle.incendiary', icon: 'https://rustlabs.com/img/items180/ammo.rifle.incendiary.png', stackSize: 128 },
  { id: 'ammo.pistol', name: '9mm Патроны', shortname: 'ammo.pistol', icon: 'https://rustlabs.com/img/items180/ammo.pistol.png', stackSize: 128 },
  { id: 'ammo.pistol.incendiary', name: 'Зажигательные 9mm', shortname: 'ammo.pistol.incendiary', icon: 'https://rustlabs.com/img/items180/ammo.pistol.incendiary.png', stackSize: 128 },
  { id: 'ammo.shotgun', name: 'Дробь', shortname: 'ammo.shotgun', icon: 'https://rustlabs.com/img/items180/ammo.shotgun.png', stackSize: 64 },
  { id: 'ammo.shotgun.slug', name: 'Пулевые для дробовика', shortname: 'ammo.shotgun.slug', icon: 'https://rustlabs.com/img/items180/ammo.shotgun.slug.png', stackSize: 64 },
  { id: 'ammo.shotgun.fire', name: 'Зажигательные для дробовика', shortname: 'ammo.shotgun.fire', icon: 'https://rustlabs.com/img/items180/ammo.shotgun.fire.png', stackSize: 64 },
  { id: 'ammo.rocket.basic', name: 'Ракета', shortname: 'ammo.rocket.basic', icon: 'https://rustlabs.com/img/items180/rocket.basic.png', stackSize: 3 },
  { id: 'ammo.rocket.fire', name: 'Зажигательная ракета', shortname: 'ammo.rocket.fire', icon: 'https://rustlabs.com/img/items180/rocket.fire.png', stackSize: 3 },
  { id: 'ammo.rocket.hv', name: 'Скоростная ракета', shortname: 'ammo.rocket.hv', icon: 'https://rustlabs.com/img/items180/rocket.hv.png', stackSize: 3 },
  { id: 'arrow.wooden', name: 'Деревянная стрела', shortname: 'arrow.wooden', icon: 'https://rustlabs.com/img/items180/arrow.wooden.png', stackSize: 64 },
  { id: 'arrow.bone', name: 'Костяная стрела', shortname: 'arrow.bone', icon: 'https://rustlabs.com/img/items180/arrow.bone.png', stackSize: 64 },

  // --- EXPLOSIVES ---
  { id: 'explosive.timed', name: 'C4', shortname: 'explosive.timed', icon: 'https://rustlabs.com/img/items180/explosive.timed.png', stackSize: 10 },
  { id: 'grenade.satchel', name: 'Сачель', shortname: 'grenade.satchel', icon: 'https://rustlabs.com/img/items180/grenade.satchel.png', stackSize: 10 },
  { id: 'grenade.beancan', name: 'Бобовка', shortname: 'grenade.beancan', icon: 'https://rustlabs.com/img/items180/grenade.beancan.png', stackSize: 10 },
  { id: 'grenade.f1', name: 'Граната F1', shortname: 'grenade.f1', icon: 'https://rustlabs.com/img/items180/grenade.f1.png', stackSize: 10 },
  { id: 'explosives', name: 'Взрывчатка (Explosives)', shortname: 'explosives', icon: 'https://rustlabs.com/img/items180/explosives.png', stackSize: 50 },
  { id: 'gunpowder', name: 'Порох', shortname: 'gunpowder', icon: 'https://rustlabs.com/img/items180/gunpowder.png', stackSize: 1000 },

  // --- ARMOR ---
  { id: 'metal.facemask', name: 'МВК Маска', shortname: 'metal.facemask', icon: 'https://rustlabs.com/img/items180/metal.facemask.png', stackSize: 1 },
  { id: 'metal.plate.torso', name: 'МВК Нагрудник', shortname: 'metal.plate.torso', icon: 'https://rustlabs.com/img/items180/metal.plate.torso.png', stackSize: 1 },
  { id: 'roadsign.jacket', name: 'Нагрудник из дор. знаков', shortname: 'roadsign.jacket', icon: 'https://rustlabs.com/img/items180/roadsign.jacket.png', stackSize: 1 },
  { id: 'roadsign.kilt', name: 'Юбка из дор. знаков', shortname: 'roadsign.kilt', icon: 'https://rustlabs.com/img/items180/roadsign.kilt.png', stackSize: 1 },
  { id: 'coffeecan.helmet', name: 'Шлем из кофейной банки', shortname: 'coffeecan.helmet', icon: 'https://rustlabs.com/img/items180/coffeecan.helmet.png', stackSize: 1 },
  { id: 'wood.armor.jacket', name: 'Деревянный нагрудник', shortname: 'wood.armor.jacket', icon: 'https://rustlabs.com/img/items180/wood.armor.jacket.png', stackSize: 1 },
  { id: 'hazmatsuit', name: 'Хазмат (Hazmat)', shortname: 'hazmatsuit', icon: 'https://rustlabs.com/img/items180/hazmatsuit.png', stackSize: 1 },
  { id: 'hoodie', name: 'Толстовка', shortname: 'hoodie', icon: 'https://rustlabs.com/img/items180/hoodie.png', stackSize: 1 },
  { id: 'pants', name: 'Штаны', shortname: 'pants', icon: 'https://rustlabs.com/img/items180/pants.png', stackSize: 1 },
  { id: 'shoes.boots', name: 'Ботинки', shortname: 'shoes.boots', icon: 'https://rustlabs.com/img/items180/shoes.boots.png', stackSize: 1 },
  { id: 'gloves.leather', name: 'Кожаные перчатки', shortname: 'gloves.leather', icon: 'https://rustlabs.com/img/items180/gloves.leather.png', stackSize: 1 },
  { id: 'heavy.plate.helmet', name: 'Тяжелый шлем', shortname: 'heavy.plate.helmet', icon: 'https://rustlabs.com/img/items180/heavy.plate.helmet.png', stackSize: 1 },
  { id: 'heavy.plate.jacket', name: 'Тяжелый нагрудник', shortname: 'heavy.plate.jacket', icon: 'https://rustlabs.com/img/items180/heavy.plate.jacket.png', stackSize: 1 },
  { id: 'heavy.plate.pants', name: 'Тяжелые штаны', shortname: 'heavy.plate.pants', icon: 'https://rustlabs.com/img/items180/heavy.plate.pants.png', stackSize: 1 },

  // --- TOOLS ---
  { id: 'hatchet', name: 'Топор', shortname: 'hatchet', icon: 'https://rustlabs.com/img/items180/hatchet.png', stackSize: 1 },
  { id: 'pickaxe', name: 'Кирка', shortname: 'pickaxe', icon: 'https://rustlabs.com/img/items180/pickaxe.png', stackSize: 1 },
  { id: 'stonehatchet', name: 'Каменный топор', shortname: 'stonehatchet', icon: 'https://rustlabs.com/img/items180/stonehatchet.png', stackSize: 1 },
  { id: 'stone.pickaxe', name: 'Каменная кирка', shortname: 'stone.pickaxe', icon: 'https://rustlabs.com/img/items180/stone.pickaxe.png', stackSize: 1 },
  { id: 'salvaged.axe', name: 'Ледоруб', shortname: 'salvaged.axe', icon: 'https://rustlabs.com/img/items180/salvaged.axe.png', stackSize: 1 },
  { id: 'salvaged.icepick', name: 'Самодельная кирка', shortname: 'salvaged.icepick', icon: 'https://rustlabs.com/img/items180/salvaged.icepick.png', stackSize: 1 },
  { id: 'chainsaw', name: 'Бензопила', shortname: 'chainsaw', icon: 'https://rustlabs.com/img/items180/chainsaw.png', stackSize: 1 },
  { id: 'jackhammer', name: 'Отбойный молоток', shortname: 'jackhammer', icon: 'https://rustlabs.com/img/items180/jackhammer.png', stackSize: 1 },
  { id: 'hammer', name: 'Молоток', shortname: 'hammer', icon: 'https://rustlabs.com/img/items180/hammer.png', stackSize: 1 },
  { id: 'building.planner', name: 'План постройки', shortname: 'building.planner', icon: 'https://rustlabs.com/img/items180/building.planner.png', stackSize: 1 },

  // --- MEDS/FOOD ---
  { id: 'syringe.medical', name: 'Медицинский шприц', shortname: 'syringe.medical', icon: 'https://rustlabs.com/img/items180/syringe.medical.png', stackSize: 2 },
  { id: 'bandage', name: 'Бинт', shortname: 'bandage', icon: 'https://rustlabs.com/img/items180/bandage.png', stackSize: 3 },
  { id: 'medkit', name: 'Аптечка', shortname: 'medkit', icon: 'https://rustlabs.com/img/items180/large.medkit.png', stackSize: 1 },
  { id: 'anti-rad.pills', name: 'Антирадиационные таблетки', shortname: 'anti-rad.pills', icon: 'https://rustlabs.com/img/items180/anti-rad.pills.png', stackSize: 10 },
  { id: 'apple', name: 'Яблоко', shortname: 'apple', icon: 'https://rustlabs.com/img/items180/apple.png', stackSize: 10 },
  { id: 'bearmeat.cooked', name: 'Жареная медвежатина', shortname: 'bearmeat.cooked', icon: 'https://rustlabs.com/img/items180/bearmeat.cooked.png', stackSize: 20 },

  // --- COMPONENTS ---
  { id: 'gears', name: 'Шестерни', shortname: 'gears', icon: 'https://rustlabs.com/img/items180/gears.png', stackSize: 20 },
  { id: 'spring', name: 'Пружина', shortname: 'spring', icon: 'https://rustlabs.com/img/items180/spring.png', stackSize: 20 },
  { id: 'riflebody', name: 'Корпус винтовки', shortname: 'riflebody', icon: 'https://rustlabs.com/img/items180/riflebody.png', stackSize: 10 },
  { id: 'smgbody', name: 'Корпус пистолета-пулемета', shortname: 'smgbody', icon: 'https://rustlabs.com/img/items180/smgbody.png', stackSize: 10 },
  { id: 'techparts', name: 'Техдетали', shortname: 'techparts', icon: 'https://rustlabs.com/img/items180/techparts.png', stackSize: 50 },
  { id: 'roadsigns', name: 'Дорожные знаки', shortname: 'roadsigns', icon: 'https://rustlabs.com/img/items180/roadsigns.png', stackSize: 20 },
  { id: 'tarp', name: 'Тарпаулин', shortname: 'tarp', icon: 'https://rustlabs.com/img/items180/tarp.png', stackSize: 20 },
  { id: 'rope', name: 'Веревка', shortname: 'rope', icon: 'https://rustlabs.com/img/items180/rope.png', stackSize: 50 },
  { id: 'pipe', name: 'Металлическая труба', shortname: 'pipe', icon: 'https://rustlabs.com/img/items180/pipe.png', stackSize: 20 },
  { id: 'fuse', name: 'Предохранитель', shortname: 'fuse', icon: 'https://rustlabs.com/img/items180/fuse.png', stackSize: 10 },
  { id: 'cctv.camera', name: 'Камера видеонаблюдения', shortname: 'cctv.camera', icon: 'https://rustlabs.com/img/items180/cctv.camera.png', stackSize: 10 },
  { id: 'targeting.computer', name: 'Компьютер наведения', shortname: 'targeting.computer', icon: 'https://rustlabs.com/img/items180/targeting.computer.png', stackSize: 10 },

  // --- BASE & CONSTRUCTION ---
  { id: 'cupboard.tool', name: 'Шкаф (TC)', shortname: 'cupboard.tool', icon: 'https://rustlabs.com/img/items180/cupboard.tool.png', stackSize: 1 },
  { id: 'lock.code', name: 'Кодовый замок', shortname: 'lock.code', icon: 'https://rustlabs.com/img/items180/lock.code.png', stackSize: 10 },
  { id: 'lock.key', name: 'Обычный замок', shortname: 'lock.key', icon: 'https://rustlabs.com/img/items180/lock.key.png', stackSize: 10 },
  { id: 'box.wooden.large', name: 'Большой сундук', shortname: 'box.wooden.large', icon: 'https://rustlabs.com/img/items180/box.wooden.large.png', stackSize: 1 },
  { id: 'box.wooden', name: 'Маленький ящик', shortname: 'box.wooden', icon: 'https://rustlabs.com/img/items180/box.wooden.png', stackSize: 1 },
  { id: 'furnace', name: 'Маленькая печь', shortname: 'furnace', icon: 'https://rustlabs.com/img/items180/furnace.png', stackSize: 1 },
  { id: 'furnace.large', name: 'Большая печь', shortname: 'furnace.large', icon: 'https://rustlabs.com/img/items180/furnace.large.png', stackSize: 1 },
  { id: 'refinery.small', name: 'НПЗ', shortname: 'refinery.small', icon: 'https://rustlabs.com/img/items180/refinery.small.png', stackSize: 1 },
  { id: 'research.table', name: 'Стол исследований', shortname: 'research.table', icon: 'https://rustlabs.com/img/items180/research.table.png', stackSize: 1 },
  { id: 'workbench1', name: 'Верстак 1 ур.', shortname: 'workbench1', icon: 'https://rustlabs.com/img/items180/workbench1.png', stackSize: 1 },
  { id: 'workbench2', name: 'Верстак 2 ур.', shortname: 'workbench2', icon: 'https://rustlabs.com/img/items180/workbench2.png', stackSize: 1 },
  { id: 'workbench3', name: 'Верстак 3 ур.', shortname: 'workbench3', icon: 'https://rustlabs.com/img/items180/workbench3.png', stackSize: 1 },
  { id: 'locker', name: 'Шкафчик (Locker)', shortname: 'locker', icon: 'https://rustlabs.com/img/items180/locker.png', stackSize: 1 },

  // --- ELECTRICITY ---
  { id: 'generator.wind.static', name: 'Ветрогенератор', shortname: 'generator.wind.static', icon: 'https://rustlabs.com/img/items180/generator.wind.static.png', stackSize: 1 },
  { id: 'solar.panel', name: 'Солнечная панель', shortname: 'solar.panel', icon: 'https://rustlabs.com/img/items180/solar.panel.png', stackSize: 1 },
  { id: 'battery.small', name: 'Малый аккумулятор', shortname: 'battery.small', icon: 'https://rustlabs.com/img/items180/battery.small.png', stackSize: 1 },
  { id: 'battery.medium', name: 'Средний аккумулятор', shortname: 'battery.medium', icon: 'https://rustlabs.com/img/items180/battery.medium.png', stackSize: 1 },
  { id: 'battery.large', name: 'Большой аккумулятор', shortname: 'battery.large', icon: 'https://rustlabs.com/img/items180/battery.large.png', stackSize: 1 },
  { id: 'electric.switch', name: 'Переключатель', shortname: 'electric.switch', icon: 'https://rustlabs.com/img/items180/electric.switch.png', stackSize: 10 },
  { id: 'wiretool', name: 'Разводной ключ', shortname: 'wiretool', icon: 'https://rustlabs.com/img/items180/wiretool.png', stackSize: 1 },

  // --- TRAPS & DEFENSE ---
  { id: 'autoturret', name: 'Авто-турель', shortname: 'autoturret', icon: 'https://rustlabs.com/img/items180/autoturret.png', stackSize: 1 },
  { id: 'guntrap', name: 'Дробовик-ловушка', shortname: 'guntrap', icon: 'https://rustlabs.com/img/items180/guntrap.png', stackSize: 1 },
  { id: 'flametrap', name: 'Огненная турель', shortname: 'flametrap', icon: 'https://rustlabs.com/img/items180/flametrap.png', stackSize: 1 },
  { id: 'landmine', name: 'Мина', shortname: 'landmine', icon: 'https://rustlabs.com/img/items180/landmine.png', stackSize: 5 },
  { id: 'trap.bear', name: 'Капкан', shortname: 'trap.bear', icon: 'https://rustlabs.com/img/items180/trap.bear.png', stackSize: 3 },
  { id: 'spikes.floor', name: 'Деревянные шипы', shortname: 'spikes.floor', icon: 'https://rustlabs.com/img/items180/spikes.floor.png', stackSize: 10 },

  // --- VEHICLES & MISC ---
  { id: 'minicopter', name: 'Миникоптер (Minicopter)', shortname: 'minicopter', icon: 'https://rustlabs.com/img/items180/minicopter.png', stackSize: 1 },
  { id: 'scraptransportheli', name: 'Транспортный вертолет', shortname: 'scraptransportheli', icon: 'https://rustlabs.com/img/items180/scraptransportheli.png', stackSize: 1 },
  { id: 'kayak', name: 'Каяк', shortname: 'kayak', icon: 'https://rustlabs.com/img/items180/kayak.png', stackSize: 1 },
  { id: 'scubatank', name: 'Баллон для дайвинга', shortname: 'scubatank', icon: 'https://rustlabs.com/img/items180/scubatank.png', stackSize: 1 },
  { id: 'diving.mask', name: 'Маска для дайвинга', shortname: 'diving.mask', icon: 'https://rustlabs.com/img/items180/diving.mask.png', stackSize: 1 },
];

export const SERVERS: ServerInfo[] = [
  { 
    id: 'srv_1', 
    name: 'Ostrum #1 [MAX 3]', 
    ip: 'connect.ostrum.ru', 
    port: 28015, 
    mapUrl: 'https://rustmaps.com/procedural/2023',
    maxPlayers: 200, 
    currentPlayers: 142, 
    status: 'online', 
    lastWipe: '2023-10-26'
  },
  { 
    id: 'srv_2', 
    name: 'Ostrum #2 [CLAN]', 
    ip: 'connect.ostrum.ru', 
    port: 28025, 
    mapUrl: 'https://rustmaps.com/barren/2023',
    maxPlayers: 300, 
    currentPlayers: 289, 
    status: 'online', 
    lastWipe: '2023-10-26' 
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Набор новичка (Start Kit)',
    price: 39,
    currency: 'RUB',
    category: ProductCategory.KITS,
    image: 'https://picsum.photos/200/200?random=1',
    contents: [
      { itemId: 'hatchet', quantity: 1 },
      { itemId: 'pickaxe', quantity: 1 },
      { itemId: 'wood', quantity: 5000 },
      { itemId: 'stones', quantity: 2000 },
      { itemId: 'bandage', quantity: 5 },
    ],
    discount: {
      percent: 30,
      endsAt: '2025-12-30T17:00:00'
    },
    serverIds: ['srv_1', 'srv_2']
  },
  {
    id: 'p_event_1',
    name: 'Снежный Кейс',
    price: 5, // 5 Снежинок
    currency: 'EVENT',
    category: ProductCategory.CRATES,
    image: 'https://rustlabs.com/img/items180/box.wooden.large.png',
    isCrate: true,
    contents: [],
    lootTable: [
        { itemId: 'rifle.ak', quantity: 1, chance: 10 },
        { itemId: 'ammo.rifle', quantity: 128, chance: 90 }
    ],
    serverIds: ['srv_1', 'srv_2']
  },
  {
    id: 'p4',
    name: 'Бесплатный ежедневный бонус',
    price: 0,
    currency: 'RUB',
    category: ProductCategory.SPECIAL,
    image: 'https://rustlabs.com/img/items180/box.wooden.png',
    isFree: true,
    cooldownHours: 24,
    contents: [
       { itemId: 'wood', quantity: 1000 }
    ],
    serverIds: ['srv_1', 'srv_2']
  }
];

// Added missing productCooldowns property to MOCK_USER to satisfy the User interface requirement.
export const MOCK_USER: User = {
  id: 'u1',
  steamId: '76561198000000000',
  nickname: 'OstrumPlayer',
  avatar: 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
  role: UserRole.ADMIN,
  balance: 10000,
  eventBalance: 25.5,
  lastBonusClaim: '2023-10-25T10:00:00',
  productCooldowns: {},
  usedPromos: [],
  freeCrates: [],
  notifications: [],
  referralCode: 'OSTRUM-GIFT',
  totalReferralEarnings: 0
};

export const MOCK_TRANSACTIONS: Transaction[] = [];
export const MOCK_PENDING_ITEMS: PendingItem[] = [];
