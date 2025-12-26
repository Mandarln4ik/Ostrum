import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import AdminPanel from './components/AdminPanel';
import ServerStatus from './components/ServerStatus';
import ProductModal from './components/ProductModal';
import TopUpModal from './components/TopUpModal';
import Profile from './pages/Profile';
import CrateOpen from './pages/CrateOpen';
import Rules from './pages/Rules';
import LegalPage from './pages/Legal';
import { User, UserRole, Transaction, PendingItem, PromoCode, Notification, Product } from './types'; // Используем твои типы
import { MOCK_USER, SERVERS, MOCK_TRANSACTIONS, MOCK_PENDING_ITEMS, GAME_ITEMS } from './services/mockData'; // PRODUCTS убрали из импорта
import { CheckCircle2, X, AlertCircle, Ticket } from 'lucide-react';

// Подключаем наш сервис API
import { ProductService } from './services/product.service';

const ProtectedRoute: React.FC<{ user: User | null; children: React.ReactNode; adminOnly?: boolean }> = ({ user, children, adminOnly }) => {
  if (!user) return <Navigate to="/" replace />;
  if (adminOnly && user.role !== UserRole.ADMIN) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const PromoResultModal: React.FC<{ status: 'success' | 'error', message: string, onClose: () => void }> = ({ status, message, onClose }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
        <div className={`bg-ostrum-card border rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl text-center relative overflow-hidden animate-in zoom-in duration-300 ${status === 'success' ? 'border-green-500/20' : 'border-red-500/20'}`}>
            <button onClick={onClose} className="absolute top-6 right-6 text-ostrum-muted hover:text-white transition-colors">
                <X size={24} />
            </button>
            
            <div className="flex justify-center mb-6">
                <div className={`p-5 rounded-full shadow-xl border ${status === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/10' : 'bg-red-500/10 text-red-500 border-red-500/10'}`}>
                    {status === 'success' ? <Ticket size={48} /> : <AlertCircle size={48} />}
                </div>
            </div>
            
            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">
                {status === 'success' ? 'Успешно!' : 'Ошибка'}
            </h2>
            <p className="text-ostrum-muted text-xs font-bold uppercase tracking-wide leading-relaxed mb-8">{message}</p>
            
            <button 
                onClick={onClose}
                className={`w-full py-4 rounded-xl font-black text-lg uppercase tracking-widest transition-all transform active:scale-95 shadow-xl ${status === 'success' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'} text-white`}
            >
                Понятно
            </button>
        </div>
    </div>
);

const SuccessModal: React.FC<{ items: any[], onClose: () => void }> = ({ items, onClose }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-ostrum-card border border-green-500/20 rounded-[2rem] p-10 max-w-lg w-full shadow-[0_0_50px_rgba(34,197,94,0.15)] text-center relative overflow-hidden animate-in zoom-in duration-300">
            <button onClick={onClose} className="absolute top-6 right-6 text-ostrum-muted hover:text-white transition-colors">
                <X size={24} />
            </button>
            
            <div className="flex justify-center mb-6">
                <div className="bg-green-500/10 p-4 rounded-full text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)] border border-green-500/10">
                    <CheckCircle2 size={48} />
                </div>
            </div>
            
            <h2 className="text-3xl font-extrabold text-white mb-2 uppercase tracking-tight">Покупка завершена</h2>
            <p className="text-ostrum-muted text-sm mb-8 font-medium leading-relaxed">Ваши предметы успешно добавлены на склад в профиле. Заберите их на сервере командой <span className="text-white font-bold">/shop</span>.</p>
            
            <div className="bg-black/20 rounded-2xl p-6 border border-white/5 mb-8">
                <div className="text-[10px] font-bold text-ostrum-muted uppercase tracking-widest mb-4">Полученные предметы:</div>
                <div className="flex flex-wrap justify-center gap-3">
                    {items.map((item, idx) => (
                        <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col items-center min-w-[80px]">
                            <img src={item.icon} className="w-10 h-10 object-contain mb-1" alt="" />
                            <span className="text-[10px] text-green-400 font-bold">x{item.quantity}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            <button 
                onClick={onClose}
                className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-bold text-lg uppercase tracking-wide transition-all transform active:scale-95 shadow-xl"
            >
                Продолжить
            </button>
        </div>
    </div>
);

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([{ ...MOCK_USER, productCooldowns: {} }]); 
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [selectedServerId, setSelectedServerId] = useState<string>('srv_1');
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>(MOCK_PENDING_ITEMS);
  
  // --- ИЗМЕНЕНИЕ: Загрузка товаров из БД ---
  const [products, setProductsState] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchaseResults, setPurchaseResults] = useState<any[] | null>(null);
  const [promoResult, setPromoResult] = useState<{ status: 'success' | 'error', message: string } | null>(null);
  
  const [promos, setPromos] = useState<PromoCode[]>([
      { id: '1', code: 'OSTRUM_GIFT', rewardType: 'RUB_BALANCE', rewardValue: 100, maxActivations: 100, currentActivations: 0 },
      { id: '2', code: 'START_BONUS', rewardType: 'PRODUCT', rewardValue: 'p1', maxActivations: 50, currentActivations: 0 },
      { id: '3', code: 'LUCKY', rewardType: 'FREE_CRATE', rewardValue: 'p_event_1', maxActivations: 200, currentActivations: 0 },
      { id: '4', code: 'WIPE15', rewardType: 'TOPUP_BONUS', rewardValue: 15, maxActivations: 1000, currentActivations: 0 }
  ]);

  // Загружаем пользователя из LocalStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('ostrum_user');
    if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (!parsed.productCooldowns) parsed.productCooldowns = {};
        setUser(parsed);
        setAllUsers(prev => prev.map(u => u.id === parsed.id ? parsed : u));
    }
  }, []);

  // --- ИЗМЕНЕНИЕ: Загружаем товары с API при старте ---
  useEffect(() => {
    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            // Обращаемся к NestJS API
            // Внимание: Типы данных с бэкенда должны совпадать с Frontend типами.
            // Если в БД пока простая структура, часть полей (например lootTable) будет undefined.
            const data = await ProductService.getAll(); 
            
            // Приводим типы, если бэкенд возвращает немного другое (адаптер)
            // Пока считаем что данные совместимы (или бэкенд пустой и вернет [])
            setProductsState(data as unknown as Product[]); 
        } catch (error) {
            console.error("Ошибка при загрузке товаров с API:", error);
            // Можно добавить уведомление пользователю
        } finally {
            setIsLoading(false);
        }
    };

    fetchProducts();
  }, []);

  // --- Логика моковых юзеров (пока оставляем как есть, до шага 2) ---
  const handleLogin = () => {
    const newUser: User = { 
      ...MOCK_USER, 
      id: 'u' + Math.floor(Math.random() * 1000000), 
      freeCrates: [], 
      usedPromos: [], 
      notifications: [], 
      productCooldowns: {}, 
      referralCode: 'REF-' + Math.floor(Math.random() * 1000000),
      totalReferralEarnings: 0
    };
    setUser(newUser);
    if (!allUsers.find(u => u.id === newUser.id)) {
        setAllUsers([...allUsers, newUser]);
    }
    localStorage.setItem('ostrum_user', JSON.stringify(newUser));
  };

  const handleOpenTopUp = () => {
    setIsTopUpOpen(true);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ostrum_user');
  };

  const addNotificationToUser = (userId: string, notif: Omit<Notification, 'id' | 'date' | 'read'>) => {
      const fullNotif: Notification = {
          ...notif,
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toISOString(),
          read: false
      };

      setAllUsers(prev => prev.map(u => {
          if (u.id === userId) {
              const updated = { ...u, notifications: [fullNotif, ...u.notifications] };
              if (user?.id === userId) {
                  setUser(updated);
                  localStorage.setItem('ostrum_user', JSON.stringify(updated));
              }
              return updated;
          }
          return u;
      }));
  };

  const handleSendGlobalNotification = (notif: Omit<Notification, 'id' | 'date' | 'read'>) => {
    const fullNotif: Notification = {
        ...notif,
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        read: false
    };

    const updatedAll = allUsers.map(u => ({
        ...u,
        notifications: [fullNotif, ...u.notifications]
    }));
    
    setAllUsers(updatedAll);
    if (user) {
        const currentInAll = updatedAll.find(u => u.id === user.id);
        if (currentInAll) {
            setUser(currentInAll);
            localStorage.setItem('ostrum_user', JSON.stringify(currentInAll));
        }
    }
  };

  const handleAdminUpdateUserBalance = (userId: string, amount: number, type: 'RUB' | 'EVENT') => {
      setAllUsers(prev => prev.map(u => {
          if (u.id === userId) {
              const updated = { ...u };
              if (type === 'RUB') updated.balance += amount;
              else updated.eventBalance += amount;
              
              const giftNotif: Omit<Notification, 'id' | 'date' | 'read'> = {
                  title: 'Подарок от администрации',
                  message: `Вам начислено ${amount} ${type === 'RUB' ? '₽' : '❄'} на баланс!`,
                  type: 'gift'
              };
              updated.notifications = [{ id: Math.random().toString(36).substr(2, 9), ...giftNotif, date: new Date().toISOString(), read: false }, ...updated.notifications];

              if (user?.id === userId) {
                  setUser(updated);
                  localStorage.setItem('ostrum_user', JSON.stringify(updated));
              }
              return updated;
          }
          return u;
      }));
  };

  // --- ВАЖНО: Логика пополнения пока локальная (изменим на ЮKassa в шаге 3) ---
  const handleTopUp = (amount: number, bonusPercent: number = 0, appliedPromoCode?: string) => {
    if (user) {
      const effectiveBonus = bonusPercent + (user.activeTopupBonus || 0);
      const bonusAmount = (amount * effectiveBonus) / 100;
      const totalToCredit = amount + bonusAmount;
      
      let updatedUser = { ...user, balance: user.balance + totalToCredit, activeTopupBonus: 0 };
      
      if (appliedPromoCode) {
          const promo = promos.find(p => p.code === appliedPromoCode.toUpperCase());
          if (promo) {
              setPromos(prev => prev.map(p => p.id === promo.id ? { ...p, currentActivations: p.currentActivations + 1 } : p));
              updatedUser.usedPromos = [...updatedUser.usedPromos, promo.code];
          }
      }

      if (user.referredById) {
          const referrerId = user.referredById;
          const referralCommission = amount * 0.05; 
          
          setAllUsers(prev => prev.map(u => {
              if (u.id === referrerId) {
                  const giftNotif: Omit<Notification, 'id' | 'date' | 'read'> = {
                      title: 'Реферальное начисление',
                      message: `Вы получили ${referralCommission.toFixed(2)} ₽ за пополнение вашего реферала ${user.nickname}!`,
                      type: 'gift'
                  };
                  const updatedReferrer = { 
                      ...u, 
                      balance: u.balance + referralCommission, 
                      totalReferralEarnings: u.totalReferralEarnings + referralCommission,
                      notifications: [{ id: Math.random().toString(36).substr(2, 9), ...giftNotif, date: new Date().toISOString(), read: false }, ...u.notifications]
                  };
                  return updatedReferrer;
              }
              return u;
          }));
      }

      setUser(updatedUser);
      setAllUsers(allUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
      localStorage.setItem('ostrum_user', JSON.stringify(updatedUser));
      setPromoResult({ status: 'success', message: `Баланс пополнен на ${totalToCredit} ₽! Бонус: ${bonusAmount} ₽` });
      setIsTopUpOpen(false);
    }
  };

  const handleSetReferrer = (referralCode: string) => {
      if (!user) return;
      if (user.referredById) return; 

      const referrer = allUsers.find(u => u.referralCode === referralCode);
      if (!referrer) {
          setPromoResult({ status: 'error', message: 'Реферальный код не найден!' });
          return;
      }
      if (referrer.id === user.id) {
          setPromoResult({ status: 'error', message: 'Нельзя пригласить самого себя!' });
          return;
      }

      const updatedUser = { ...user, referredById: referrer.id };
      setUser(updatedUser);
      setAllUsers(allUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
      localStorage.setItem('ostrum_user', JSON.stringify(updatedUser));
      setPromoResult({ status: 'success', message: 'Реферальный код успешно активирован!' });
  };

  const handleRedeemPromo = (code: string) => {
      if (!user) {
          handleLogin();
          return;
      }

      const cleanCode = code.trim().toUpperCase();
      const promo = promos.find(p => p.code === cleanCode);

      if (!promo) {
          setPromoResult({ status: 'error', message: "Указанный промокод не существует!" });
          return;
      }

      if (promo.userId && promo.userId !== user.id) {
          setPromoResult({ status: 'error', message: "Этот промокод предназначен для другого игрока!" });
          return;
      }

      if (promo.rewardType === 'TOPUP_BONUS') {
          setPromoResult({ 
              status: 'error', 
              message: "Данный промокод активируется только в окне пополнения баланса!" 
          });
          return;
      }

      if (user.usedPromos.includes(cleanCode)) {
          setPromoResult({ status: 'error', message: "Вы уже использовали данный промокод!" });
          return;
      }

      if (promo.currentActivations >= promo.maxActivations) {
          setPromoResult({ status: 'error', message: "Лимит активаций этого промокода исчерпан!" });
          return;
      }

      let updatedUser = { ...user };
      let message = "";

      switch (promo.rewardType) {
          case 'RUB_BALANCE':
              updatedUser.balance += Number(promo.rewardValue);
              message = `Вы получили ${promo.rewardValue} ₽ на свой баланс!`;
              break;
          case 'EVENT_BALANCE':
              updatedUser.eventBalance += Number(promo.rewardValue);
              message = `Вы получили ${promo.rewardValue} ❄ на ивент-баланс!`;
              break;
          case 'PRODUCT':
              const prod = products.find(p => p.id === promo.rewardValue);
              if (prod) {
                  // !Внимание: prod.contents может не быть в БД, если мы не добавили связь. Нужно будет доработать БД.
                  const newPending: PendingItem[] = (prod.contents || []).map(c => {
                      const gi = GAME_ITEMS.find(g => g.id === c.itemId);
                      return {
                          id: Math.random().toString(36).substr(2, 9),
                          itemName: gi?.name || '?',
                          quantity: c.quantity,
                          icon: gi?.icon || '',
                          serverId: selectedServerId,
                          purchaseDate: new Date().toISOString(),
                          status: 'PENDING'
                      };
                  });
                  setPendingItems([...newPending, ...pendingItems]);
                  message = `Товар "${prod.name}" успешно добавлен на ваш склад!`;
              }
              break;
          case 'FREE_CRATE':
              const crate = products.find(p => p.id === promo.rewardValue);
              if (crate) {
                  updatedUser.freeCrates = [...(updatedUser.freeCrates || []), crate.id];
                  message = `Бесплатное открытие кейса "${crate.name}" доступно!`;
              }
              break;
      }

      updatedUser.usedPromos.push(cleanCode);
      setPromos(promos.map(p => p.id === promo.id ? { ...p, currentActivations: p.currentActivations + 1 } : p));
      setUser(updatedUser);
      setAllUsers(allUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
      localStorage.setItem('ostrum_user', JSON.stringify(updatedUser));

      setPromoResult({ status: 'success', message });
  };

  // --- ВАЖНО: Логика покупки пока на клиенте. В будущем перенесем в API ---
  const handlePurchase = (productId: string, serverId: string, quantity: number = 1) => {
    const product = products.find(p => p.id === productId); // Ищем в загруженном из БД списке
    if (!product || !user) return null;

    const isActuallyFree = user.freeCrates?.includes(product.id) && quantity === 1;
    const totalPrice = isActuallyFree || product.isFree ? 0 : product.price * quantity;
    
    if (!isActuallyFree && !product.isFree) {
        if (product.currency === 'RUB' && user.balance < totalPrice) {
            handleOpenTopUp();
            return null;
        } else if (product.currency === 'EVENT' && user.eventBalance < totalPrice) {
            return null;
        }
    }

    let winningItems: any[] = [];
    // Если продукт из БД не содержит lootTable, этот код может упасть. 
    // Убедись, что в БД заполнена эта инфа, или пока не используй кейсы из БД.
    if (product.isCrate && product.lootTable) {
        for (let i = 0; i < quantity; i++) {
            const rand = Math.random() * 100;
            let cumulative = 0;
            let won = product.lootTable[0];
            for (const item of product.lootTable) {
                cumulative += item.chance;
                if (rand <= cumulative) { won = item; break; }
            }
            const gi = GAME_ITEMS.find(g => g.id === won.itemId);
            winningItems.push({ itemId: won.itemId, name: gi?.name || '?', icon: gi?.icon || '', quantity: won.quantity });
        }
    } else if (product.contents) {
        winningItems = product.contents.map(c => {
            const gi = GAME_ITEMS.find(g => g.id === c.itemId);
            return { itemId: c.itemId, name: gi?.name || '?', icon: gi?.icon || '', quantity: c.quantity };
        });
    }

    let updatedUser = { ...user };
    if (!isActuallyFree && !product.isFree) {
        if (product.currency === 'RUB') {
            updatedUser.balance -= totalPrice;
            updatedUser.eventBalance += product.eventBonus ? product.eventBonus * quantity : totalPrice * 0.01;
        } else {
            updatedUser.eventBalance -= totalPrice;
        }
    }
    if (isActuallyFree) updatedUser.freeCrates = updatedUser.freeCrates.filter(id => id !== product.id);
    
    if (product.isFree) {
        updatedUser.productCooldowns[product.id] = new Date().toISOString();
    }

    setUser(updatedUser);
    setAllUsers(allUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    localStorage.setItem('ostrum_user', JSON.stringify(updatedUser));

    setPendingItems([...winningItems.map(wi => ({
        id: Math.random().toString(36).substr(2, 9),
        itemName: wi.name, quantity: wi.quantity, icon: wi.icon,
        serverId, purchaseDate: new Date().toISOString(), status: 'PENDING' as const
    })), ...pendingItems]);

    if (!product.isCrate) {
        setPurchaseResults(winningItems);
        setSelectedProduct(null);
    }
    return { items: winningItems };
  };

  const markNotificationRead = (id: string) => {
      if (!user) return;
      const updated = { ...user, notifications: user.notifications.map(n => n.id === id ? { ...n, read: true } : n) };
      setUser(updated);
      setAllUsers(allUsers.map(u => u.id === updated.id ? updated : u));
      localStorage.setItem('ostrum_user', JSON.stringify(updated));
  };

  // Если товары еще грузятся - можно показать лоадер, но Layout обычно нужен для отрисовки хедера
  // Поэтому просто передаем пустой массив или спиннер внутри Home
  
  return (
    <Router>
      <Layout 
        user={user} 
        onLogin={handleLogin} 
        onLogout={handleLogout}
        onOpenTopUp={handleOpenTopUp}
        onRedeemPromo={handleRedeemPromo}
        onMarkRead={markNotificationRead}
      >
        <Routes>
          <Route path="/" element={
              isLoading ? 
              <div className="flex items-center justify-center min-h-[50vh] text-ostrum-muted">Загрузка магазина...</div> : 
              <Home products={products} servers={SERVERS} onProductClick={setSelectedProduct} selectedServerId={selectedServerId} onServerChange={setSelectedServerId} />
          } />
          <Route path="/crate/:id" element={<CrateOpen products={products} user={user} selectedServerId={selectedServerId} onPurchase={handlePurchase} onLoginRequest={handleLogin} onOpenTopUp={handleOpenTopUp} />} />
          <Route path="/servers" element={<div className="grid grid-cols-1 md:grid-cols-2 gap-6">{SERVERS.map(srv => <ServerStatus key={srv.id} server={srv} />)}</div>} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/terms" element={<LegalPage type="terms" />} />
          <Route path="/privacy" element={<LegalPage type="privacy" />} />
          <Route path="/offer" element={<LegalPage type="offer" />} />
          <Route path="/profile" element={<ProtectedRoute user={user}><Profile user={user!} transactions={transactions.filter(t => t.userId === user?.id)} pendingItems={pendingItems} servers={SERVERS} onSetReferrer={handleSetReferrer} /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute user={user} adminOnly><AdminPanel products={products} setProducts={setProductsState} servers={SERVERS} users={allUsers} promos={promos} setPromos={setPromos} onUpdateUserBalance={handleAdminUpdateUserBalance} onSendNotification={addNotificationToUser} onSendGlobalNotification={handleSendGlobalNotification} /></ProtectedRoute>} />
        </Routes>
        {selectedProduct && <ProductModal product={selectedProduct} user={user} servers={SERVERS} onClose={() => setSelectedProduct(null)} onPurchase={(pid, sid) => handlePurchase(pid, sid)} onLoginRequest={handleLogin} onOpenTopUp={handleOpenTopUp} />}
        {isTopUpOpen && <TopUpModal user={user} promos={promos} onClose={() => setIsTopUpOpen(false)} onTopUp={handleTopUp} />}
        {purchaseResults && <SuccessModal items={purchaseResults} onClose={() => setPurchaseResults(null)} />}
        {promoResult && <PromoResultModal status={promoResult.status} message={promoResult.message} onClose={() => setPromoResult(null)} />}
      </Layout>
    </Router>
  );
};

export default App;