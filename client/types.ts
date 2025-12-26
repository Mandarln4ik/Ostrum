
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum ProductCategory {
  RESOURCES = 'Ресурсы',
  TOOLS = 'Инструменты',
  WEAPONS = 'Оружие',
  ARMOR = 'Броня',
  AMMO = 'Боеприпасы',
  MEDS_FOOD = 'Медикаменты и Еда',
  CONSTRUCTION = 'Конструкции',
  COMPONENTS = 'Компоненты',
  ELECTRICITY = 'Электрика',
  KITS = 'Наборы (Kits)',
  SPECIAL = 'Спецпредложения',
  CRATES = 'Кейсы'
}

export type CurrencyType = 'RUB' | 'EVENT';

export type PromoRewardType = 'PRODUCT' | 'FREE_CRATE' | 'RUB_BALANCE' | 'EVENT_BALANCE' | 'TOPUP_BONUS';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'gift' | 'promo' | 'info';
  date: string;
  read: boolean;
}

export interface PromoCode {
  id: string;
  code: string;
  rewardType: PromoRewardType;
  rewardValue: string | number; // ProductID, CrateID, Amount, or Percent
  maxActivations: number;
  currentActivations: number;
  userId?: string; // Optional: linked to a specific user
}

export interface GameItem {
  id: string;
  name: string;
  shortname: string;
  icon: string;
  stackSize: number;
}

export interface LootTableItem {
  itemId: string;
  quantity: number;
  chance: number; 
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: CurrencyType;
  image: string;
  category: ProductCategory;
  contents: {
    itemId: string;
    quantity: number;
  }[];
  isCrate?: boolean;
  lootTable?: LootTableItem[];
  discount?: {
    percent: number;
    endsAt?: string | null;
  };
  isFree?: boolean;
  eventBonus?: number; // Manual snowflake reward amount
  cooldownHours?: number;
  serverIds: string[];
}

export interface ServerInfo {
  id: string;
  name: string;
  ip: string;
  port: number;
  mapUrl: string;
  maxPlayers: number;
  currentPlayers: number;
  status: 'online' | 'offline' | 'wiping';
  lastWipe: string;
}

export interface User {
  id: string;
  steamId: string;
  nickname: string;
  avatar: string;
  role: UserRole;
  balance: number;
  eventBalance: number; // Снежинки
  lastBonusClaim?: string;
  productCooldowns: { [productId: string]: string }; // Tracks last claim date per product
  usedPromos: string[];
  freeCrates: string[]; // List of crate IDs user can open for free
  activeTopupBonus?: number; // Flag for top-up bonus from promo
  notifications: Notification[];
  // Referral System
  referralCode: string;
  referredById?: string;
  totalReferralEarnings: number;
}

export interface Transaction {
  id: string;
  userId: string;
  userNickname: string;
  serverId: string;
  products: { name: string; quantity: number }[];
  totalAmount: number;
  currency: CurrencyType;
  date: string;
  paymentMethod: 'YUKASSA' | 'BALANCE' | 'FREE' | 'EVENT' | 'PROMO';
}

export interface PendingItem {
  id: string;
  itemName: string;
  quantity: number;
  icon: string;
  serverId: string;
  purchaseDate: string;
  status: 'PENDING' | 'DELIVERED';
}
