import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode"; 

// Компоненты
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

// Типы и Сервисы
import { User, UserRole, Transaction, PendingItem, PromoCode, Product } from './types';
import { ProductService } from './services/product.service';
import { ServersService, Server } from './services/servers.service';
import { ItemsService, GameItem } from './services/items.service';
import { AuthService } from './services/auth.service';
import api from './api/axios'; 

// Иконки и UI
import { CheckCircle2, X, AlertCircle, Ticket } from 'lucide-react';

// --- ЗАЩИТА РОУТОВ ---
const ProtectedRoute: React.FC<{ user: User | null; children: React.ReactNode; adminOnly?: boolean }> = ({ user, children, adminOnly }) => {
  if (!user) return <Navigate to="/" replace />;
  if (adminOnly && user.role !== UserRole.ADMIN) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// --- МОДАЛКИ (Вставлены сюда, чтобы не плодить файлы для простых уведомлений) ---
const PromoResultModal: React.FC<{ status: 'success' | 'error', message: string, onClose: () => void }> = ({ status, message, onClose }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
        <div className={`bg-ostrum-card border rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl text-center relative overflow-hidden animate-in zoom-in duration-300 ${status === 'success' ? 'border-green-500/20' : 'border-red-500/20'}`}>
            <button onClick={onClose} className="absolute top-6 right-6 text-ostrum-muted hover:text-white transition-colors"><X size={24} /></button>
            <div className="flex justify-center mb-6">
                <div className={`p-5 rounded-full shadow-xl border ${status === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/10' : 'bg-red-500/10 text-red-500 border-red-500/10'}`}>
                    {status === 'success' ? <Ticket size={48} /> : <AlertCircle size={48} />}
                </div>
            </div>
            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">{status === 'success' ? 'Успешно!' : 'Ошибка'}</h2>
            <p className="text-ostrum-muted text-xs font-bold uppercase tracking-wide leading-relaxed mb-8">{message}</p>
            <button onClick={onClose} className={`w-full py-4 rounded-xl font-black text-lg uppercase tracking-widest transition-all transform active:scale-95 shadow-xl ${status === 'success' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'} text-white`}>Понятно</button>
        </div>
    </div>
);

const SuccessModal: React.FC<{ items: any[], onClose: () => void }> = ({ items, onClose }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-ostrum-card border border-green-500/20 rounded-[2rem] p-10 max-w-lg w-full shadow-[0_0_50px_rgba(34,197,94,0.15)] text-center relative overflow-hidden animate-in zoom-in duration-300">
            <button onClick={onClose} className="absolute top-6 right-6 text-ostrum-muted hover:text-white transition-colors"><X size={24} /></button>
            <div className="flex justify-center mb-6"><div className="bg-green-500/10 p-4 rounded-full text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)] border border-green-500/10"><CheckCircle2 size={48} /></div></div>
            <h2 className="text-3xl font-extrabold text-white mb-2 uppercase tracking-tight">Покупка завершена</h2>
            <p className="text-ostrum-muted text-sm mb-8 font-medium leading-relaxed">Ваши предметы успешно добавлены на склад в профиле. Заберите их на сервере командой <span className="text-white font-bold">/shop</span>.</p>
            <div className="bg-black/20 rounded-2xl p-6 border border-white/5 mb-8">
                <div className="text-[10px] font-bold text-ostrum-muted uppercase tracking-widest mb-4">Полученные предметы:</div>
                <div className="flex flex-wrap justify-center gap-3">
                    {items.map((item, idx) => (
                        <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col items-center min-w-[80px]">
                            <img src={item.icon || 'https://via.placeholder.com/50'} className="w-10 h-10 object-contain mb-1" alt="" />
                            <span className="text-[10px] text-green-400 font-bold">x{item.quantity}</span>
                        </div>
                    ))}
                </div>
            </div>
            <button onClick={onClose} className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-bold text-lg uppercase tracking-wide transition-all transform active:scale-95 shadow-xl">Продолжить</button>
        </div>
    </div>
);

// --- ГЛАВНЫЙ КОМПОНЕНТ APP ---

const App = () => {
  // === СТЕЙТЫ ДАННЫХ ===
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]); 
  const [servers, setServers] = useState<Server[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [gameItems, setGameItems] = useState<GameItem[]>([]);
  
  // Данные юзера (инициализируем пустыми массивами, чтобы не было крашей)
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  
  // === UI СТЕЙТЫ ===
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [selectedServerId, setSelectedServerId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [purchaseResults, setPurchaseResults] = useState<any[] | null>(null);
  const [promoResult, setPromoResult] = useState<{ status: 'success' | 'error', message: string } | null>(null);
  const [promos, setPromos] = useState<PromoCode[]>([]); // Для отображения в админке или UI

  // ==================== 1. ЗАГРУЗКА ДАННЫХ ====================
  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);

        // 1. Загрузка глобальных данных
        const [serversData, productsData, itemsData] = await Promise.all([
            ServersService.getAll().catch(() => []),
            ProductService.getAll().catch(() => []),
            ItemsService.getAll().catch(() => [])
        ]);

        setServers(serversData || []);
        setProducts(productsData || []);
        setGameItems(itemsData || []);

        // Выбор сервера по умолчанию
        if (serversData && serversData.length > 0) {
            setSelectedServerId(serversData[0].identifier);
        }

        // 2. Обработка возврата со Steam (token в URL)
        const params = new URLSearchParams(window.location.search);
        const tokenFromUrl = params.get('token');

        if (tokenFromUrl) {
            localStorage.setItem('token', tokenFromUrl);
            window.history.replaceState({}, document.title, "/");
        }

        // 3. Авторизация по токену
        const token = localStorage.getItem('token');
        if (token) {
    try {
        const decoded: any = jwtDecode(token);
        const userData = await AuthService.getUser(decoded.sub);
        
        // 👇 ИЗМЕНЕННЫЙ БЛОК ЗАГРУЗКИ
        const [invRes, transRes, notifRes] = await Promise.all([
            api.get(`/users/${userData.id}/inventory`).catch(() => ({ data: [] })),
            api.get(`/users/${userData.id}/transactions`).catch(() => ({ data: [] })),
            // Запрашиваем уведомления:
            api.get(`/notifications/user/${userData.id}`).catch(() => ({ data: [] })) 
        ]);

        // Собираем пользователя с уведомлениями
        // Мы вручную добавляем поле notifications в объект user, чтобы Layout его увидел
        const fullUser = { 
            ...userData, 
            notifications: notifRes.data || [] 
        };

        setUser(fullUser); // Сохраняем полного юзера
        setPendingItems(invRes.data || []);
        setTransactions(transRes.data || []);
        
    } catch (err) { /* ... */ }
}

      } catch (error) {
        console.error("Fatal Error Init:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, []);

  // ==================== 2. ЛОГИКА ДЕЙСТВИЙ (HANDLERS) ====================

  const handleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    window.location.href = `${apiUrl}/auth/steam`;
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
    setTransactions([]);
    setPendingItems([]);
  };

  const handlePurchase = async (productId: string, serverId: string, quantity: number = 1) => {
    if (!user) {
        handleLogin();
        return null;
    }

    try {
        const result = await ProductService.buy(String(user.id), productId, serverId, quantity);
        
        if (result.success) {
            // Обновляем баланс
            const updatedUser = { ...user, balance: result.newBalance, eventBalance: result.newEventBalance };
            setUser(updatedUser);
            
            // Добавляем предметы в инвентарь (визуально)
            const newItems: PendingItem[] = (result.items || []).map((item: any) => ({
                id: Math.random().toString(), 
                itemName: item.name || item.itemId,
                quantity: item.quantity,
                icon: item.icon || '',
                serverId: serverId,
                purchaseDate: new Date().toISOString(),
                status: 'PENDING'
            }));
            
            setPendingItems(prev => [...newItems, ...(prev || [])]);

            // Если не кейс - показываем результат сразу
            const product = products.find(p => String(p.id) === productId);
            if (product && !product.isCrate) {
                setPurchaseResults(result.items);
                setSelectedProduct(null);
            }

            return { items: result.items };
        }
    } catch (error: any) {
        setPromoResult({ status: 'error', message: error.response?.data?.message || 'Ошибка покупки' });
        return null;
    }
  };

  // Активация промокода
  const handleRedeemPromo = async (code: string) => {
      if (!user) return handleLogin();
      try {
          // Отправляем запрос на бэкенд (нужно будет реализовать endpoint /promocodes/redeem)
          // Пока что предположим, что он есть, или выведем сообщение
          const res = await api.post('/promocodes/redeem', { userId: user.id, code });
          
          setPromoResult({ status: 'success', message: `Промокод активирован! Вы получили: ${res.data.reward}` });
          
          // Обновляем профиль (баланс мог измениться)
          const updatedUser = await AuthService.getUser(user.id);
          setUser(updatedUser);
          
      } catch (error: any) {
          setPromoResult({ status: 'error', message: error.response?.data?.message || "Неверный промокод или лимит исчерпан" });
      }
  };

  // Установка реферала
  const handleSetReferrer = async (code: string) => {
      if (!user) return;
      try {
          await api.post(`/users/${user.id}/referrer`, { code });
          setPromoResult({ status: 'success', message: "Реферальный код активирован!" });
          const updatedUser = await AuthService.getUser(user.id);
          setUser(updatedUser);
      } catch (error: any) {
          setPromoResult({ status: 'error', message: error.response?.data?.message || "Ошибка активации кода" });
      }
  };

  // Пополнение баланса (ЮKassa)
  const handleTopUp = async (amount: number, bonusPercent: number = 0, appliedPromoCode?: string) => {
      if (!user) return;
      try {
          // Инициализация платежа
          const res = await api.post('/payments/create', { 
              userId: user.id, 
              amount, 
              promoCode: appliedPromoCode 
          });
          // Перенаправление на страницу оплаты ЮKassa
          if (res.data.confirmationUrl) {
              window.location.href = res.data.confirmationUrl;
          }
      } catch (error: any) {
          setPromoResult({ status: 'error', message: "Ошибка создания платежа" });
      }
  };

  // --- Заглушки для админских функций (они внутри AdminPanel) ---
  const handleUpdateUserBalance = () => {}; 
  const handleSendNotification = () => {}; 
  const handleSendGlobal = () => {}; 
  const markNotificationRead = () => {};

  // ==================== 3. RENDER ====================

  return (
    <Router>
      <Layout 
        user={user} 
        onLogin={handleLogin} 
        onLogout={handleLogout}
        onOpenTopUp={() => setIsTopUpOpen(true)}
        onRedeemPromo={handleRedeemPromo}
        onMarkRead={markNotificationRead}
      >
        <Routes>
          <Route path="/" element={
              isLoading ? 
              <div className="flex items-center justify-center min-h-[50vh] text-ostrum-muted font-bold uppercase tracking-widest animate-pulse">Загрузка магазина...</div> : 
              <Home 
                products={products || []} 
                servers={servers || []} 
                onProductClick={setSelectedProduct} 
                selectedServerId={selectedServerId} 
                onServerChange={setSelectedServerId} 
              />
          } />
          
          <Route path="/crate/:id" element={
            <CrateOpen 
                products={products || []} 
                user={user} 
                selectedServerId={selectedServerId} 
                onPurchase={handlePurchase} 
                onLoginRequest={handleLogin} 
                onOpenTopUp={() => setIsTopUpOpen(true)} 
            />
          } />
          
          <Route path="/servers" element={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(servers || []).map(srv => <ServerStatus key={srv.id} server={srv} />)}
            </div>
          } />
          
          <Route path="/rules" element={<Rules />} />
          <Route path="/terms" element={<LegalPage type="terms" />} />
          <Route path="/privacy" element={<LegalPage type="privacy" />} />
          <Route path="/offer" element={<LegalPage type="offer" />} />
          
          <Route path="/profile" element={
            <ProtectedRoute user={user}>
                <Profile 
                    user={user!} 
                    // Защита от undefined
                    transactions={(transactions || []).filter(t => t && (!user || t.userId === user.id))} 
                    pendingItems={pendingItems || []} 
                    servers={servers || []} 
                    onSetReferrer={handleSetReferrer}
                    gameItems={gameItems} 
                />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute user={user} adminOnly>
                <AdminPanel 
                    products={products || []} 
                    setProducts={setProducts} 
                    servers={servers || []} 
                    users={allUsers || []} 
                    promos={promos || []} 
                    setPromos={setPromos} 
                    onUpdateUserBalance={handleUpdateUserBalance} 
                    onSendNotification={handleSendNotification} 
                    onSendGlobalNotification={handleSendGlobal} 
                    gameItems={gameItems || []}
                />
            </ProtectedRoute>
          } />
        </Routes>

        {selectedProduct && (
            <ProductModal 
                product={selectedProduct} 
                user={user} 
                servers={servers || []} 
                onClose={() => setSelectedProduct(null)} 
                onPurchase={(pid, sid, qty) => handlePurchase(pid, sid, qty)} 
                onLoginRequest={handleLogin} 
                onOpenTopUp={() => setIsTopUpOpen(true)} 
            />
        )}
        
        {isTopUpOpen && (
            <TopUpModal 
                user={user} 
                promos={promos || []} 
                onClose={() => setIsTopUpOpen(false)} 
                onTopUp={handleTopUp} 
            />
        )}
        
        {purchaseResults && <SuccessModal items={purchaseResults} onClose={() => setPurchaseResults(null)} />}
        {promoResult && <PromoResultModal status={promoResult.status} message={promoResult.message} onClose={() => setPromoResult(null)} />}
      </Layout>
    </Router>
  );
};

export default App;