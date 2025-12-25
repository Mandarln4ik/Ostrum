
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Product, User, GameItem } from '../types';
import { GAME_ITEMS } from '../services/mockData';
import { Sparkles, Wallet, AlertTriangle, AlertCircle, ChevronDown, Package, User as UserIcon, ArrowLeft, Snowflake, Info, Gift } from 'lucide-react';

interface CrateOpenProps {
  products: Product[];
  user: User | null;
  selectedServerId: string;
  onPurchase: (productId: string, serverId: string, quantity: number) => { items: { itemId: string; name: string; icon: string; quantity: number }[] } | null;
  onLoginRequest: () => void;
  onOpenTopUp: () => void;
}

const CrateOpen: React.FC<CrateOpenProps> = ({ products, user, selectedServerId, onPurchase, onLoginRequest, onOpenTopUp }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = products.find(p => p.id === id);

  const [multiplier, setMultiplier] = useState<number>(1);
  const [isOpening, setIsOpening] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [winningItems, setWinningItems] = useState<{ itemId: string; name: string; icon: string; quantity: number }[]>([]);
  
  // Spinner Engine States
  const [currentIndices, setCurrentIndices] = useState<number[]>(Array(10).fill(5));
  const [spinOffsets, setSpinOffsets] = useState<number[]>(Array(10).fill(0));
  const [stripPools, setStripPools] = useState<GameItem[][]>([]);

  const stripRefs = useRef<(HTMLDivElement | null)[]>([]);
  const multiplierOptions = [1, 3, 5, 10];
  
  // Reduced item width/height for more compact spinners
  const ITEM_WIDTH = 80;

  useEffect(() => {
    if (!product?.lootTable) return;
    
    const initialPools = Array.from({ length: 10 }).map(() => {
      const items: GameItem[] = [];
      const pool = product.lootTable!.map(lt => GAME_ITEMS.find(gi => gi.id === lt.itemId)).filter(Boolean) as GameItem[];
      for (let i = 0; i < 500; i++) {
        items.push(pool[Math.floor(Math.random() * pool.length)]);
      }
      return items;
    });
    setStripPools(initialPools);
  }, [product]);

  if (!product || !product.isCrate) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4 uppercase tracking-tighter">Кейс не найден</h2>
        <Link to="/" className="text-ostrum-primary font-black uppercase text-sm hover:underline">Вернуться в магазин</Link>
      </div>
    );
  }

  const hasFreeOpening = user?.freeCrates?.includes(product.id) && multiplier === 1;
  const totalPrice = hasFreeOpening ? 0 : product.price * multiplier;
  const canAfford = hasFreeOpening || (user && (product.currency === 'RUB' ? user.balance >= totalPrice : user.eventBalance >= totalPrice));

  const handleOpen = () => {
    if (!user) {
      onLoginRequest();
      return;
    }
    if (!canAfford) {
      if (product.currency === 'RUB' && !hasFreeOpening) {
          onOpenTopUp();
      }
      return;
    }

    const result = onPurchase(product.id, selectedServerId, multiplier);
    if (!result) return;

    setShowResult(false);
    setIsOpening(true);
    setWinningItems(result.items);

    const updatedPools = stripPools.map(pool => [...pool]);
    const newIndices = [...currentIndices];
    const newOffsets = [...spinOffsets];

    result.items.forEach((win, stripIdx) => {
      const distance = 45 + Math.floor(Math.random() * 25); 
      const targetIndex = currentIndices[stripIdx] + distance;
      
      const winnerData = GAME_ITEMS.find(gi => gi.id === win.itemId);
      if (winnerData) {
        updatedPools[stripIdx][targetIndex] = winnerData;
      }

      const randomInnerOffset = Math.floor(Math.random() * (ITEM_WIDTH * 0.7)) + (ITEM_WIDTH * 0.15);
      
      const stripEl = stripRefs.current[stripIdx];
      const containerWidth = stripEl?.offsetWidth || 800;
      const centerOffset = containerWidth / 2;
      
      const targetOffset = -(targetIndex * ITEM_WIDTH + randomInnerOffset - centerOffset);
      
      newOffsets[stripIdx] = targetOffset;
      newIndices[stripIdx] = targetIndex;
    });

    setStripPools(updatedPools);
    setSpinOffsets(newOffsets);
    setCurrentIndices(newIndices);

    setTimeout(() => {
      setIsOpening(false);
      setShowResult(true);
    }, 5500);
  };

  const getButtonContent = () => {
    if (!user) return <><UserIcon size={20}/> ТРЕБУЕТСЯ ВХОД</>;
    if (isOpening) return 'ОТКРЫВАЕМ...';
    if (!canAfford) return <><AlertCircle size={20}/> НЕДОСТАТОЧНО СРЕДСТВ</>;
    if (hasFreeOpening) return <><Gift size={20}/> ОТКРЫТЬ БЕСПЛАТНО</>;
    return `ОТКРЫТЬ ЗА ${totalPrice} ${product.currency === 'RUB' ? '₽' : '❄'}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-black uppercase text-[10px] tracking-widest">В магазин</span>
        </Link>
        <div className={`flex items-center gap-4 bg-ostrum-card p-3 rounded-2xl border ${product.currency === 'EVENT' ? 'border-blue-500/30' : 'border-white/5 shadow-xl'}`}>
          <img src={product.image} className="w-10 h-10 object-contain" alt="" />
          <div>
            <h1 className="text-lg font-black text-white uppercase leading-none tracking-tight">{product.name}</h1>
            <span className={`font-black text-[10px] flex items-center gap-1.5 mt-1 ${product.currency === 'EVENT' ? 'text-blue-400' : 'text-ostrum-primary'}`}>
                {product.price} {product.currency === 'RUB' ? '₽' : <Snowflake size={10} />} за шт.
            </span>
          </div>
        </div>
      </div>

      <div className={`bg-black/20 backdrop-blur-md border rounded-[2rem] p-4 md:p-6 relative overflow-hidden shadow-2xl ${product.currency === 'EVENT' ? 'border-blue-500/10' : 'border-white/5'}`}>
        <div className={`grid gap-3 ${multiplier > 5 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {Array.from({ length: multiplier }).map((_, stripIdx) => (
            <div 
              key={stripIdx} 
              // Fix: wrap ref assignment in braces to ensure it returns void (prevents implicit return of element)
              ref={el => { stripRefs.current[stripIdx] = el; }}
              className="relative py-4 bg-ostrum-card/50 rounded-2xl border border-white/5 overflow-hidden shadow-inner"
            >
              <div className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 z-30 pointer-events-none ${product.currency === 'EVENT' ? 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.6)]' : 'bg-ostrum-primary shadow-[0_0_10px_rgba(139,92,246,0.6)]'}`}>
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-0.5 ${product.currency === 'EVENT' ? 'text-blue-400' : 'text-ostrum-primary'}`}>
                    <ChevronDown size={20} fill="currentColor" />
                </div>
              </div>

              <div 
                className="flex gap-0 will-change-transform transition-transform duration-[5200ms] ease-[cubic-bezier(0.1,0,0.1,1)]"
                style={{ transform: `translateX(${spinOffsets[stripIdx]}px)` }}
              >
                {stripPools[stripIdx]?.map((item, idx) => (
                  <div 
                    key={idx} 
                    style={{ width: `${ITEM_WIDTH}px`, height: `${ITEM_WIDTH}px` }}
                    className="flex-shrink-0 border-r border-white/5 flex items-center justify-center relative group"
                  >
                    <img src={item.icon} alt="" className="w-12 h-12 object-contain z-10 drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)]" />
                  </div>
                ))}
              </div>

              <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ostrum-card to-transparent z-20 pointer-events-none"></div>
              <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ostrum-card to-transparent z-20 pointer-events-none"></div>
            </div>
          ))}
        </div>
      </div>

      {showResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
          <div className={`bg-ostrum-card border rounded-[3rem] p-10 max-w-4xl w-full shadow-2xl text-center relative overflow-hidden ${product.currency === 'EVENT' ? 'border-blue-500/50' : 'border-ostrum-primary/50'}`}>
            <h2 className="text-4xl font-black text-white mb-8 uppercase tracking-tighter italic flex items-center justify-center gap-4">
               <Sparkles className={product.currency === 'EVENT' ? 'text-blue-400' : 'text-ostrum-primary'} size={32} /> Поздравляем!
            </h2>
            <div className="flex flex-wrap justify-center gap-4 mb-10 max-h-[50vh] overflow-y-auto custom-scrollbar p-2">
              {winningItems.map((item, idx) => (
                <div key={idx} className="bg-black/40 p-5 rounded-3xl border border-white/10 min-w-[150px] shadow-xl animate-in slide-in-from-bottom duration-500" style={{ animationDelay: `${idx * 80}ms` }}>
                  <img src={item.icon} className="w-20 h-20 object-contain mx-auto mb-3 drop-shadow-lg" alt="" />
                  <div className="text-white font-black text-[10px] uppercase mb-1 truncate max-w-full tracking-tighter">{item.name}</div>
                  <div className={`font-black text-xl ${product.currency === 'EVENT' ? 'text-blue-400' : 'text-ostrum-primary'}`}>x{item.quantity}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowResult(false)} className={`text-white px-12 py-5 rounded-2xl font-black text-xl shadow-2xl transition-all transform active:scale-95 uppercase tracking-widest ${product.currency === 'EVENT' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-ostrum-primary hover:bg-ostrum-secondary'}`}>
              Забрать всё
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
           <div className={`bg-ostrum-card border rounded-[2rem] p-6 shadow-2xl ${product.currency === 'EVENT' ? 'border-blue-500/10' : 'border-white/5'}`}>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                 <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/5 shadow-inner">
                    {multiplierOptions.map(opt => (
                      <button
                        key={opt}
                        onClick={() => !isOpening && setMultiplier(opt)}
                        className={`px-6 py-3 rounded-lg text-sm font-black transition-all uppercase tracking-tighter ${multiplier === opt ? (product.currency === 'EVENT' ? 'bg-blue-600 text-white shadow-xl' : 'bg-ostrum-primary text-white shadow-xl') : 'text-ostrum-muted hover:text-white'}`}
                      >
                        x{opt}
                      </button>
                    ))}
                 </div>
                 
                 <button 
                  onClick={handleOpen}
                  disabled={isOpening}
                  className={`flex-1 w-full py-5 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-2xl ${isOpening ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : (!user ? 'bg-[#1c1c24] text-gray-400' : (!canAfford ? 'bg-red-900/40 border border-red-500/50 text-red-500' : (hasFreeOpening ? 'bg-green-600 hover:bg-green-500 text-white animate-pulse' : (product.currency === 'EVENT' ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-ostrum-primary hover:bg-ostrum-secondary text-white'))))} `}
                 >
                  {getButtonContent()}
                 </button>
              </div>

              {product.currency === 'EVENT' && user && canAfford && !isOpening && (
                <div className="mt-6 bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl flex items-start gap-4 shadow-sm">
                  <div className="bg-blue-400/20 p-2 rounded-xl text-blue-400">
                    <Info size={18} />
                  </div>
                  <div className="text-[10px] font-bold text-blue-100/40 leading-relaxed uppercase tracking-wide">
                    Как получить? Совершайте покупки в магазине: каждые <span className="text-white">10 ₽</span> принесут вам <span className="text-blue-400 font-black">0.1 снежинку</span> автоматически!
                  </div>
                </div>
              )}
           </div>

           <div className={`bg-ostrum-card border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden ${product.currency === 'EVENT' ? 'border-blue-500/10' : 'border-white/5'}`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-ostrum-primary/5 blur-[80px] rounded-full -mr-16 -mt-16"></div>
              <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3 relative z-10">
                <Package size={20} className={product.currency === 'EVENT' ? 'text-blue-400' : 'text-ostrum-primary'} /> Содержимое кейса
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 relative z-10">
                {product.lootTable?.map((lt, idx) => {
                  const item = GAME_ITEMS.find(gi => gi.id === lt.itemId);
                  return (
                    <div key={idx} className="bg-black/30 p-4 rounded-[1.5rem] border border-white/5 flex flex-col items-center group hover:border-white/20 transition-all shadow-inner">
                      <img src={item?.icon} alt="" className="w-12 h-12 object-contain mb-2 group-hover:scale-110 transition-transform drop-shadow-md" />
                      <div className="text-[8px] text-ostrum-muted font-bold text-center leading-tight uppercase line-clamp-2 h-5 tracking-tighter">{item?.name}</div>
                      <div className={`mt-1 font-black text-[10px] ${product.currency === 'EVENT' ? 'text-blue-400' : 'text-ostrum-primary'}`}>x{lt.quantity}</div>
                    </div>
                  );
                })}
              </div>
           </div>
      </div>
    </div>
  );
};

export default CrateOpen;
