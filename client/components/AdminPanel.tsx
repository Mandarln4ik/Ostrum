import React, { useState, useEffect } from 'react';
import { Product, ProductCategory, ServerInfo, PromoCode, PromoRewardType, User, Notification, CurrencyType } from '../types';
import { GameItem } from '../services/items.service';
import { ProductService } from '../services/product.service';
import { AdminService } from '../services/admin.service'; 
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

const AdminPanel: React.FC<AdminPanelProps> = ({ products, setProducts, servers, users: initialUsers, promos: initialPromos, setPromos, onUpdateUserBalance, onSendNotification, onSendGlobalNotification, gameItems }) => {
  const [activeTab, setActiveTab] = useState<'products' | 'promos' | 'users'>('products');
  
  // Локальные данные для табов (подгружаются с API)
  const [localPromos, setLocalPromos] = useState<PromoCode[]>(initialPromos);
  const [localUsers, setLocalUsers] = useState<User[]>(initialUsers);

  // UI стейты
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPromo, setIsEditingPromo] = useState(false);
  const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false); // Для выбора товара в промокоде
  const [isUserPickerOpen, setIsUserPickerOpen] = useState(false); // Для выбора юзера в промокоде
  
  // Поиск
  const [searchTerm, setSearchTerm] = useState(''); // Поиск предметов
  const [userSearchTerm, setUserSearchTerm] = useState(''); // Поиск юзеров

  // Данные форм
  const [globalNotifData, setGlobalNotifData] = useState({ title: '', message: '' });
  const [bonusInput, setBonusInput] = useState<{ [key: string]: { rub: string, event: string } }>({});

  // Редактируемый продукт
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({
    name: '', shortname: '', price: 0, currency: 'RUB', category: ProductCategory.RESOURCES, 
    contents: [], servers: [], isCrate: false, isFree: false, eventBonus: 0, 
    cooldownHours: 0, lootTable: [], image_url: '', discount: undefined
  });

  // Редактируемый промокод
  const [editingPromo, setEditingPromo] = useState<Partial<PromoCode>>({
    code: '', rewardType: 'RUB_BALANCE', rewardValue: 0, maxActivations: 100, currentActivations: 0, userId: undefined
  });

  // --- ЗАГРУЗКА ДАННЫХ ПРИ ПЕРЕКЛЮЧЕНИИ ВКЛАДОК ---
  useEffect(() => {
    if (activeTab === 'promos') {
      AdminService.getPromos().then(setLocalPromos).catch(console.error);
    }
    if (activeTab === 'users') {
      AdminService.getUsers().then(setLocalUsers).catch(console.error);
    }
  }, [activeTab]);

  // =================================================================================
  //                                  ТОВАРЫ (PRODUCTS)
  // =================================================================================

  const handleCreateNew = (isCrate: boolean) => {
    setEditingProduct({ 
      id: undefined,
      name: '', shortname: '', price: 0, currency: 'RUB', 
      category: isCrate ? ProductCategory.CRATES : ProductCategory.RESOURCES, 
      contents: [], servers: [], isCrate: isCrate, isFree: false, 
      eventBonus: 0, cooldownHours: 0, lootTable: [], 
      image_url: isCrate ? 'https://rustlabs.com/img/items180/box.wooden.large.png' : '', 
      discount: undefined 
    });
    setIsEditing(true);
  };

  const handleEditExisting = (product: Product) => {
    // Клонируем объект, чтобы редактирование не меняло список сразу
    setEditingProduct(JSON.parse(JSON.stringify(product))); 
    setIsEditing(true);
  };

  const handleSaveProduct = async () => {
    if (!editingProduct.name) return alert('Введите название товара!');
    if (!editingProduct.servers || editingProduct.servers.length === 0) return alert('Выберите хотя бы один сервер!');
    
    // Shortname нужен плагину Rust для выдачи. Если это кейс - не критично, если товар - обязательно.
    if (!editingProduct.shortname && !editingProduct.isCrate) {
        if (editingProduct.contents && editingProduct.contents.length > 0) {
            // Если shortname пустой, берем первый предмет
            editingProduct.shortname = editingProduct.contents[0].itemId;
        } else {
            return alert('Системное имя (Shortname) не заполнено! Добавьте предмет в содержимое.');
        }
    }

    try {
      const payload = {
        ...editingProduct,
        price: editingProduct.isFree ? 0 : Number(editingProduct.price),
        skin_id: Number(editingProduct.skin_id || 0),
        amount: Number(editingProduct.amount || 1),
        // Гарантируем массивы для JSON полей
        contents: editingProduct.contents || [],
        lootTable: editingProduct.lootTable || [],
        servers: editingProduct.servers || [],
        discount: editingProduct.discount || null
      };

      let saved: Product;

      if (editingProduct.id) {
        // ОБНОВЛЕНИЕ (PUT)
        saved = await ProductService.update(editingProduct.id, payload);
        // Обновляем стейт родителя
        setProducts(products.map(p => p.id === saved.id ? saved : p));
      } else {
        // СОЗДАНИЕ (POST)
        saved = await ProductService.create(payload);
        setProducts([...products, saved]);
      }

      setIsEditing(false);
    } catch (e) {
      console.error(e);
      alert('Ошибка при сохранении. Проверьте консоль и поля.');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Удалить этот товар из Базы Данных навсегда?')) return;
    try {
      await ProductService.delete(id);
      setProducts(products.filter(p => p.id !== id));
      if (isEditing && editingProduct.id === id) setIsEditing(false);
    } catch (e) {
      console.error(e);
      alert('Ошибка при удалении');
    }
  };

  // --- УПРАВЛЕНИЕ СОДЕРЖИМЫМ (ITEMS) ---

  const addItemToProduct = (item: GameItem) => {
    const updates: Partial<Product> = {};
    // Авто-заполнение пустых полей
    if (!editingProduct.name) updates.name = item.name;
    if (!editingProduct.image_url) updates.image_url = item.icon_url;
    if (!editingProduct.shortname) updates.shortname = item.code;

    setEditingProduct(prev => {
      const newState = { ...prev, ...updates };

      if (prev.isCrate) {
        // КЕЙС: Добавляем в lootTable с шансом
        const currentLoot = prev.lootTable || [];
        return {
          ...newState,
          lootTable: [...currentLoot, { itemId: item.code, quantity: 1, chance: 10 }]
        };
      } else {
        // ТОВАР: Добавляем в contents
        const currentContents = prev.contents || [];
        // Не дублируем одинаковые предметы в обычном товаре
        if (currentContents.find(c => c.itemId === item.code)) return newState;
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
      if (newLoot[index]) {
          newLoot[index] = { ...newLoot[index], [field]: value };
          setEditingProduct({ ...editingProduct, lootTable: newLoot });
      }
    } else {
      const newContents = [...(editingProduct.contents || [])];
      if (newContents[index]) {
          newContents[index] = { ...newContents[index], [field]: value };
          setEditingProduct({ ...editingProduct, contents: newContents });
      }
    }
  };

  const toggleServer = (sid: string) => {
    const current = editingProduct.servers || [];
    setEditingProduct({
      ...editingProduct,
      servers: current.includes(sid) ? current.filter(s => s !== sid) : [...current, sid]
    });
  };

  // =================================================================================
  //                                  ПРОМОКОДЫ (PROMOS)
  // =================================================================================

  const handleSavePromo = async () => {
    if (!editingPromo.code) return alert('Введите код');
    try {
       const payload = { 
           ...editingPromo, 
           rewardValue: Number(editingPromo.rewardValue),
           maxActivations: Number(editingPromo.maxActivations),
           userId: editingPromo.userId || null 
       };
       
       if (editingPromo.id) {
           await AdminService.updatePromo(editingPromo.id, payload);
       } else {
           await AdminService.createPromo(payload);
       }
       const updated = await AdminService.getPromos();
       setLocalPromos(updated);
       setIsEditingPromo(false);
    } catch(e) { 
        console.error(e);
        alert('Ошибка сохранения промокода'); 
    }
  };

  const handleDeletePromo = async (id: number | string) => {
      if(!confirm('Удалить промокод?')) return;
      await AdminService.deletePromo(id);
      setLocalPromos(localPromos.filter(p => p.id !== id));
  };

  const getSelectedRewardName = () => {
    if (editingPromo.rewardType === 'PRODUCT' || editingPromo.rewardType === 'FREE_CRATE') {
      const p = products.find(p => p.id === editingPromo.rewardValue);
      return p ? p.name : 'Товар не найден (ID: ' + editingPromo.rewardValue + ')';
    }
    return editingPromo.rewardValue;
  };

  // =================================================================================
  //                                  ИГРОКИ (USERS)
  // =================================================================================

  const handleBonusChange = (uid: string, type: 'rub' | 'event', val: string) => {
     setBonusInput(prev => ({ ...prev, [uid]: { ...prev[uid], [type]: val } }));
  };
  
  const applyBonus = async (uid: string, type: 'RUB' | 'EVENT') => {
      const val = parseFloat(type === 'RUB' ? bonusInput[uid]?.rub : bonusInput[uid]?.event);
      if (!val) return;
      try {
          await AdminService.updateUserBalance(uid, val, type);
          alert('Баланс обновлен!');
          const updated = await AdminService.getUsers();
          setLocalUsers(updated);
          setBonusInput(prev => ({ ...prev, [uid]: { ...prev[uid], [type.toLowerCase()]: '' } }));
      } catch(e) { alert('Ошибка обновления баланса'); }
  };

  const sendGlobalNotif = async () => {
      if(!globalNotifData.title) return;
      await AdminService.sendGlobalNotification(globalNotifData.title, globalNotifData.message);
      setIsGlobalModalOpen(false);
      alert('Отправлено всем!');
  };

  // =================================================================================
  //                                  RENDER
  // =================================================================================

  return (
    <div className="bg-ostrum-card rounded-[2.5rem] border border-white/5 p-8 shadow-2xl min-h-[85vh]">
      
      {/* TABS */}
      <div className="flex gap-2 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
        <button onClick={() => setActiveTab('products')} className={`px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-all ${activeTab === 'products' ? 'bg-ostrum-primary text-white' : 'text-ostrum-muted hover:text-white'}`}>Товары</button>
        <button onClick={() => setActiveTab('promos')} className={`px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-all ${activeTab === 'promos' ? 'bg-ostrum-primary text-white' : 'text-ostrum-muted hover:text-white'}`}>Промокоды</button>
        <button onClick={() => setActiveTab('users')} className={`px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-all ${activeTab === 'users' ? 'bg-ostrum-primary text-white' : 'text-ostrum-muted hover:text-white'}`}>Игроки</button>
      </div>

      {/* --------------------- ТАБ: ТОВАРЫ --------------------- */}
      {activeTab === 'products' && (
        <>
          {!isEditing ? (
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
                 
                 {/* БИБЛИОТЕКА ПРЕДМЕТОВ (Из БД) */}
                 <div className="bg-black/40 rounded-[2rem] p-6 border border-white/5 h-[320px] flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Библиотека (из БД)</h4>
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

                 {/* ВЫБРАННОЕ СОДЕРЖИМОЕ */}
                 <div className="bg-black/20 rounded-[2rem] p-6 border border-white/5 flex-1 min-h-[200px]">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-4">
                        {editingProduct.isCrate ? 'Таблица лута (Шансы)' : 'Содержимое набора'}
                    </h4>
                    
                    <div className="space-y-2">
                        {(editingProduct.isCrate ? editingProduct.lootTable : editingProduct.contents)?.map((item, idx) => {
                            const info = gameItems.find(gi => gi.code === item.itemId);
                            return (
                                <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-4 animate-in slide-in-from-bottom-2">
                                    <img src={info?.icon_url} className="w-10 h-10 object-contain" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[10px] font-black text-white uppercase truncate">{info?.name || item.itemId}</div>
                                        <div className="text-[8px] text-ostrum-muted">{item.itemId}</div>
                                    </div>
                                    
                                    <div className="flex flex-col items-center">
                                        <span className="text-[7px] font-bold text-ostrum-muted uppercase">Кол-во</span>
                                        <input type="number" className="w-12 bg-black/40 border border-white/10 rounded text-center text-[10px] font-bold text-white p-1" value={item.quantity} onChange={e => updateItemField(idx, 'quantity', Number(e.target.value), editingProduct.isCrate || false)} />
                                    </div>

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

      {/* --------------------- ТАБ: ПРОМОКОДЫ --------------------- */}
      {activeTab === 'promos' && (
        <div className="animate-in fade-in">
           {!isEditingPromo ? (
             <div className="space-y-6">
                <button onClick={()=>{setEditingPromo({code:'', rewardType:'RUB_BALANCE', rewardValue:0, maxActivations: 100, currentActivations: 0, userId: undefined}); setIsEditingPromo(true)}} className="bg-ostrum-primary text-white px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg">Создать Промокод</button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {localPromos.map(p => (
                      <div key={p.id} onClick={()=>{setEditingPromo(p); setIsEditingPromo(true)}} className="bg-black/20 p-5 rounded-2xl border border-white/5 cursor-pointer hover:border-ostrum-primary relative group">
                          <button onClick={(e)=>{e.stopPropagation(); handleDeletePromo(p.id)}} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash size={14}/></button>
                          <div className="text-xl font-black text-white uppercase">{p.code}</div>
                          <div className="text-[10px] text-ostrum-muted uppercase font-bold mt-2">
                              Тип: <span className="text-white">{p.rewardType}</span>
                          </div>
                          <div className="text-[10px] text-ostrum-muted uppercase font-bold">
                              Награда: <span className="text-ostrum-primary">{p.rewardValue}</span>
                          </div>
                          <div className="text-[10px] text-ostrum-muted uppercase font-bold mt-1">
                              Активации: <span className={p.currentActivations >= p.maxActivations ? 'text-red-500' : 'text-green-500'}>{p.currentActivations} / {p.maxActivations}</span>
                          </div>
                          {p.userId && <div className="text-[9px] text-blue-400 font-bold mt-1 uppercase">Личный (ID: {p.userId})</div>}
                      </div>
                   ))}
                </div>
             </div>
           ) : (
             <div className="bg-black/20 p-8 rounded-[2rem] max-w-lg mx-auto space-y-6 border border-white/5 shadow-2xl">
                 <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Настройка промокода</h3>
                 
                 <div>
                    <label className="text-[9px] font-bold text-ostrum-muted uppercase ml-2">Код</label>
                    <input className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold uppercase outline-none focus:border-ostrum-primary" value={editingPromo.code} onChange={e=>setEditingPromo({...editingPromo, code: e.target.value.toUpperCase()})} placeholder="CODE" />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[9px] font-bold text-ostrum-muted uppercase ml-2">Тип награды</label>
                        <select className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-xs font-bold outline-none cursor-pointer" value={editingPromo.rewardType} onChange={e=>setEditingPromo({...editingPromo, rewardType: e.target.value, rewardValue: 0})}>
                            <option value="RUB_BALANCE">Рубли (Баланс)</option>
                            <option value="EVENT_BALANCE">Снежинки</option>
                            <option value="TOPUP_BONUS">Бонус к пополнению (%)</option> {/* 👈 ВОССТАНОВЛЕНО */}
                            <option value="PRODUCT">Товар (ID)</option>
                            <option value="FREE_CRATE">Бесплатный Кейс (ID)</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[9px] font-bold text-ostrum-muted uppercase ml-2">Лимит активаций</label>
                        <input type="number" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold outline-none" value={editingPromo.maxActivations} onChange={e=>setEditingPromo({...editingPromo, maxActivations: Number(e.target.value)})} />
                    </div>
                 </div>
                 
                 <div>
                    <label className="text-[9px] font-bold text-ostrum-muted uppercase ml-2">Значение награды (Сумма / % / ID)</label>
                    {editingPromo.rewardType === 'PRODUCT' || editingPromo.rewardType === 'FREE_CRATE' ? (
                        <div>
                            <button onClick={()=>setIsPickerOpen(!isPickerOpen)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-left text-white font-bold text-xs uppercase hover:bg-white/5 transition-all">{getSelectedRewardName()}</button>
                            {isPickerOpen && (
                                <div className="mt-2 bg-black/80 border border-white/10 rounded-xl p-2 max-h-48 overflow-y-auto custom-scrollbar grid grid-cols-2 gap-2 absolute z-50 w-64 shadow-xl">
                                    {products.filter(p => editingPromo.rewardType === 'FREE_CRATE' ? p.isCrate : !p.isCrate).map(p => (
                                        <button key={p.id} onClick={()=>{setEditingPromo({...editingPromo, rewardValue: p.id}); setIsPickerOpen(false)}} className="p-2 text-[9px] font-bold text-white bg-white/5 rounded hover:bg-ostrum-primary truncate text-left">{p.name}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <input type="number" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold outline-none" value={editingPromo.rewardValue} onChange={e=>setEditingPromo({...editingPromo, rewardValue: Number(e.target.value)})} placeholder="0" />
                    )}
                 </div>

                 {/* 👇 ПРИВЯЗКА К ЮЗЕРУ */}
                 <div>
                    <label className="text-[9px] font-bold text-ostrum-muted uppercase ml-2">Привязать к игроку (ID) - Опционально</label>
                    <div className="flex gap-2">
                        <input type="text" className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold text-xs outline-none" value={editingPromo.userId || ''} onChange={e=>setEditingPromo({...editingPromo, userId: e.target.value})} placeholder="Оставьте пустым для всех" />
                        <button onClick={()=>setIsUserPickerOpen(true)} className="bg-white/5 border border-white/10 p-3 rounded-xl hover:bg-white/10"><UserIcon size={16} className="text-white"/></button>
                    </div>
                 </div>

                 <div className="flex gap-2 pt-4">
                     <button onClick={handleSavePromo} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg">Сохранить</button>
                     <button onClick={()=>setIsEditingPromo(false)} className="px-6 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold uppercase text-xs tracking-widest">Отмена</button>
                 </div>
             </div>
           )}
        </div>
      )}

      {/* Picker Modal для Юзеров */}
      {isUserPickerOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
           <div className="bg-ostrum-card border border-white/10 rounded-[2rem] p-6 w-full max-w-sm h-[60vh] flex flex-col shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-black uppercase">Выбрать игрока</h3>
                  <button onClick={()=>setIsUserPickerOpen(false)}><X className="text-ostrum-muted hover:text-white" size={20}/></button>
              </div>
              <input type="text" placeholder="Поиск..." className="bg-black/40 p-3 rounded-xl text-white text-xs font-bold mb-4 outline-none border border-white/5 focus:border-ostrum-primary" onChange={e=>setUserSearchTerm(e.target.value)} />
              <div className="overflow-y-auto flex-1 custom-scrollbar space-y-2">
                  <button onClick={()=>{setEditingPromo({...editingPromo, userId: undefined}); setIsUserPickerOpen(false)}} className="w-full p-3 bg-white/5 rounded-xl text-left text-[10px] font-bold text-white hover:bg-white/10">Для всех (Сбросить)</button>
                  {localUsers.filter(u => u.nickname.toLowerCase().includes(userSearchTerm.toLowerCase())).map(u => (
                      <button key={u.id} onClick={()=>{setEditingPromo({...editingPromo, userId: String(u.id)}); setIsUserPickerOpen(false)}} className="w-full p-3 bg-black/20 border border-white/5 rounded-xl flex items-center gap-3 hover:border-ostrum-primary transition-all">
                          <img src={u.avatar} className="w-6 h-6 rounded-md"/>
                          <div>
                              <div className="text-[10px] font-bold text-white uppercase">{u.nickname}</div>
                              <div className="text-[8px] text-ostrum-muted">ID: {u.id}</div>
                          </div>
                      </button>
                  ))}
              </div>
           </div>
        </div>
      )}

      {/* --------------------- ТАБ: ИГРОКИ --------------------- */}
      {activeTab === 'users' && (
         <div className="animate-in fade-in space-y-6">
            <div className="flex justify-between items-center">
               <h3 className="text-xl font-black text-white uppercase">Список игроков</h3>
               <button onClick={()=>setIsGlobalModalOpen(true)} className="bg-blue-600/20 text-blue-400 border border-blue-500/20 px-4 py-2 rounded-xl text-[10px] font-bold uppercase flex items-center gap-2"><Megaphone size={14}/> Всем</button>
            </div>
            
            <input type="text" placeholder="Поиск игрока..." className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold text-xs mb-4 outline-none focus:border-ostrum-primary" onChange={e => setUserSearchTerm(e.target.value)} />

            <div className="overflow-x-auto bg-black/20 rounded-2xl border border-white/5">
               <table className="w-full text-left text-sm">
                  <thead className="text-ostrum-muted border-b border-white/10 uppercase text-[9px]"><tr><th className="py-4 pl-6">Игрок</th><th className="py-4">Баланс</th><th className="py-4 text-right pr-6">Действия</th></tr></thead>
                  <tbody>
                     {localUsers.filter(u => u.nickname.toLowerCase().includes(userSearchTerm.toLowerCase()) || u.steamId.includes(userSearchTerm)).map(u => (
                        <tr key={u.id} className="hover:bg-white/5">
                           <td className="py-4 pl-6"><div className="flex items-center gap-3"><img src={u.avatar} className="w-8 h-8 rounded-lg"/><div className="flex flex-col"><span className="text-white text-[10px] font-bold uppercase">{u.nickname}</span><span className="text-[8px] text-ostrum-muted">{u.steamId}</span></div></div></td>
                           <td className="py-4 text-[10px] font-black text-white">{u.balance} ₽ <span className="text-blue-400 ml-2">{u.eventBalance.toFixed(1)} ❄</span></td>
                           <td className="py-4 text-right pr-6 flex justify-end gap-2">
                              <div className="flex bg-black/40 border border-white/5 rounded-lg p-1">
                                 <input className="w-12 bg-transparent text-[9px] text-white p-1 outline-none" placeholder="+RUB" value={bonusInput[u.id]?.rub||''} onChange={e=>handleBonusChange(u.id,'rub',e.target.value)} />
                                 <button onClick={()=>applyBonus(u.id,'RUB')} className="text-green-500 hover:text-white px-1"><Check size={12}/></button>
                              </div>
                              <button onClick={() => {
                                  const msg = prompt('Сообщение для игрока:');
                                  if(msg) AdminService.sendNotification(u.id, 'Сообщение от Администратора', msg).then(() => alert('Отправлено!'));
                              }} className="p-2 bg-white/5 text-ostrum-muted hover:text-white rounded-lg"><Send size={14}/></button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {/* MODAL GLOBAL NOTIF */}
      {isGlobalModalOpen && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4">
            <div className="bg-ostrum-card border border-white/10 p-8 rounded-[2rem] w-full max-w-md space-y-4 shadow-2xl">
               <h3 className="text-white font-black uppercase">Отправить всем</h3>
               <input className="w-full bg-black/40 p-3 rounded-xl text-white font-bold" placeholder="Заголовок" value={globalNotifData.title} onChange={e=>setGlobalNotifData({...globalNotifData, title:e.target.value})} />
               <textarea className="w-full bg-black/40 p-3 rounded-xl text-white font-bold h-24" placeholder="Текст..." value={globalNotifData.message} onChange={e=>setGlobalNotifData({...globalNotifData, message:e.target.value})} />
               <button onClick={sendGlobalNotif} className="w-full bg-ostrum-primary text-white py-3 rounded-xl font-black uppercase">Отправить</button>
               <button onClick={()=>setIsGlobalModalOpen(false)} className="w-full text-ostrum-muted py-2 text-xs uppercase font-bold">Закрыть</button>
            </div>
         </div>
      )}

    </div>
  );
};

export default AdminPanel;