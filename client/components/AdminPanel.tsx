import React, { useState } from 'react';
import { Product, ProductCategory, ServerInfo, PromoCode, PromoRewardType, User, Notification, CurrencyType } from '../types';
import { GameItem } from '../services/items.service';
import { ProductService } from '../services/product.service'; 
import { Trash, Clock, Package, Zap, Percent, Search, Megaphone, Check, ImageIcon, Ticket, X, Users as UsersIcon, Send, User as UserIcon, Save, Plus, ArrowLeft } from 'lucide-react';

interface AdminPanelProps {
  products: Product[];
  setProducts: (products: Product[]) => void;
  servers: ServerInfo[];
  users: User[];
  promos: PromoCode[];
  setPromos: (promos: PromoCode[]) => void;
  onUpdateUserBalance: (userId: string, amount: number, type: 'RUB' | 'EVENT') => void;
  onSendNotification: (userId: string, notif: Omit<Notification, 'id' | 'date' | 'read'>) => void;
  onSendGlobalNotification: (notif: Omit<Notification, 'id' | 'date' | 'read'>) => void;
  gameItems: GameItem[]; // Библиотека предметов из БД
}

const AdminPanel: React.FC<AdminPanelProps> = ({ products, setProducts, servers, users, promos, setPromos, onUpdateUserBalance, onSendNotification, onSendGlobalNotification, gameItems }) => {
  const [activeTab, setActiveTab] = useState<'products' | 'promos' | 'users'>('products');
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Состояние редактируемого продукта
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({
    name: '', shortname: '', price: 0, currency: 'RUB', category: ProductCategory.RESOURCES, 
    contents: [], servers: [], isCrate: false, isFree: false, eventBonus: 0, 
    cooldownHours: 0, lootTable: [], image_url: '', discount: undefined
  });

  // --- УПРАВЛЕНИЕ ТОВАРАМИ ---

  const handleCreateNew = (isCrate: boolean) => {
    setEditingProduct({ 
      id: undefined, // Новый товар
      name: '', 
      shortname: '', 
      price: 0, 
      currency: 'RUB', 
      category: isCrate ? ProductCategory.CRATES : ProductCategory.RESOURCES, 
      contents: [], 
      servers: [], 
      isCrate: isCrate, 
      isFree: false, 
      eventBonus: 0, 
      cooldownHours: 0, 
      lootTable: [], 
      image_url: isCrate ? 'https://rustlabs.com/img/items180/box.wooden.large.png' : '', 
      discount: undefined 
    });
    setIsEditing(true);
  };

  const handleEditExisting = (product: Product) => {
    setEditingProduct({ ...product }); // Загружаем данные товара в форму
    setIsEditing(true);
  };

  const handleSaveProduct = async () => {
    if (!editingProduct.name) return alert('Введите название товара!');
    if (!editingProduct.servers || editingProduct.servers.length === 0) return alert('Выберите хотя бы один сервер!');
    // Shortname обязателен для выдачи предмета в игре!
    if (!editingProduct.shortname && !editingProduct.isCrate) return alert('Системное имя (Shortname) не заполнено! Добавьте предмет в содержимое.');

    try {
      const payload = {
        ...editingProduct,
        price: editingProduct.isFree ? 0 : Number(editingProduct.price),
        skin_id: Number(editingProduct.skin_id || 0),
        amount: Number(editingProduct.amount || 1),
        // Гарантируем массивы
        contents: editingProduct.contents || [],
        lootTable: editingProduct.lootTable || [],
        servers: editingProduct.servers || [],
      };

      let saved: Product;

      if (editingProduct.id) {
        // ОБНОВЛЕНИЕ (PUT)
        saved = await ProductService.update(editingProduct.id, payload);
        setProducts(products.map(p => p.id === saved.id ? saved : p));
      } else {
        // СОЗДАНИЕ (POST)
        saved = await ProductService.create(payload);
        setProducts([...products, saved]);
      }

      setIsEditing(false);
    } catch (e) {
      console.error(e);
      alert('Ошибка при сохранении. Проверьте консоль.');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Удалить этот товар из Базы Данных?')) return;
    try {
      await ProductService.delete(id);
      setProducts(products.filter(p => p.id !== id));
      if (isEditing && editingProduct.id === id) setIsEditing(false);
    } catch (e) {
      console.error(e);
      alert('Ошибка при удалении');
    }
  };

  // --- ЛОГИКА СОДЕРЖИМОГО (ITEMS) ---

  const addItemToProduct = (item: GameItem) => {
    // 1. Авто-заполнение полей товара, если они пустые
    const updates: Partial<Product> = {};
    if (!editingProduct.name) updates.name = item.name;
    if (!editingProduct.image_url) updates.image_url = item.icon_url;
    if (!editingProduct.shortname) updates.shortname = item.code; // ВАЖНО для Rust!

    setEditingProduct(prev => {
      const newState = { ...prev, ...updates };

      if (prev.isCrate) {
        // Логика для КЕЙСА (LootTable)
        const currentLoot = prev.lootTable || [];
        // Можно добавлять один и тот же предмет несколько раз с разными шансами
        return {
          ...newState,
          lootTable: [...currentLoot, { itemId: item.code, quantity: 1, chance: 10 }]
        };
      } else {
        // Логика для ТОВАРА (Contents)
        const currentContents = prev.contents || [];
        if (currentContents.find(c => c.itemId === item.code)) return newState; // Не дублируем в обычном товаре
        return {
          ...newState,
          contents: [...currentContents, { itemId: item.code, quantity: 1 }]
        };
      }
    });
  };

  const removeItemFromProduct = (index: number, isLootTable: boolean) => {
    if (isLootTable) {
      setEditingProduct({ ...editingProduct, lootTable: editingProduct.lootTable?.filter((_, i) => i !== index) });
    } else {
      setEditingProduct({ ...editingProduct, contents: editingProduct.contents?.filter((_, i) => i !== index) });
    }
  };

  const updateItemField = (index: number, field: 'quantity' | 'chance', value: number, isLootTable: boolean) => {
    if (isLootTable) {
      const newLoot = [...(editingProduct.lootTable || [])];
      newLoot[index] = { ...newLoot[index], [field]: value };
      setEditingProduct({ ...editingProduct, lootTable: newLoot });
    } else {
      const newContents = [...(editingProduct.contents || [])];
      newContents[index] = { ...newContents[index], [field]: value };
      setEditingProduct({ ...editingProduct, contents: newContents });
    }
  };

  // --- СЕРВЕРА ---
  const toggleServer = (sid: string) => {
    const current = editingProduct.servers || [];
    setEditingProduct({
      ...editingProduct,
      servers: current.includes(sid) ? current.filter(s => s !== sid) : [...current, sid]
    });
  };

  return (
    <div className="bg-ostrum-card rounded-[2.5rem] border border-white/5 p-8 shadow-2xl min-h-[85vh]">
      
      {/* --- ВКЛАДКИ --- */}
      <div className="flex gap-2 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
        <button onClick={() => setActiveTab('products')} className={`px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-all ${activeTab === 'products' ? 'bg-ostrum-primary text-white' : 'text-ostrum-muted hover:text-white'}`}>Товары</button>
        <button onClick={() => setActiveTab('promos')} className={`px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-all ${activeTab === 'promos' ? 'bg-ostrum-primary text-white' : 'text-ostrum-muted hover:text-white'}`}>Промокоды</button>
        <button onClick={() => setActiveTab('users')} className={`px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-all ${activeTab === 'users' ? 'bg-ostrum-primary text-white' : 'text-ostrum-muted hover:text-white'}`}>Игроки</button>
      </div>

      {/* ================= Вкладка: ТОВАРЫ ================= */}
      {activeTab === 'products' && (
        <>
          {!isEditing ? (
            // --- СПИСОК ТОВАРОВ ---
            <div className="space-y-8 animate-in fade-in">
              <div className="flex gap-4">
                <button onClick={() => handleCreateNew(false)} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg transition-transform hover:scale-105">
                  <Zap size={18} /> Создать Товар
                </button>
                <button onClick={() => handleCreateNew(true)} className="flex items-center gap-2 bg-ostrum-accent hover:bg-red-500 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg transition-transform hover:scale-105">
                  <Package size={18} /> Создать Кейс
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => handleEditExisting(p)}
                    className="bg-black/20 p-5 rounded-2xl border border-white/5 flex items-center gap-4 cursor-pointer hover:border-ostrum-primary transition-all group relative hover:bg-white/5"
                  >
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteProduct(p.id); }} 
                      className="absolute top-2 right-2 p-2 bg-black/50 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
                    >
                      <Trash size={14} />
                    </button>
                    
                    <div className="relative shrink-0">
                       <img src={p.image_url || 'https://via.placeholder.com/50'} className="w-14 h-14 object-contain" alt="" />
                       {p.isCrate && <div className="absolute -bottom-2 -right-2 bg-ostrum-accent text-white text-[8px] font-black px-1.5 rounded shadow-sm">CASE</div>}
                    </div>
                    
                    <div className="min-w-0">
                      <div className="font-bold text-white uppercase text-[10px] truncate">{p.name}</div>
                      <div className={`font-black text-sm ${p.currency === 'EVENT' ? 'text-blue-400' : 'text-ostrum-primary'}`}>
                        {p.isFree ? 'FREE' : `${p.price} ${p.currency === 'RUB' ? '₽' : '❄'}`}
                      </div>
                      <div className="text-[8px] text-ostrum-muted mt-1 truncate">{p.shortname}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // --- РЕДАКТОР ---
            <div className="flex flex-col xl:flex-row gap-8 animate-in slide-in-from-right-10 duration-300">
              
              {/* ЛЕВАЯ КОЛОНКА: Настройки */}
              <div className="w-full xl:w-1/3 space-y-5 bg-black/20 p-6 rounded-[2rem] border border-white/5 h-fit">
                 <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight italic">
                        {editingProduct.id ? 'Редактирование' : 'Создание'} {editingProduct.isCrate ? 'Кейса' : 'Товара'}
                    </h3>
                    <button onClick={() => setIsEditing(false)} className="flex items-center gap-1 text-ostrum-muted hover:text-white text-[10px] font-bold uppercase"><ArrowLeft size={14}/> Назад</button>
                 </div>

                 <div className="space-y-4">
                    {/* Основные поля */}
                    <div>
                        <label className="text-[9px] font-bold text-ostrum-muted uppercase ml-2">Название</label>
                        <input className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold outline-none focus:border-ostrum-primary" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[9px] font-bold text-ostrum-muted uppercase ml-2">Shortname</label>
                            <input className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-ostrum-primary font-bold outline-none text-xs" value={editingProduct.shortname} onChange={e => setEditingProduct({...editingProduct, shortname: e.target.value})} placeholder="rifle.ak" />
                        </div>
                        <div>
                             <label className="text-[9px] font-bold text-ostrum-muted uppercase ml-2">Картинка URL</label>
                             <input className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold outline-none text-xs" value={editingProduct.image_url} onChange={e => setEditingProduct({...editingProduct, image_url: e.target.value})} />
                        </div>
                    </div>

                    {/* Цена и Валюта */}
                    <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-3">
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-white uppercase">Бесплатно?</span>
                            <button onClick={() => setEditingProduct({...editingProduct, isFree: !editingProduct.isFree, price: 0})} className={`w-10 h-5 rounded-full relative transition-colors ${editingProduct.isFree ? 'bg-green-600' : 'bg-white/10'}`}>
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${editingProduct.isFree ? 'left-5.5' : 'left-0.5'}`}></div>
                            </button>
                         </div>
                         {!editingProduct.isFree && (
                             <div className="grid grid-cols-2 gap-3 animate-in fade-in">
                                 <select className="bg-black/40 border border-white/10 rounded-xl p-3 text-white text-xs font-bold outline-none" value={editingProduct.currency} onChange={e => setEditingProduct({...editingProduct, currency: e.target.value as CurrencyType})}>
                                     <option value="RUB">₽ (RUB)</option>
                                     <option value="EVENT">❄ (EVENT)</option>
                                 </select>
                                 <input type="number" className="bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold outline-none" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} placeholder="Цена" />
                             </div>
                         )}
                    </div>

                    {/* Сервера */}
                    <div>
                        <label className="text-[9px] font-bold text-ostrum-muted uppercase ml-2 mb-2 block">Доступно на серверах:</label>
                        <div className="flex flex-wrap gap-2">
                            {servers.map(s => (
                                <button key={s.id} onClick={() => toggleServer(s.identifier)} className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase border transition-all ${editingProduct.servers?.includes(s.identifier) ? 'bg-ostrum-primary border-ostrum-primary text-white' : 'border-white/10 text-ostrum-muted hover:border-white/30'}`}>
                                    {s.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button onClick={handleSaveProduct} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg">Сохранить</button>
                        {editingProduct.id && <button onClick={() => handleDeleteProduct(editingProduct.id!)} className="px-4 bg-red-900/20 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-xl"><Trash size={16}/></button>}
                    </div>
                 </div>
              </div>

              {/* ПРАВАЯ КОЛОНКА: Контент + Библиотека */}
              <div className="flex-1 flex flex-col gap-6">
                 
                 {/* 1. БИБЛИОТЕКА ПРЕДМЕТОВ (Из БД) */}
                 <div className="bg-black/40 rounded-[2rem] p-6 border border-white/5 h-[320px] flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Библиотека предметов</h4>
                        <div className="relative w-48">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ostrum-muted"/>
                            <input type="text" placeholder="Поиск..." className="w-full bg-black/60 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-[10px] text-white font-bold uppercase outline-none focus:border-ostrum-primary" onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 overflow-y-auto custom-scrollbar pr-2 flex-1 content-start">
                        {gameItems.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                            <button key={item.code} onClick={() => addItemToProduct(item)} className="bg-white/5 p-2 rounded-xl border border-white/5 hover:border-ostrum-primary hover:bg-white/10 transition-all flex flex-col items-center gap-2 group aspect-square justify-center" title={item.name}>
                                <img src={item.icon_url} className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
                                <span className="text-[7px] font-bold text-ostrum-muted uppercase truncate w-full text-center group-hover:text-white">{item.name}</span>
                            </button>
                        ))}
                    </div>
                 </div>

                 {/* 2. ВЫБРАННОЕ СОДЕРЖИМОЕ */}
                 <div className="bg-black/20 rounded-[2rem] p-6 border border-white/5 flex-1 min-h-[200px]">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-4">
                        {editingProduct.isCrate ? 'Таблица лута (Шансы)' : 'Содержимое набора'}
                    </h4>
                    
                    <div className="space-y-2">
                        {(editingProduct.isCrate ? editingProduct.lootTable : editingProduct.contents)?.map((item, idx) => {
                            // Находим инфо о предмете
                            const info = gameItems.find(gi => gi.code === item.itemId);
                            return (
                                <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-4 animate-in slide-in-from-bottom-2">
                                    <img src={info?.icon_url} className="w-10 h-10 object-contain" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[10px] font-black text-white uppercase truncate">{info?.name || item.itemId}</div>
                                        <div className="text-[8px] text-ostrum-muted">{item.itemId}</div>
                                    </div>
                                    
                                    {/* Кол-во */}
                                    <div className="flex flex-col items-center">
                                        <span className="text-[7px] font-bold text-ostrum-muted uppercase">Кол-во</span>
                                        <input type="number" className="w-12 bg-black/40 border border-white/10 rounded text-center text-[10px] font-bold text-white p-1" value={item.quantity} onChange={e => updateItemField(idx, 'quantity', Number(e.target.value), editingProduct.isCrate || false)} />
                                    </div>

                                    {/* Шанс (Только для кейсов) */}
                                    {editingProduct.isCrate && (
                                        <div className="flex flex-col items-center">
                                            <span className="text-[7px] font-bold text-blue-400 uppercase">Шанс</span>
                                            <input type="number" className="w-12 bg-blue-900/20 border border-blue-500/20 rounded text-center text-[10px] font-bold text-blue-300 p-1" value={(item as any).chance} onChange={e => updateItemField(idx, 'chance', Number(e.target.value), true)} />
                                        </div>
                                    )}

                                    <button onClick={() => removeItemFromProduct(idx, editingProduct.isCrate || false)} className="p-2 text-ostrum-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><X size={14}/></button>
                                </div>
                            )
                        })}
                        {((editingProduct.isCrate ? editingProduct.lootTable : editingProduct.contents)?.length === 0) && (
                            <div className="text-center py-8 text-ostrum-muted text-xs uppercase font-bold opacity-30 border-2 border-dashed border-white/5 rounded-xl">
                                Список пуст. Выберите предметы сверху.
                            </div>
                        )}
                    </div>
                 </div>

              </div>
            </div>
          )}
        </>
      )}
      
      {/* Другие табы - заглушки */}
      {activeTab !== 'products' && (
        <div className="flex flex-col items-center justify-center py-20 text-ostrum-muted opacity-50">
           <Megaphone size={48} className="mb-4"/>
           <span className="uppercase font-black text-xs tracking-widest">Раздел в разработке</span>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;