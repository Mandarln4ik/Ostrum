import React, { useState, useEffect } from 'react';
import { Product, User, ServerInfo } from '../types';
import { GAME_ITEMS } from '../services/mockData'; // Временно оставляем для картинок, пока не переделаем на API предметов
import { X, Server as ServerIcon, User as UserIcon, CreditCard, Wallet, AlertTriangle, Clock, Snowflake, Gift as GiftIcon, ArrowRight, Info } from 'lucide-react';

interface ProductModalProps {
  product: Product;
  user: User | null;
  servers: ServerInfo[];
  onClose: () => void;
  // Обрати внимание: теперь quantity обязателен
  onPurchase: (productId: string, serverId: string, quantity: number) => void; 
  onLoginRequest: () => void;
  onOpenTopUp: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, user, servers, onClose, onPurchase, onLoginRequest, onOpenTopUp }) => {
  
  // Фильтруем сервера, на которых доступен товар
  // product.servers - массив строк ['srv_1', 'srv_2']
  const availableServers = servers.filter(s => 
    product.servers && Array.isArray(product.servers) && product.servers.includes(s.identifier)
  );

  const [selectedServer, setSelectedServer] = useState<string>(availableServers[0]?.identifier || '');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Если серверов нет (баг данных), ставим первый попавшийся или пустую строку
  useEffect(() => {
      if (!selectedServer && availableServers.length > 0) {
          setSelectedServer(availableServers[0].identifier);
      }
  }, [availableServers, selectedServer]);

  const hasDiscount = product.discount && product.discount.percent > 0;
  const isDiscountActive = hasDiscount && (!product.discount!.endsAt || new Date(product.discount!.endsAt).getTime() > now);
  const currentPrice = isDiscountActive ? Math.floor(product.price * (1 - product.discount!.percent / 100)) : product.price;

  const canAfford = user && (product.currency === 'RUB' ? user.balance >= currentPrice : user.eventBalance >= currentPrice);

  let isOnCooldown = false;
  let cooldownRemainingText = '';
  if (product.isFree && user?.productCooldowns && user.productCooldowns[String(product.id)] && product.cooldownHours) {
      const nextClaim = new Date(user.productCooldowns[String(product.id)]).getTime() + product.cooldownHours * 60 * 60 * 1000;
      if (now < nextClaim) {
          isOnCooldown = true;
          const diff = nextClaim - now;
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          cooldownRemainingText = `${hours}ч ${minutes}м ${seconds}с`;
      }
  }

  const bonusAmount = product.eventBonus ? product.eventBonus.toFixed(1) : (currentPrice * 0.01).toFixed(1);

  const handleBuy = () => {
      if (!selectedServer) return alert('Пожалуйста, выберите сервер!');
      // Вызываем покупку с количеством 1
      onPurchase(String(product.id), selectedServer, 1);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className={`relative bg-ostrum-card border rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in fade-in zoom-in duration-300 ${product.currency === 'EVENT' ? 'border-blue-500/20' : 'border-white/10'}`}>
        <button onClick={onClose} className="absolute top-6 right-6 z-10 text-ostrum-muted hover:text-white bg-black/50 rounded-full p-2 transition-colors">
          <X size={24} />
        </button>

        {/* Left Side */}
        <div className="w-full md:w-5/12 bg-black/20 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 relative">
           <img 
             src={product.image_url} 
             alt={product.name} 
             className={`w-full h-48 md:h-64 object-contain mb-8 drop-shadow-2xl transition-transform hover:scale-105 duration-500 ${product.currency === 'EVENT' ? 'drop-shadow-[0_0_35px_rgba(96,165,250,0.3)]' : 'drop-shadow-[0_0_25px_rgba(139,92,246,0.2)]'}`}
           />
           
           <div className="w-full">
             <h4 className="text-ostrum-muted text-[10px] font-bold uppercase mb-4 tracking-widest ml-1">Содержимое:</h4>
             <div className="grid grid-cols-4 gap-2">
               {product.contents?.map((content, idx) => {
                  // Пытаемся найти предмет в моках, или используем заглушку
                  const item = GAME_ITEMS.find(i => i.id === content.itemId) || { icon: 'https://via.placeholder.com/50', name: content.itemId };
                  return (
                    <div key={idx} className="bg-black/40 rounded-xl p-3 flex flex-col items-center border border-white/5 hover:border-ostrum-primary/30 transition-colors group" title={item.name}>
                       <img src={item.icon} alt={item.name} className="w-8 h-8 object-contain mb-2 group-hover:scale-110 transition-transform" />
                       <span className="text-[10px] text-white font-bold">x{content.quantity}</span>
                    </div>
                  );
               })}
               {(!product.contents || product.contents.length === 0) && (
                   <div className="col-span-4 text-center text-ostrum-muted text-[10px] uppercase font-bold opacity-50">Пусто</div>
               )}
             </div>
           </div>
        </div>

        {/* Right Side */}
        <div className="flex-1 p-8 md:p-12 flex flex-col overflow-y-auto custom-scrollbar">
           <div className="flex-1">
             <div className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${product.currency === 'EVENT' ? 'text-blue-400' : 'text-ostrum-primary'}`}>{product.category}</div>
             <h2 className="text-4xl font-black text-white mb-6 leading-tight uppercase tracking-tight">{product.name}</h2>
             
             {product.currency === 'RUB' && !product.isFree && (
                 <div className="mb-8 bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl flex items-center gap-4">
                     <div className="bg-blue-500/10 p-2 rounded-lg text-blue-400">
                        <Snowflake size={20} />
                     </div>
                     <div className="text-[11px] font-medium text-blue-100/60 leading-relaxed uppercase tracking-wide">
                        Бонус: <span className="text-white font-bold">получите {bonusAmount} ❄</span> на ивентовый баланс после покупки!
                     </div>
                 </div>
             )}

             <div className="bg-black/20 rounded-2xl p-6 border border-white/5 mb-8 space-y-6">
                <div className="flex items-center justify-between">
                   <span className="text-ostrum-muted text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                     <UserIcon size={14} /> Покупатель
                   </span>
                   {user && (
                     <div className="flex items-center gap-2 bg-ostrum-primary/10 px-3 py-1.5 rounded-xl border border-ostrum-primary/10">
                        <img src={user.avatar} className="w-4 h-4 rounded-md" alt="" />
                        <span className="font-bold text-white text-xs uppercase">{user.nickname}</span>
                     </div>
                   )}
                </div>

                <div>
                  <label className="text-ostrum-muted text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-3 ml-1">
                    <ServerIcon size={14} /> Сервер
                  </label>
                  <select 
                    value={selectedServer}
                    onChange={(e) => setSelectedServer(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-ostrum-primary outline-none transition-all cursor-pointer appearance-none uppercase text-xs"
                  >
                    {availableServers.length > 0 ? availableServers.map(srv => (
                      <option key={srv.id} value={srv.identifier} className="bg-ostrum-card">{srv.name}</option>
                    )) : <option>Нет доступных серверов</option>}
                  </select>
                </div>
             </div>
           </div>

           {/* Purchase Area */}
           <div className="border-t border-white/5 pt-8">
             <div className="flex items-center justify-between mb-8">
               <div className="text-ostrum-muted text-[10px] font-bold uppercase tracking-widest">Стоимость</div>
               <div className="text-right">
                  {isDiscountActive && <div className="text-xs text-ostrum-muted line-through font-bold opacity-50 mb-1">{product.price} {product.currency === 'RUB' ? '₽' : ''}</div>}
                  <div className={`text-4xl font-black flex items-center gap-2 justify-end tracking-tight ${product.isFree ? 'text-green-400' : (product.currency === 'EVENT' ? 'text-blue-400' : 'text-white')}`}>
                    {product.isFree ? 'FREE' : currentPrice}
                    {!product.isFree && (product.currency === 'RUB' ? '₽' : <Snowflake size={30} />)}
                  </div>
               </div>
             </div>

             {!user ? (
               <button onClick={onLoginRequest} className="w-full bg-[#171a21] hover:bg-[#2a2e38] text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform active:scale-95 uppercase tracking-wide">
                 <img src="https://community.akamai.steamstatic.com/public/shared/images/signinthroughsteam/sits_01.png" alt="Steam" className="h-6" />
                 Войти через Steam
               </button>
             ) : (
               <div className="space-y-4">
                 {product.isFree ? (
                    isOnCooldown ? (
                        <button disabled className="w-full bg-white/5 text-ostrum-muted cursor-not-allowed py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 border border-white/5 uppercase tracking-wide">
                          <Clock size={20} />
                          Через {cooldownRemainingText}
                        </button>
                    ) : (
                        <button onClick={handleBuy} className="w-full bg-green-600 hover:bg-green-500 text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(34,197,94,0.2)] transition-all transform hover:-translate-y-1 active:scale-95 uppercase tracking-wide">
                          <GiftIcon size={24} /> Получить бонус
                        </button>
                    )
                 ) : product.currency === 'EVENT' ? (
                    <div className="space-y-4">
                        <button 
                            onClick={handleBuy}
                            disabled={!canAfford}
                            className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform uppercase tracking-wide ${canAfford ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_10px_30px_rgba(59,130,246,0.2)] hover:-translate-y-1 active:scale-95' : 'bg-gray-800 text-ostrum-muted cursor-not-allowed'}`}
                        >
                            <Snowflake size={24} />
                            {canAfford ? `Оплатить ${currentPrice} ❄` : 'Недостаточно снежинок'}
                        </button>
                        
                        {!canAfford && (
                            <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl flex items-start gap-3">
                                <Info size={16} className="text-blue-400 mt-0.5 shrink-0" />
                                <div className="text-[10px] font-bold text-blue-100/40 leading-relaxed uppercase tracking-wide">
                                    Как получить: Тратьте рубли в магазине — за каждые <span className="text-white">10 ₽</span> вы получите <span className="text-blue-400">0.1 ❄</span> автоматически.
                                </div>
                            </div>
                        )}
                    </div>
                 ) : (
                   <>
                    {canAfford ? (
                        <button 
                          onClick={handleBuy} 
                          className="w-full bg-ostrum-primary hover:bg-ostrum-secondary text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-[0_10px_40px_rgba(139,92,246,0.3)] transition-all transform hover:-translate-y-1 active:scale-95 uppercase tracking-wide"
                        >
                            <Wallet size={24} /> Оплатить с баланса
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10 flex flex-col items-center justify-center gap-1 text-center">
                                <div className="flex items-center gap-2 text-red-500 font-bold uppercase text-[10px] tracking-widest">
                                    <AlertTriangle size={14} /> Недостаточно средств
                                </div>
                                <div className="text-ostrum-muted text-[10px] font-bold uppercase">Вам не хватает {(currentPrice - user.balance).toLocaleString()} ₽</div>
                            </div>
                            <button 
                                onClick={onOpenTopUp}
                                className="w-full bg-white text-black hover:bg-gray-200 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:scale-95 uppercase tracking-wide"
                            >
                                <CreditCard size={24} /> Пополнить баланс <ArrowRight size={20} />
                            </button>
                        </div>
                    )}
                   </>
                 )}
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;