
import React, { useState } from 'react';
import { User as UserIcon, LogOut, Menu, X, Shield, FileText, Wallet, Plus, Snowflake, Ticket, Bell } from 'lucide-react';
import { User, Notification } from '../types';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenTopUp: () => void;
  onRedeemPromo: (code: string) => void;
  onMarkRead: (id: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogin, onLogout, onOpenTopUp, onRedeemPromo, onMarkRead }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();

  const unreadCount = user?.notifications.filter(n => !n.read).length || 0;

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoInput.trim()) {
      onRedeemPromo(promoInput);
      setPromoInput('');
    }
  };

  const navLinks = [
    { name: 'Магазин', path: '/' },
    { name: 'Серверы', path: '/servers' },
    { name: 'Правила', path: '/rules' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-ostrum-bg text-ostrum-text font-sans">
      <header className="sticky top-0 z-50 bg-ostrum-bg/95 backdrop-blur border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-ostrum-primary rounded-full flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-8 h-8 text-black fill-current">
                    <path d="M50 0 L50 20 A30 30 0 0 1 80 50 L100 50 A50 50 0 0 0 50 0 Z" />
                    <path d="M10 30 L34 30 A20 20 0 0 0 50 80 L50 100 A40 40 0 0 1 10 30 Z" fill="white"/>
                </svg>
                </div>
                <span className="text-2xl font-black tracking-tighter text-white uppercase hidden md:inline">Ostrum</span>
            </Link>
            <nav className="hidden lg:flex gap-5">
                {navLinks.map((link) => (
                <Link key={link.path} to={link.path} className={`text-[10px] uppercase tracking-widest font-black transition-colors hover:text-ostrum-primary ${location.pathname === link.path ? 'text-ostrum-primary' : 'text-ostrum-muted'}`}>
                    {link.name}
                </Link>
                ))}
                {user?.role === 'ADMIN' && (
                <Link to="/admin" className="text-[10px] uppercase tracking-widest font-black text-ostrum-accent hover:text-red-400">Админ-панель</Link>
                )}
            </nav>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden xl:block">
            <form onSubmit={handleRedeem} className="flex items-center bg-black/40 border border-white/5 rounded-xl px-4 py-2 focus-within:border-ostrum-primary/50 transition-all group min-w-[280px]">
                <Ticket size={16} className="text-ostrum-muted group-focus-within:text-ostrum-primary transition-colors shrink-0" />
                <input type="text" placeholder="ВВЕДИТЕ ПРОМОКОД..." className="bg-transparent outline-none text-[9px] font-black uppercase tracking-widest text-white px-3 w-full placeholder:text-ostrum-muted/50" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} />
                <button type="submit" className="text-[10px] font-black uppercase text-ostrum-primary hover:text-white transition-colors bg-ostrum-primary/10 px-2 py-0.5 rounded shrink-0">OK</button>
            </form>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 text-ostrum-muted hover:text-white transition-colors relative">
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-ostrum-accent text-[9px] font-black text-white flex items-center justify-center rounded-full border-2 border-ostrum-bg">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-4 w-80 bg-ostrum-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">Уведомления</span>
                      {unreadCount > 0 && <span className="text-[9px] text-ostrum-muted font-bold">{unreadCount} новых</span>}
                    </div>
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                      {user.notifications.length > 0 ? (
                        user.notifications.map((n) => (
                          <div key={n.id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-all relative ${!n.read ? 'bg-ostrum-primary/5' : ''}`}>
                            <div className="flex items-start gap-3">
                              <div className={`mt-1 p-1.5 rounded-lg ${n.type === 'gift' ? 'bg-green-500/20 text-green-500' : 'bg-ostrum-primary/20 text-ostrum-primary'}`}>
                                {n.type === 'gift' ? <Plus size={14}/> : <Ticket size={14}/>}
                              </div>
                              <div>
                                <div className="text-[10px] font-black text-white uppercase tracking-tight leading-tight">{n.title}</div>
                                <div className="text-[10px] text-ostrum-muted mt-1 leading-relaxed">{n.message}</div>
                                <div className="text-[8px] text-gray-600 mt-2 uppercase font-bold">{new Date(n.date).toLocaleDateString()} {new Date(n.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                              </div>
                            </div>
                            {!n.read && (
                              <button onClick={() => onMarkRead(n.id)} className="absolute top-4 right-4 text-[8px] font-black text-ostrum-primary hover:underline uppercase">OK</button>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-ostrum-muted text-[10px] font-bold uppercase tracking-widest">У вас нет уведомлений</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <div className="text-[9px] text-ostrum-muted uppercase font-bold tracking-widest leading-none mb-1">Баланс</div>
                    <div className="text-sm font-black text-green-400 flex items-center gap-1.5">
                      {user.balance.toLocaleString()} ₽
                      <button onClick={onOpenTopUp} className="bg-ostrum-primary/20 hover:bg-ostrum-primary text-ostrum-primary hover:text-white p-0.5 rounded transition-colors"><Plus size={12} /></button>
                    </div>
                  </div>
                  <div className="h-6 w-px bg-white/10"></div>
                  <div className="flex flex-col items-end">
                    <div className="text-[9px] text-ostrum-muted uppercase font-bold tracking-widest leading-none mb-1">Снежинки</div>
                    <div className="text-sm font-black text-blue-400">{user.eventBalance.toFixed(1)}</div>
                  </div>
                </div>
                <Link to="/profile" className="flex items-center gap-3 pl-4 border-l border-white/10 group">
                  <img src={user.avatar} alt={user.nickname} className="w-9 h-9 rounded-xl border border-white/10 group-hover:border-ostrum-primary transition-all shadow-lg" />
                  <UserIcon size={18} className="text-ostrum-muted group-hover:text-white transition-colors" />
                </Link>
                <button onClick={onLogout} title="Выйти" className="text-ostrum-muted hover:text-red-500"><LogOut size={20} /></button>
              </div>
            ) : (
              <button onClick={onLogin} className="flex items-center gap-2 bg-[#171a21] hover:bg-[#2a2e38] text-white px-5 py-2.5 rounded-xl font-black text-[10px] transition-all transform active:scale-95 uppercase tracking-widest border border-white/5 shadow-xl">
                <img src="https://community.akamai.steamstatic.com/public/shared/images/signinthroughsteam/sits_01.png" alt="Steam" className="h-5" />
                <span>Войти</span>
              </button>
            )}
            <button className="md:hidden text-white ml-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-ostrum-card border-t border-white/10 p-4 space-y-4 animate-in slide-in-from-top duration-300">
            <form onSubmit={handleRedeem} className="flex items-center bg-black/40 border border-white/5 rounded-xl px-4 py-3">
                <Ticket size={16} className="text-ostrum-muted" />
                <input type="text" placeholder="ПРОМОКОД..." className="bg-transparent outline-none text-xs font-bold uppercase tracking-widest text-white px-4 flex-1" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} />
                <button type="submit" className="text-xs font-black uppercase text-ostrum-primary">OK</button>
            </form>
            <div className="grid grid-cols-2 gap-2">
                {navLinks.map((link) => (
                <Link key={link.path} to={link.path} onClick={() => setMobileMenuOpen(false)} className="bg-white/5 px-4 py-3 rounded-xl text-[10px] font-black text-ostrum-muted hover:text-white uppercase tracking-widest text-center border border-white/5">{link.name}</Link>
                ))}
            </div>
             {user?.role === 'ADMIN' && (
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block text-center py-3 bg-red-500/10 rounded-xl text-[10px] font-black text-ostrum-accent uppercase tracking-widest border border-red-500/10">Админ-панель</Link>
            )}
             {user && (
                 <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="text-gray-300 flex flex-col">
                        <span className="text-[10px] text-ostrum-muted uppercase font-bold tracking-widest">Баланс: <span className="text-green-400">{user.balance} ₽</span></span>
                        <span className="text-[10px] text-ostrum-muted uppercase font-bold tracking-widest">Снежинки: <span className="text-blue-400">{user.eventBalance.toFixed(1)}</span></span>
                    </div>
                    <button onClick={() => { onOpenTopUp(); setMobileMenuOpen(false); }} className="text-[10px] uppercase font-black bg-ostrum-primary px-4 py-2 rounded-lg text-white">Пополнить</button>
                 </div>
             )}
          </div>
        )}
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
      <footer className="bg-black/30 border-t border-white/5 py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter italic">Ostrum</h3>
              <p className="text-ostrum-muted text-[11px] max-w-sm font-bold leading-relaxed uppercase tracking-tight">Крупнейший проект серверов Rust. Стабильная работа, мощное железо и уникальные плагины.</p>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-white mb-4 uppercase tracking-widest">Документы</h4>
              <ul className="space-y-2 text-[9px] font-bold uppercase tracking-[0.15em] text-ostrum-muted">
                <li><Link to="/terms" className="hover:text-ostrum-primary flex items-center gap-2 transition-colors"><FileText size={12}/> Пользовательское соглашение</Link></li>
                <li><Link to="/privacy" className="hover:text-ostrum-primary flex items-center gap-2 transition-colors"><Shield size={12}/> Политика конфиденциальности</Link></li>
                <li><Link to="/offer" className="hover:text-ostrum-primary flex items-center gap-2 transition-colors"><FileText size={12}/> Публичная оферта</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-white mb-4 uppercase tracking-widest">Поддержка</h4>
              <p className="text-[10px] font-black uppercase tracking-widest text-ostrum-muted mb-4">support@ostrum.ru</p>
              <div className="flex gap-2">
                 <div className="w-9 h-9 bg-white/5 rounded-xl hover:bg-[#5865F2] hover:text-white cursor-pointer flex items-center justify-center transition-all border border-white/5">D</div>
                 <div className="w-9 h-9 bg-white/5 rounded-xl hover:bg-[#0088cc] hover:text-white cursor-pointer flex items-center justify-center transition-all border border-white/5">T</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
