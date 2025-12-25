
import React, { useState } from 'react';
import { Product, ProductCategory, GameItem, Transaction, LootTableItem, ServerInfo, CurrencyType, PromoCode, PromoRewardType, User, Notification } from '../types';
import { GAME_ITEMS } from '../services/mockData';
import { Plus, Trash, Save, Clock, Package, Zap, Percent, Search, Info, Gift, DollarSign, Tag, Server, Check, Image as ImageIcon, Snowflake, ReceiptText, User as UserIcon, LayoutGrid, Ticket, X, ChevronRight, UserPlus, Users as UsersIcon, Send, Megaphone, Calendar } from 'lucide-react';

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
}

const AdminPanel: React.FC<AdminPanelProps> = ({ products, setProducts, servers, users, promos, setPromos, onUpdateUserBalance, onSendNotification, onSendGlobalNotification }) => {
  const [activeTab, setActiveTab] = useState<'products' | 'promos' | 'users'>('products');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPromo, setIsEditingPromo] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isUserPickerOpen, setIsUserPickerOpen] = useState(false);
  const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  
  const [globalNotifData, setGlobalNotifData] = useState({ title: '', message: '' });

  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({
    name: '', price: 0, currency: 'RUB', category: ProductCategory.RESOURCES, contents: [], serverIds: [], isCrate: false, isFree: false, eventBonus: 0, cooldownHours: 0, lootTable: [], image: 'https://picsum.photos/200/200',
    discount: undefined
  });

  const [editingPromo, setEditingPromo] = useState<Partial<PromoCode>>({
    code: '', rewardType: 'RUB_BALANCE', rewardValue: 0, maxActivations: 100, currentActivations: 0, userId: undefined
  });

  const [bonusInput, setBonusInput] = useState<{ [key: string]: { rub: string, event: string } }>({});

  const handleSaveProduct = () => {
    if (!editingProduct.name || editingProduct.name.trim() === '') return alert('Введите название товара!');
    if (!editingProduct.serverIds || editingProduct.serverIds.length === 0) return alert('Выберите хотя бы один сервер!');
    
    const newProduct: Product = { 
      ...editingProduct as Product, 
      id: editingProduct.id || Math.random().toString(36).substr(2, 9), 
      price: editingProduct.isFree ? 0 : (editingProduct.price || 0),
      contents: editingProduct.contents || [],
      lootTable: editingProduct.lootTable || [],
      image: editingProduct.image || 'https://picsum.photos/200/200'
    };

    if (editingProduct.id) setProducts(products.map(p => p.id === newProduct.id ? newProduct : p));
    else setProducts([...products, newProduct]);
    setIsEditing(false);
  };

  const handleSavePromo = () => {
      if (!editingPromo.code || editingPromo.code.trim() === '') return alert('Введите код!');
      const newPromo: PromoCode = { ...editingPromo as PromoCode, id: editingPromo.id || Math.random().toString(36).substr(2, 9), currentActivations: editingPromo.currentActivations || 0 };
      if (editingPromo.id) setPromos(promos.map(p => p.id === newPromo.id ? newPromo : p));
      else setPromos([...promos, newPromo]);
      setIsEditingPromo(false);
  };

  const handleBonusChange = (userId: string, type: 'rub' | 'event', value: string) => {
    setBonusInput(prev => ({ ...prev, [userId]: { ...prev[userId], [type]: value } }));
  };

  const applyBonus = (userId: string, type: 'RUB' | 'EVENT') => {
      const valStr = type === 'RUB' ? bonusInput[userId]?.rub : bonusInput[userId]?.event;
      const amount = parseFloat(valStr || '0');
      if (isNaN(amount) || amount <= 0) return alert('Введите корректное число');
      onUpdateUserBalance(userId, amount, type);
      setBonusInput(prev => ({ ...prev, [userId]: { ...prev[userId], [type.toLowerCase()]: '' } }));
  };

  const toggleServer = (serverId: string) => {
    const current = editingProduct.serverIds || [];
    setEditingProduct({ ...editingProduct, serverIds: current.includes(serverId) ? current.filter(id => id !== serverId) : [...current, serverId] });
  };

  const addItemToContents = (itemId: string) => {
    if (editingProduct.isCrate) {
      const current = editingProduct.lootTable || [];
      if (current.find(i => i.itemId === itemId)) return;
      setEditingProduct({ 
        ...editingProduct, 
        lootTable: [...current, { itemId, quantity: 1, chance: 10 }] 
      });
    } else {
      const current = editingProduct.contents || [];
      if (current.find(i => i.itemId === itemId)) return;
      setEditingProduct({ 
        ...editingProduct, 
        contents: [...current, { itemId, quantity: 1 }] 
      });
    }
  };

  const removeItem = (itemId: string) => {
    if (editingProduct.isCrate) {
      setEditingProduct({ ...editingProduct, lootTable: (editingProduct.lootTable || []).filter(i => i.itemId !== itemId) });
    } else {
      setEditingProduct({ ...editingProduct, contents: (editingProduct.contents || []).filter(i => i.itemId !== itemId) });
    }
  };

  const updateItemQuantity = (itemId: string, qty: number) => {
    if (editingProduct.isCrate) {
      setEditingProduct({ ...editingProduct, lootTable: (editingProduct.lootTable || []).map(i => i.itemId === itemId ? { ...i, quantity: qty } : i) });
    } else {
      setEditingProduct({ ...editingProduct, contents: (editingProduct.contents || []).map(i => i.itemId === itemId ? { ...i, quantity: qty } : i) });
    }
  };

  const updateItemChance = (itemId: string, chance: number) => {
    if (editingProduct.isCrate) {
      setEditingProduct({ ...editingProduct, lootTable: (editingProduct.lootTable || []).map(i => i.itemId === itemId ? { ...i, chance: chance } : i) });
    }
  };

  const filteredUsers = users.filter(u => u.nickname.toLowerCase().includes(userSearchTerm.toLowerCase()) || u.steamId.includes(userSearchTerm));

  const getSelectedRewardName = () => {
    if (editingPromo.rewardType === 'PRODUCT' || editingPromo.rewardType === 'FREE_CRATE') {
      const p = products.find(p => p.id === editingPromo.rewardValue);
      return p ? p.name : 'Ничего не выбрано';
    }
    return editingPromo.rewardValue;
  };

  const sendGlobalNotif = () => {
    if (!globalNotifData.title || !globalNotifData.message) return alert('Заполните все поля');
    onSendGlobalNotification({ title: globalNotifData.title, message: globalNotifData.message, type: 'info' });
    setIsGlobalModalOpen(false);
    setGlobalNotifData({ title: '', message: '' });
    alert('Уведомление отправлено всем!');
  };

  return (
    <div className="bg-ostrum-card rounded-[2.5rem] border border-white/5 p-8 shadow-2xl">
      {/* Global Notification Modal */}
      {isGlobalModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
           <div className="bg-ostrum-card border border-white/10 rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl relative animate-in zoom-in duration-300">
              <button onClick={() => setIsGlobalModalOpen(false)} className="absolute top-6 right-6 text-ostrum-muted hover:text-white"><X size={24} /></button>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3"><Megaphone className="text-ostrum-primary" /> Объявление всем</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-ostrum-muted uppercase mb-2 tracking-widest">Заголовок</label>
                  <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-ostrum-primary" value={globalNotifData.title} onChange={e => setGlobalNotifData({...globalNotifData, title: e.target.value})} placeholder="Напр: Обновление магазина..." />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-ostrum-muted uppercase mb-2 tracking-widest">Сообщение</label>
                  <textarea className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-ostrum-primary min-h-[120px]" value={globalNotifData.message} onChange={e => setGlobalNotifData({...globalNotifData, message: e.target.value})} placeholder="Введите текст объявления..." />
                </div>
                <button onClick={sendGlobalNotif} className="w-full bg-ostrum-primary hover:bg-ostrum-secondary text-white py-5 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl transition-all transform active:scale-95">Отправить всем</button>
              </div>
           </div>
        </div>
      )}

      {/* User Binding Picker */}
      {isUserPickerOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
           <div className="bg-ostrum-card border border-white/10 rounded-[3rem] p-8 w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
              <button onClick={() => setIsUserPickerOpen(false)} className="absolute top-6 right-6 text-ostrum-muted hover:text-white"><X size={24} /></button>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Привязать игрока</h3>
              <input type="text" placeholder="ПОИСК..." className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white mb-4 uppercase outline-none focus:border-ostrum-primary" onChange={e => setUserSearchTerm(e.target.value)} />
              <div className="space-y-2 overflow-y-auto flex-1 custom-scrollbar">
                <button onClick={() => { setEditingPromo({...editingPromo, userId: undefined}); setIsUserPickerOpen(false); }} className="w-full p-3 bg-white/5 rounded-xl text-ostrum-muted text-[10px] font-black uppercase hover:text-white">Для всех игроков</button>
                {users.map(u => (
                  <button key={u.id} onClick={() => { setEditingPromo({...editingPromo, userId: u.id}); setIsUserPickerOpen(false); }} className="w-full p-3 bg-black/40 border border-white/5 rounded-xl flex items-center gap-3 hover:border-ostrum-primary transition-all">
                    <img src={u.avatar} className="w-8 h-8 rounded-lg" alt="" /><div className="text-left"><div className="text-[10px] font-bold text-white uppercase">{u.nickname}</div><div className="text-[8px] text-ostrum-muted uppercase">ID: {u.id}</div></div>
                  </button>
                ))}
              </div>
           </div>
        </div>
      )}

      {isPickerOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
           <div className="bg-ostrum-card border border-white/10 rounded-[3rem] p-8 w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
              <button onClick={() => setIsPickerOpen(false)} className="absolute top-6 right-6 text-ostrum-muted hover:text-white"><X size={24} /></button>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-8">Выберите {editingPromo.rewardType === 'FREE_CRATE' ? 'Кейс' : 'Товар'}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto custom-scrollbar flex-1 pb-4">
                {products.filter(p => editingPromo.rewardType === 'FREE_CRATE' ? p.isCrate : !p.isCrate).map(p => (
                  <button key={p.id} onClick={() => { setEditingPromo({...editingPromo, rewardValue: p.id}); setIsPickerOpen(false); }} className={`bg-black/20 p-5 rounded-2xl border transition-all flex flex-col items-center gap-3 text-center ${editingPromo.rewardValue === p.id ? 'border-ostrum-primary bg-ostrum-primary/5' : 'border-white/5 hover:border-white/20'}`}>
                    <img src={p.image} className="w-16 h-16 object-contain" alt="" /><div className="text-[10px] font-bold text-white uppercase tracking-tight line-clamp-2">{p.name}</div>
                  </button>
                ))}
              </div>
           </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 mb-10 border-b border-white/10 pb-6 items-start md:items-center">
        <div className="flex flex-wrap gap-1.5 bg-black/40 p-1 rounded-2xl">
          <button onClick={() => setActiveTab('products')} className={`text-[11px] uppercase tracking-wide font-bold px-6 py-3 rounded-xl transition-all ${activeTab === 'products' ? 'bg-ostrum-primary text-white shadow-lg' : 'text-ostrum-muted hover:text-white'}`}>Магазин</button>
          <button onClick={() => setActiveTab('promos')} className={`text-[11px] uppercase tracking-wide font-bold px-6 py-3 rounded-xl transition-all ${activeTab === 'promos' ? 'bg-ostrum-primary text-white shadow-lg' : 'text-ostrum-muted hover:text-white'}`}>Промокоды</button>
          <button onClick={() => setActiveTab('users')} className={`text-[11px] uppercase tracking-wide font-bold px-6 py-3 rounded-xl transition-all ${activeTab === 'users' ? 'bg-ostrum-primary text-white shadow-lg' : 'text-ostrum-muted hover:text-white'}`}>Игроки</button>
        </div>
      </div>

      {activeTab === 'products' && (
        <div>
          {!isEditing ? (
            <div className="space-y-8">
                <div className="flex flex-wrap gap-4">
                    <button onClick={() => { setEditingProduct({ name: '', price: 0, currency: 'RUB', category: ProductCategory.RESOURCES, contents: [], serverIds: [], isCrate: false, isFree: false, eventBonus: 0, cooldownHours: 0, lootTable: [], image: 'https://picsum.photos/200/200', discount: undefined }); setIsEditing(true); }} className="flex items-center gap-3 bg-ostrum-primary hover:bg-ostrum-secondary text-white px-8 py-4 rounded-2xl font-bold uppercase text-xs tracking-widest shadow-xl"><Zap size={20} /> Товар</button>
                    <button onClick={() => { setEditingProduct({ name: '', price: 0, currency: 'RUB', category: ProductCategory.CRATES, contents: [], serverIds: [], isCrate: true, isFree: false, eventBonus: 0, cooldownHours: 0, lootTable: [], image: 'https://rustlabs.com/img/items180/box.wooden.large.png', discount: undefined }); setIsEditing(true); }} className="flex items-center gap-3 bg-ostrum-accent hover:bg-red-500 text-white px-8 py-4 rounded-2xl font-bold uppercase text-xs tracking-widest shadow-xl"><Package size={20} /> Кейс</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {products.map(p => (
                        <div key={p.id} onClick={() => { setEditingProduct(p); setIsEditing(true); }} className="bg-black/20 p-5 rounded-2xl border border-white/5 flex items-center gap-4 cursor-pointer hover:border-ostrum-primary transition-all group relative">
                            <button onClick={(e) => { e.stopPropagation(); if(confirm('Удалить?')) setProducts(products.filter(item => item.id !== p.id)); }} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100"><Trash size={14} /></button>
                            {p.discount && <div className="absolute bottom-2 left-2 bg-ostrum-accent text-white text-[8px] font-black px-1.5 py-0.5 rounded">-{p.discount.percent}%</div>}
                            <img src={p.image} className="w-14 h-14 object-contain" alt="" />
                            <div className="min-w-0">
                                <div className="font-bold text-white uppercase text-[10px] truncate">{p.name}</div>
                                {p.isFree ? (
                                    <div className="text-green-500 font-black text-[10px] uppercase tracking-tighter">FREE {p.cooldownHours ? `(${p.cooldownHours}ч)` : ''}</div>
                                ) : (
                                    <div className={`font-bold text-sm ${p.currency === 'EVENT' ? 'text-blue-400' : 'text-ostrum-primary'}`}>{p.price} {p.currency === 'RUB' ? '₽' : '❄'}</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-10 animate-in fade-in duration-500">
                <div className="w-full lg:w-1/3 space-y-6">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">
                        {editingProduct.id ? 'Редактирование' : 'Создание'}
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-ostrum-muted uppercase mb-2 ml-1 tracking-widest">Название</label>
                            <input type="text" placeholder="Название..." className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-ostrum-primary transition-all" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-ostrum-muted uppercase mb-2 ml-1 tracking-widest flex items-center gap-2"><ImageIcon size={12}/> Ссылка на изображение</label>
                            <input type="text" placeholder="https://..." className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-ostrum-primary transition-all" value={editingProduct.image} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} />
                            {editingProduct.image && (
                              <div className="mt-2 bg-black/20 p-2 rounded-xl border border-white/5 w-fit">
                                <img src={editingProduct.image} alt="Preview" className="w-16 h-16 object-contain" />
                              </div>
                            )}
                        </div>

                        <div className="bg-black/20 border border-white/5 rounded-2xl p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Бесплатный товар</span>
                                <button 
                                    onClick={() => setEditingProduct({...editingProduct, isFree: !editingProduct.isFree, price: 0, discount: undefined})}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${editingProduct.isFree ? 'bg-green-600' : 'bg-white/10'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editingProduct.isFree ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>

                            {editingProduct.isFree ? (
                                <div className="animate-in slide-in-from-top-2 duration-300">
                                    <label className="block text-[10px] font-black text-ostrum-muted uppercase mb-2 ml-1 tracking-widest">Кулдаун активации (в часах)</label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-ostrum-muted" size={16} />
                                        <input type="number" placeholder="Напр: 24" className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-bold outline-none" value={editingProduct.cooldownHours} onChange={e => setEditingProduct({...editingProduct, cooldownHours: Number(e.target.value)})} />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                                        <div>
                                            <label className="block text-[10px] font-black text-ostrum-muted uppercase mb-2 ml-1 tracking-widest">Валюта</label>
                                            <select className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-bold outline-none" value={editingProduct.currency} onChange={e => setEditingProduct({...editingProduct, currency: e.target.value as CurrencyType})}><option value="RUB">₽ (RUB)</option><option value="EVENT">❄ (EVENT)</option></select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-ostrum-muted uppercase mb-2 ml-1 tracking-widest">Цена</label>
                                            <input type="number" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-bold outline-none" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} />
                                        </div>
                                    </div>

                                    {/* Discount Section */}
                                    <div className="pt-4 border-t border-white/5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-ostrum-primary uppercase tracking-widest flex items-center gap-2"><Percent size={12}/> Настроить скидку</span>
                                            <button 
                                                onClick={() => setEditingProduct({...editingProduct, discount: editingProduct.discount ? undefined : { percent: 10, endsAt: null }})}
                                                className={`w-10 h-5 rounded-full relative transition-colors ${editingProduct.discount ? 'bg-ostrum-primary' : 'bg-white/10'}`}
                                            >
                                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${editingProduct.discount ? 'left-5.5' : 'left-0.5'}`}></div>
                                            </button>
                                        </div>
                                        {editingProduct.discount && (
                                            <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-300">
                                                <div>
                                                    <label className="block text-[9px] font-black text-ostrum-muted uppercase mb-1 ml-1">Скидка (%)</label>
                                                    <input type="number" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold outline-none" value={editingProduct.discount.percent} onChange={e => setEditingProduct({...editingProduct, discount: { ...editingProduct.discount!, percent: Number(e.target.value) }})} />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-black text-ostrum-muted uppercase mb-1 ml-1">Истекает (Опц.)</label>
                                                    <input type="datetime-local" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold outline-none text-[10px]" value={editingProduct.discount.endsAt || ''} onChange={e => setEditingProduct({...editingProduct, discount: { ...editingProduct.discount!, endsAt: e.target.value || null }})} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-ostrum-muted uppercase mb-2 ml-1 tracking-widest">Доступные серверы</label>
                            <div className="flex flex-wrap gap-2">
                                {servers.map(s => <button key={s.id} onClick={() => toggleServer(s.id)} className={`px-4 py-3 rounded-xl text-[10px] font-bold uppercase border transition-all ${editingProduct.serverIds?.includes(s.id) ? 'bg-ostrum-primary border-ostrum-primary text-white shadow-lg' : 'border-white/10 text-ostrum-muted hover:border-white/30'}`}>{s.name}</button>)}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 pt-6"><button onClick={handleSaveProduct} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-5 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl transition-all transform active:scale-95">Сохранить</button><button onClick={() => setIsEditing(false)} className="px-10 bg-ostrum-card border border-white/10 text-ostrum-muted hover:text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all">Отмена</button></div>
                </div>

                <div className="flex-1 flex flex-col gap-6">
                  {/* Item Picker (Swapped to top) */}
                  <div className="flex-1 space-y-6 bg-black/40 rounded-[2.5rem] p-8 h-[400px] flex flex-col shadow-inner border border-white/5">
                      <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-2 ml-1">Библиотека предметов:</h4>
                      <div className="relative mb-6">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ostrum-muted" size={18} />
                          <input type="text" placeholder="ПОИСК ПРЕДМЕТОВ..." className="w-full bg-black/60 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white uppercase outline-none focus:border-ostrum-primary transition-all" onChange={e => setSearchTerm(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-4 lg:grid-cols-6 gap-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
                          {GAME_ITEMS.filter(gi => gi.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                              <button key={item.id} onClick={() => addItemToContents(item.id)} className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-ostrum-primary transition-all aspect-square flex flex-col items-center justify-center gap-2 group"><img src={item.icon} className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" /><span className="text-[8px] font-bold text-ostrum-muted truncate w-full text-center group-hover:text-white">{item.name}</span></button>
                          ))}
                      </div>
                  </div>

                  {/* Selected Items List (Swapped to bottom) */}
                  <div className="bg-black/40 border border-white/5 rounded-[2.5rem] p-8 min-h-[250px] shadow-inner">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6">Выбранное содержимое:</h4>
                    <div className="space-y-3">
                      {(editingProduct.isCrate ? editingProduct.lootTable : editingProduct.contents)?.map((item, idx) => {
                        const gameItem = GAME_ITEMS.find(gi => gi.id === item.itemId);
                        return (
                          <div key={idx} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4 group">
                            <img src={gameItem?.icon} className="w-10 h-10 object-contain" />
                            <div className="flex-1">
                              <div className="text-[10px] font-black text-white uppercase truncate">{gameItem?.name}</div>
                              <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-[8px] font-bold text-ostrum-muted uppercase">Кол-во:</span>
                                  <input type="number" className="w-16 bg-black/40 border border-white/10 rounded-lg p-1 text-[10px] font-black text-white" value={item.quantity} onChange={e => updateItemQuantity(item.itemId, Number(e.target.value))} />
                                </div>
                                {editingProduct.isCrate && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[8px] font-bold text-ostrum-muted uppercase">Шанс:</span>
                                    <input type="number" className="w-16 bg-black/40 border border-white/10 rounded-lg p-1 text-[10px] font-black text-white" value={(item as any).chance} onChange={e => updateItemChance(item.itemId, Number(e.target.value))} />
                                  </div>
                                )}
                              </div>
                            </div>
                            <button onClick={() => removeItem(item.itemId)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"><Trash size={16} /></button>
                          </div>
                        );
                      })}
                      {(!editingProduct.isCrate && (!editingProduct.contents || editingProduct.contents.length === 0)) && (
                        <div className="text-center py-10 text-[9px] font-black text-ostrum-muted uppercase tracking-[0.2em] opacity-30">Ничего не добавлено</div>
                      )}
                      {(editingProduct.isCrate && (!editingProduct.lootTable || editingProduct.lootTable.length === 0)) && (
                        <div className="text-center py-10 text-[9px] font-black text-ostrum-muted uppercase tracking-[0.2em] opacity-30">Ничего не добавлено</div>
                      )}
                    </div>
                  </div>
                </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'promos' && (
          <div className="animate-in fade-in duration-500">
              {!isEditingPromo ? (
                  <div className="space-y-8">
                      <button onClick={() => { setEditingPromo({ code: '', rewardType: 'RUB_BALANCE', rewardValue: 0, maxActivations: 100, currentActivations: 0, userId: undefined }); setIsEditingPromo(true); }} className="flex items-center gap-3 bg-ostrum-primary hover:bg-ostrum-secondary text-white px-8 py-4 rounded-2xl font-bold uppercase text-xs tracking-widest shadow-xl"><Ticket size={20} /> Создать Промокод</button>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {promos.map(p => (
                              <div key={p.id} onClick={() => { setEditingPromo(p); setIsEditingPromo(true); }} className="bg-black/20 p-6 rounded-[2rem] border border-white/5 flex flex-col gap-4 cursor-pointer hover:border-ostrum-primary group relative">
                                  <button onClick={(e) => { e.stopPropagation(); if(confirm('Удалить?')) setPromos(promos.filter(item => item.id !== p.id)); }} className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100"><Trash size={16} /></button>
                                  <div className="text-2xl font-black text-white tracking-tighter uppercase">{p.code}</div>
                                  <div className="text-[9px] font-bold uppercase text-ostrum-muted tracking-widest">Награда: <span className="text-white">{p.rewardType} ({p.rewardValue})</span></div>
                                  {p.userId && <div className="text-[9px] font-bold uppercase text-ostrum-primary tracking-widest">Привязан к: <span className="text-white">{users.find(u => u.id === p.userId)?.nickname || p.userId}</span></div>}
                                  <div className="text-[9px] font-bold uppercase text-ostrum-muted tracking-widest">Активации: <span className="text-ostrum-primary">{p.currentActivations} / {p.maxActivations}</span></div>
                              </div>
                          ))}
                      </div>
                  </div>
              ) : (
                  <div className="max-w-2xl mx-auto bg-black/20 p-10 rounded-[3rem] border border-white/5 space-y-8 animate-in slide-in-from-bottom duration-500">
                      <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">Настройка Промокода</h3>
                      <div className="space-y-6">
                          <input type="text" className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-white text-lg font-black uppercase tracking-widest" value={editingPromo.code} onChange={e => setEditingPromo({...editingPromo, code: e.target.value.toUpperCase()})} placeholder="КОД..." />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <select className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-white text-xs font-black uppercase" value={editingPromo.rewardType} onChange={e => setEditingPromo({...editingPromo, rewardType: e.target.value as PromoRewardType, rewardValue: 0})}>
                                <option value="RUB_BALANCE">Рубли</option><option value="EVENT_BALANCE">Снежинки</option><option value="PRODUCT">Товар</option><option value="TOPUP_BONUS">Бонус пополнения (%)</option><option value="FREE_CRATE">Кейс</option>
                            </select>
                            {editingPromo.rewardType === 'PRODUCT' || editingPromo.rewardType === 'FREE_CRATE' ? (
                                <button onClick={() => setIsPickerOpen(true)} className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-left text-[10px] font-black text-white uppercase">{getSelectedRewardName()}</button>
                            ) : (
                                <input type="number" className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-white text-lg font-black" value={editingPromo.rewardValue} onChange={e => setEditingPromo({...editingPromo, rewardValue: Number(e.target.value)})} />
                            )}
                          </div>
                          <button onClick={() => setIsUserPickerOpen(true)} className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-left flex items-center justify-between group hover:border-ostrum-primary transition-all">
                              <div className="text-[10px] font-black text-white uppercase">{editingPromo.userId ? `Привязан к: ${users.find(u => u.id === editingPromo.userId)?.nickname}` : 'Для всех игроков (Глобальный)'}</div>
                              <UserIcon size={16} className="text-ostrum-muted group-hover:text-white" />
                          </button>
                      </div>
                      <div className="flex gap-4"><button onClick={handleSavePromo} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl">Сохранить</button><button onClick={() => setIsEditingPromo(false)} className="px-10 bg-ostrum-card border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Отмена</button></div>
                  </div>
              )}
          </div>
      )}

      {activeTab === 'users' && (
        <div className="animate-in fade-in duration-500">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3"><UsersIcon className="text-ostrum-primary" size={24} /> Список игроков</h3>
              <div className="flex gap-4 w-full md:w-auto">
                  <button onClick={() => setIsGlobalModalOpen(true)} className="flex items-center gap-2 bg-ostrum-primary/10 text-ostrum-primary hover:bg-ostrum-primary hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-ostrum-primary/20 transition-all"><Megaphone size={16}/> Объявление всем</button>
                  <div className="relative flex-1 md:w-80">
                      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ostrum-muted" />
                      <input type="text" placeholder="Поиск по нику или SteamID..." className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-[11px] font-bold text-white uppercase outline-none focus:border-ostrum-primary" onChange={e => setUserSearchTerm(e.target.value)} />
                  </div>
              </div>
           </div>
           <div className="overflow-x-auto bg-black/20 rounded-2xl border border-white/5">
              <table className="w-full text-left text-sm border-collapse">
                  <thead className="text-ostrum-muted border-b border-white/10 uppercase text-[9px] font-bold tracking-widest">
                      <tr><th className="py-5 pl-8">Игрок</th><th className="py-5">Баланс (RUB)</th><th className="py-5">Баланс (❄)</th><th className="py-5 text-right pr-8">Управление бонусами</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                      {filteredUsers.map(u => (
                          <tr key={u.id} className="hover:bg-white/5 transition-colors">
                              <td className="py-5 pl-8"><div className="flex items-center gap-3"><img src={u.avatar} className="w-8 h-8 rounded-lg" /><div className="flex flex-col"><span className="text-white font-bold uppercase text-[10px]">{u.nickname}</span><span className="text-[8px] text-ostrum-muted font-mono">{u.steamId}</span></div></div></td>
                              <td className="py-5"><span className="text-green-400 font-black">{u.balance} ₽</span></td>
                              <td className="py-5"><span className="text-blue-400 font-black">{u.eventBalance.toFixed(1)} ❄</span></td>
                              <td className="py-5 text-right pr-8">
                                  <div className="flex items-center justify-end gap-2">
                                      <div className="flex bg-black/40 border border-white/5 rounded-xl p-1 items-center">
                                          <input type="text" placeholder="+ RUB" className="w-16 bg-transparent text-[10px] font-black text-white p-1 outline-none uppercase placeholder:text-gray-700" value={bonusInput[u.id]?.rub || ''} onChange={e => handleBonusChange(u.id, 'rub', e.target.value)} />
                                          <button onClick={() => applyBonus(u.id, 'RUB')} className="bg-ostrum-primary/20 text-ostrum-primary hover:bg-ostrum-primary hover:text-white p-1 rounded transition-all"><Check size={12} /></button>
                                      </div>
                                      <div className="flex bg-black/40 border border-white/5 rounded-xl p-1 items-center">
                                          <input type="text" placeholder="+ ❄" className="w-16 bg-transparent text-[10px] font-black text-white p-1 outline-none uppercase placeholder:text-gray-700" value={bonusInput[u.id]?.event || ''} onChange={e => handleBonusChange(u.id, 'event', e.target.value)} />
                                          <button onClick={() => applyBonus(u.id, 'EVENT')} className="bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white p-1 rounded transition-all"><Check size={12} /></button>
                                      </div>
                                      <button onClick={() => {
                                          const msg = prompt('Введите сообщение для игрока:');
                                          if (msg) onSendNotification(u.id, { title: 'Сообщение от администрации', message: msg, type: 'info' });
                                      }} className="p-2 bg-white/5 text-ostrum-muted hover:text-white rounded-xl transition-all" title="Отправить уведомление"><Send size={14}/></button>
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
