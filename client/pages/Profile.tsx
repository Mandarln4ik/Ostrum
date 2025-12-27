import React, { useState } from 'react';
import { User, PendingItem, Transaction, ServerInfo } from '../types';
import { Package, Clock, ShoppingBag, Snowflake, Sparkles, Users, Link as LinkIcon, Gift, Copy, Check, Hash, Filter } from 'lucide-react';

interface ProfileProps {
  user: User;
  transactions: Transaction[];
  pendingItems: PendingItem[];
  servers: ServerInfo[];
  onSetReferrer: (code: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, transactions, pendingItems, servers, onSetReferrer }) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'history' | 'referrals'>('inventory');
  const [refInput, setRefInput] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Состояние для фильтра сервера в инвентаре
  const [selectedServerFilter, setSelectedServerFilter] = useState<string>('ALL');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleActivateReferrer = (e: React.FormEvent) => {
      e.preventDefault();
      const input = refInput.trim().toUpperCase();
      if (!input) return;
      
      if (input === user.referralCode.toUpperCase()) {
          alert('Вы не можете ввести свой собственный реферальный код!');
          return;
      }
      
      onSetReferrer(input);
      setRefInput('');
  };

  // Фильтрация предметов
  const filteredItems = pendingItems.filter(item => 
    selectedServerFilter === 'ALL' || item.serverId === selectedServerFilter
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="bg-ostrum-card rounded-[2.5rem] border border-white/5 p-10 flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-ostrum-primary/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
         <img src={user.avatar || 'https://via.placeholder.com/150'} alt={user.nickname} className="w-32 h-32 rounded-[2rem] shadow-2xl border-2 border-ostrum-primary relative z-10 object-cover" />
         <div className="text-center md:text-left flex-1 relative z-10">
             <h1 className="text-4xl font-black text-white mb-3 uppercase tracking-tighter leading-none">{user.nickname}</h1>
             <div className="text-ostrum-muted mb-6 text-[10px] font-bold uppercase tracking-[0.2em]">Steam ID: {user.steamId}</div>
             <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="inline-flex flex-col bg-black/30 px-6 py-4 rounded-2xl border border-white/5">
                    <span className="text-ostrum-muted text-[9px] font-bold uppercase tracking-widest mb-1">Ваш баланс:</span>
                    <span className="text-2xl font-black text-green-400 leading-none">{user.balance.toLocaleString()} ₽</span>
                </div>
                <div className="inline-flex flex-col bg-blue-500/10 px-6 py-4 rounded-2xl border border-blue-500/10">
                    <span className="text-ostrum-muted text-[9px] font-bold uppercase tracking-widest mb-1">Ивент (Снежинки):</span>
                    <span className="text-2xl font-black text-blue-400 flex items-center gap-2 leading-none">
                        {user.eventBalance.toFixed(1)} <Snowflake size={20} />
                    </span>
                </div>
             </div>
         </div>
      </div>

      {/* --- TABS --- */}
      <div className="flex gap-2 p-1.5 bg-ostrum-card border border-white/5 rounded-2xl w-fit mx-auto md:mx-0 shadow-xl overflow-x-auto max-w-full">
          <button 
             onClick={() => setActiveTab('inventory')}
             className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'inventory' ? 'bg-ostrum-primary text-white shadow-lg' : 'bg-transparent text-ostrum-muted hover:text-white'}`}
          >
              <Package size={16} /> Склад
          </button>
          <button 
             onClick={() => setActiveTab('referrals')}
             className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'referrals' ? 'bg-ostrum-primary text-white shadow-lg' : 'bg-transparent text-ostrum-muted hover:text-white'}`}
          >
              <Users size={16} /> Рефералы
          </button>
          <button 
             onClick={() => setActiveTab('history')}
             className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'history' ? 'bg-ostrum-primary text-white shadow-lg' : 'bg-transparent text-ostrum-muted hover:text-white'}`}
          >
              <Clock size={16} /> История
          </button>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="bg-ostrum-card rounded-[3rem] border border-white/5 p-10 min-h-[400px] shadow-2xl relative overflow-hidden">
          
          {/* TAB: INVENTORY */}
          {activeTab === 'inventory' && (
              <div className="animate-in fade-in duration-500">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                      <div className="flex items-center gap-3">
                        <Package className="text-ostrum-primary" size={24} />
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Предметы к выдаче</h2>
                      </div>
                      
                      {/* ФИЛЬТР ПО СЕРВЕРАМ */}
                      <div className="flex items-center gap-2 bg-black/30 p-1.5 rounded-xl border border-white/5">
                          <Filter size={14} className="ml-2 text-ostrum-muted"/>
                          <select 
                            value={selectedServerFilter}
                            onChange={(e) => setSelectedServerFilter(e.target.value)}
                            className="bg-transparent text-[10px] font-bold text-white uppercase outline-none p-2 cursor-pointer"
                          >
                              <option value="ALL" className="bg-[#1a1a20]">Все серверы</option>
                              {servers.map(s => (
                                  <option key={s.id} value={s.identifier} className="bg-[#1a1a20]">{s.name}</option>
                              ))}
                          </select>
                      </div>
                  </div>
                  
                  <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-[1.5rem] mb-10 flex items-center gap-6">
                      <div className="bg-blue-500/20 p-3 rounded-2xl text-blue-400 shrink-0">
                        <Sparkles size={24} />
                      </div>
                      <p className="text-[11px] font-bold text-blue-100/60 leading-relaxed uppercase tracking-wide">
                        Все купленные товары попадают сюда. Зайдите на выбранный сервер и пропишите команду <span className="text-white">/shop</span>.
                      </p>
                  </div>
                  
                  {filteredItems.length === 0 ? (
                      <div className="text-center py-24 text-ostrum-muted uppercase font-black tracking-[0.3em] opacity-10">
                          <ShoppingBag size={80} className="mx-auto mb-6" />
                          {pendingItems.length > 0 ? "На этом сервере пусто" : "Склад пуст"}
                      </div>
                  ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredItems.map(item => {
                              // Безопасный поиск сервера
                              const server = servers.find(s => s.identifier === item.serverId) || servers.find(s => String(s.id) === item.serverId);
                              const serverName = server ? server.name : 'Неизвестно';
                              return (
                                  <div key={item.id} className="bg-black/30 border border-white/5 p-6 rounded-3xl flex items-center gap-5 group hover:border-ostrum-primary/30 transition-all">
                                      <div className="bg-white/5 p-4 rounded-2xl group-hover:bg-ostrum-primary/10 transition-colors shrink-0">
                                        <img src={item.icon || 'https://via.placeholder.com/50'} alt={item.itemName} className="w-14 h-14 object-contain group-hover:scale-110 transition-transform" />
                                      </div>
                                      <div className="min-w-0">
                                          <div className="font-bold text-white uppercase text-[10px] mb-1 tracking-tight truncate max-w-full" title={item.itemName}>{item.itemName}</div>
                                          <div className="text-xl text-ostrum-primary font-black">x{item.quantity}</div>
                                          <div className="text-[9px] text-ostrum-muted mt-2 uppercase font-bold tracking-widest truncate">
                                              Мир: <span className="text-white">{serverName}</span>
                                          </div>
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  )}
              </div>
          )}

          {/* TAB: REFERRALS */}
          {activeTab === 'referrals' && (
              <div className="animate-in fade-in duration-500 space-y-10">
                  <div className="flex items-center gap-3 mb-8">
                    <Users className="text-ostrum-primary" size={24} />
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Реферальная система</h2>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="space-y-6">
                          <div className="bg-black/30 border border-white/5 p-8 rounded-[2rem] space-y-6">
                              <h3 className="text-xs font-black text-ostrum-muted uppercase tracking-[0.2em] mb-4">Ваш реферальный код</h3>
                              <div className="bg-ostrum-bg border border-white/10 rounded-2xl p-4 flex items-center justify-between group">
                                  <div className="flex items-center gap-3">
                                      <Hash size={18} className="text-ostrum-primary" />
                                      <span className="text-xl text-white font-black tracking-widest uppercase">{user.referralCode || 'LOADING'}</span>
                                  </div>
                                  <button onClick={copyToClipboard} className="bg-ostrum-primary/20 text-ostrum-primary p-2 rounded-xl hover:bg-ostrum-primary hover:text-white transition-all flex items-center gap-2 px-4">
                                      {copied ? <Check size={16} /> : <Copy size={16} />}
                                      <span className="text-[9px] font-black uppercase">Копировать</span>
                                  </button>
                              </div>
                              <div className="flex items-center gap-4 bg-ostrum-primary/5 p-4 rounded-2xl border border-ostrum-primary/10">
                                  <Gift className="text-ostrum-primary" size={20} />
                                  <p className="text-[10px] font-bold text-ostrum-muted uppercase tracking-tight">
                                      Дайте этот код другу. Вы будете получать <span className="text-white">5%</span> от суммы каждого его пополнения!
                                  </p>
                              </div>
                          </div>

                          <div className="bg-ostrum-primary/10 p-8 rounded-[2rem] border border-ostrum-primary/20 flex flex-col items-center text-center">
                               <div className="text-[10px] font-black text-ostrum-muted uppercase tracking-[0.2em] mb-2">Заработано с реферальной системы:</div>
                               <div className="text-4xl font-black text-white tracking-tighter italic">
                                   {user.totalReferralEarnings?.toFixed(2) || '0.00'} <span className="text-ostrum-primary">₽</span>
                               </div>
                          </div>
                      </div>

                      <div className="bg-ostrum-card/40 border border-white/10 p-8 rounded-[2rem] flex flex-col justify-center">
                          <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                              <Sparkles size={16} className="text-ostrum-primary" /> Активация пригласителя
                          </h3>
                          {user.referredById ? (
                              <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl text-center">
                                  <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">
                                      Вы уже указали пригласившего вас игрока!
                                  </p>
                              </div>
                          ) : (
                              <form onSubmit={handleActivateReferrer} className="space-y-4">
                                  <p className="text-[10px] text-ostrum-muted font-bold uppercase tracking-tight mb-4">
                                      Если вас пригласил друг, введите его код ниже:
                                  </p>
                                  <div className="flex gap-2">
                                      <input 
                                          type="text" 
                                          placeholder="ВВЕДИТЕ КОД ДРУГА..." 
                                          className="bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-xs font-black text-white focus:border-ostrum-primary outline-none uppercase tracking-widest flex-1"
                                          value={refInput}
                                          onChange={(e) => setRefInput(e.target.value)}
                                      />
                                      <button className="bg-ostrum-primary hover:bg-ostrum-secondary text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">Активировать</button>
                                  </div>
                              </form>
                          )}
                          <div className="mt-8 bg-black/20 p-4 rounded-2xl border border-white/5 flex gap-4">
                              <LinkIcon size={18} className="text-ostrum-muted shrink-0 mt-1" />
                              <p className="text-[9px] text-ostrum-muted leading-relaxed uppercase font-bold">
                                  Учитываются только пополнения реальными деньгами через ЮKassa. Бонусные рубли, подарки от администрации и снежинки не учитываются.
                              </p>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {/* TAB: HISTORY */}
          {activeTab === 'history' && (
              <div className="animate-in fade-in duration-500">
                  <div className="flex items-center gap-3 mb-8">
                    <Clock className="text-ostrum-primary" size={24} />
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">История транзакций</h2>
                  </div>
                  <div className="overflow-x-auto bg-black/20 rounded-[2rem] border border-white/5 shadow-inner">
                      <table className="w-full text-left text-sm border-collapse">
                          <thead className="text-ostrum-muted border-b border-white/10 uppercase text-[9px] font-bold tracking-[0.2em]">
                              <tr>
                                  <th className="py-6 pl-10">Дата</th>
                                  <th className="py-6">Товары</th>
                                  <th className="py-6">Сервер</th>
                                  <th className="py-6">Способ</th>
                                  <th className="py-6 text-right pr-10">Сумма</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                              {transactions.map(tx => {
                                   const server = servers.find(s => s.identifier === tx.serverId) || servers.find(s => String(s.id) === tx.serverId);
                                   return (
                                      <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                          <td className="py-6 pl-10">
                                              <div className="text-white font-bold text-xs">{new Date(tx.date).toLocaleDateString()}</div>
                                              <div className="text-[10px] text-ostrum-muted font-mono">{new Date(tx.date).toLocaleTimeString()}</div>
                                          </td>
                                          <td className="py-6">
                                              {tx.products.map((p, i) => (
                                                  <div key={i} className="text-ostrum-muted font-bold uppercase text-[10px]">{p.name} <span className="text-ostrum-primary">x{p.quantity}</span></div>
                                              ))}
                                          </td>
                                          <td className="py-6">
                                              <div className="text-[10px] text-ostrum-muted uppercase font-bold tracking-widest">{server ? server.name : 'Unknown'}</div>
                                          </td>
                                          <td className="py-6">
                                              <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase flex items-center gap-1.5 w-fit border ${
                                                  tx.currency === 'EVENT' ? 'bg-blue-900/20 text-blue-400 border-blue-500/20' : 'bg-ostrum-primary/10 text-ostrum-primary border-ostrum-primary/20'
                                              }`}>
                                                  {tx.currency === 'EVENT' ? <><Snowflake size={10} /> EVENT</> : 'BALANCE'}
                                              </span>
                                          </td>
                                          <td className={`py-6 text-right pr-10 font-black text-base ${tx.currency === 'EVENT' ? 'text-blue-400' : 'text-white'}`}>
                                              {tx.totalAmount} {tx.currency === 'RUB' ? '₽' : ''}
                                          </td>
                                      </tr>
                                   );
                              })}
                          </tbody>
                      </table>
                      {transactions.length === 0 && (
                          <div className="text-center py-24 text-ostrum-muted uppercase font-bold tracking-[0.2em] opacity-10">История пуста</div>
                      )}
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default Profile;