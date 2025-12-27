import React, { useState, useEffect } from 'react';
import { X, CreditCard, Ticket, Sparkles, AlertCircle } from 'lucide-react';
import { PromoCode, User } from '../types';
import { PromocodesService } from '../services/promocodes.service';

interface TopUpModalProps {
  user: User | null;
  promos?: PromoCode[];
  onClose: () => void;
  onTopUp: (amount: number, bonusPercent: number, appliedPromoCode?: string) => void;
}

const TopUpModal: React.FC<TopUpModalProps> = ({ user, onClose, onTopUp }) => {
  const [amount, setAmount] = useState<string>('500');
  const [promoInput, setPromoInput] = useState<string>('');
  const [bonusPercent, setBonusPercent] = useState<number>(0);
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | undefined>(undefined);
  const [promoError, setPromoError] = useState<string | null>(null);
  
  // Локальный стейт для промокодов
  const [loadedPromos, setLoadedPromos] = useState<PromoCode[]>([]);

  const presets = [100, 300, 500, 1000, 2000, 5000];

  // 1. ЗАГРУЖАЕМ ПРОМОКОДЫ ПРИ ОТКРЫТИИ
  useEffect(() => {
      PromocodesService.getAll()
        .then(data => setLoadedPromos(data))
        .catch(console.error);
  }, []);

  // 2. ВАЛИДАЦИЯ ПРИ ВВОДЕ
  useEffect(() => {
    if (!promoInput.trim()) {
        setBonusPercent(0);
        setAppliedPromoCode(undefined);
        setPromoError(null);
        return;
    }

    const cleanCode = promoInput.trim().toUpperCase();
    const foundPromo = loadedPromos.find(p => p.code === cleanCode);

    if (!foundPromo) {
        setBonusPercent(0);
        setAppliedPromoCode(undefined);
        setPromoError("Промокод не найден");
        return;
    }

    if (foundPromo.rewardType !== 'TOPUP_BONUS') {
        setBonusPercent(0);
        setAppliedPromoCode(undefined);
        setPromoError("Этот код не для пополнения");
        return;
    }

    if (foundPromo.currentActivations >= foundPromo.maxActivations) {
        setBonusPercent(0);
        setAppliedPromoCode(undefined);
        setPromoError("Лимит активаций исчерпан");
        return;
    }

    setBonusPercent(Number(foundPromo.rewardValue));
    setAppliedPromoCode(cleanCode);
    setPromoError(null);
  }, [promoInput, loadedPromos, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(amount);
    if (!isNaN(val) && val > 0) {
      onTopUp(val, bonusPercent, appliedPromoCode);
    }
  };

  const amountVal = parseInt(amount) || 0;
  const bonusVal = (amountVal * bonusPercent) / 100;
  const calculatedTotal = amountVal + bonusVal;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative bg-ostrum-card border border-white/10 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-ostrum-primary/5 blur-[80px] rounded-full -mr-16 -mt-16"></div>
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-ostrum-muted hover:text-white transition-colors z-10"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter italic">Пополнение</h2>
        <p className="text-ostrum-muted text-[10px] mb-8 font-black uppercase tracking-widest border-l-2 border-ostrum-primary pl-3">
            ЧЕРЕЗ ПЛАТЕЖНЫЙ ШЛЮЗ (ТЕСТ)
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
                <label className="block text-[10px] font-black text-ostrum-muted uppercase tracking-[0.2em] mb-3 ml-1">Сумма к оплате (₽)</label>
                <div className="relative group">
                    <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-6 text-4xl font-black text-white focus:border-ostrum-primary outline-none transition-all group-hover:border-white/20"
                        min="10"
                        placeholder="0"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-end">
                        <span className="text-ostrum-primary font-black text-sm">RUB</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
                {presets.map(val => (
                    <button 
                        key={val}
                        type="button"
                        onClick={() => setAmount(val.toString())}
                        className={`py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border ${amount === val.toString() ? 'bg-ostrum-primary border-ostrum-primary text-white shadow-xl' : 'bg-black/40 border-white/5 text-ostrum-muted hover:border-white/20 hover:text-white'}`}
                    >
                        {val} ₽
                    </button>
                ))}
            </div>

            <div className="bg-black/40 rounded-3xl p-6 border border-white/5 space-y-4">
                <label className="block text-[10px] font-black text-ostrum-muted uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                    <Ticket size={14} className="text-ostrum-primary" /> Промокод
                </label>
                <input 
                    type="text" 
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="ВВЕДИТЕ КОД..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-xs font-black text-white focus:border-ostrum-primary outline-none uppercase transition-all tracking-widest placeholder:text-ostrum-muted/20"
                />
                
                {promoError && (
                    <div className="flex items-center gap-2 text-red-500 text-[9px] font-black uppercase tracking-widest px-2 animate-in fade-in slide-in-from-top-1">
                        <AlertCircle size={12} /> {promoError}
                    </div>
                )}
                
                {bonusPercent > 0 && (
                    <div className="flex items-center gap-2 text-green-400 text-[9px] font-black uppercase tracking-widest px-2 animate-pulse">
                        <Sparkles size={12} /> Бонус по промокоду +{bonusPercent}%
                    </div>
                )}
            </div>

            <div className="bg-ostrum-primary/5 rounded-3xl p-6 border border-ostrum-primary/10 flex items-center justify-between shadow-inner">
                <div>
                    <div className="text-[10px] font-black text-ostrum-muted uppercase tracking-[0.2em] mb-1">Итого зачислим:</div>
                    <div className="text-3xl font-black text-white tracking-tighter italic">
                        {calculatedTotal.toLocaleString()} <span className="text-ostrum-primary">₽</span>
                    </div>
                </div>
                {bonusPercent > 0 && (
                    <div className="bg-green-500/10 text-green-500 px-4 py-2 rounded-xl text-[10px] font-black border border-green-500/10 uppercase tracking-widest shadow-xl">
                        +{bonusVal.toFixed(0)} ₽
                    </div>
                )}
            </div>

            <button 
                type="submit"
                disabled={amountVal <= 0}
                className={`w-full py-6 rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 shadow-[0_15px_40px_rgba(139,92,246,0.3)] transition-all transform hover:-translate-y-1 active:scale-95 uppercase tracking-widest ${amountVal > 0 ? 'bg-ostrum-primary hover:bg-ostrum-secondary text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
            >
                <CreditCard size={24} />
                Оплатить
            </button>
            
            <div className="flex justify-center opacity-30 hover:opacity-50 transition-all pt-2">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Тестовый режим</span>
            </div>
        </form>
      </div>
    </div>
  );
};

export default TopUpModal;