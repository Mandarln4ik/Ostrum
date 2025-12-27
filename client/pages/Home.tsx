import React, { useState, useEffect } from 'react';
import { Product, ServerInfo, Category } from '../types';
import { Clock, ShoppingBag, Server, Package, ArrowDown, ArrowUp, Star, Percent, LayoutGrid, Snowflake } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CategoriesService } from '../services/categories.service'; // Подключаем сервис

interface HomeProps {
  products: Product[];
  servers: ServerInfo[];
  onProductClick: (product: Product) => void;
  selectedServerId: string;
  onServerChange: (id: string) => void;
}

type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'discount';

const CountdownTimer: React.FC<{ endsAt: string }> = ({ endsAt }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(endsAt) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft(null);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  if (!timeLeft) return null;

  return (
    <div className="flex items-center gap-1.5 bg-ostrum-accent/20 text-ostrum-accent px-2 py-1 rounded-md border border-ostrum-accent/20 text-[10px] font-bold uppercase tracking-tight shadow-sm">
      <Clock size={10} />
      <span>
        {timeLeft.days > 0 && `${timeLeft.days}д `}
        {timeLeft.hours.toString().padStart(2, '0')}:
        {timeLeft.minutes.toString().padStart(2, '0')}:
        {timeLeft.seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
};

const Home: React.FC<HomeProps> = ({ products, servers, onProductClick, selectedServerId, onServerChange }) => {
  // Стейт категорий (загружаем из БД)
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all'); 
  const [sortBy, setSortBy] = useState<SortOption>('popular');

  // Загрузка категорий при старте
  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const data = await CategoriesService.getAll();
            setCategories(data);
            // Если массив пустой, можно добавить фоллбэк, но мы рассчитываем на seed
        } catch (error) {
            console.error("Ошибка загрузки категорий:", error);
        }
    };
    fetchCategories();
  }, []);
  
  const crates = products.filter(p => p.isCrate);

  // ГЛАВНЫЙ ФИЛЬТР ТОВАРОВ
  const filteredProducts = products.filter(p => {
    // 1. Фильтр по категории (сравниваем slug)
    const categoryMatch = selectedCategory === 'all' || selectedCategory === 'ALL' || p.category === selectedCategory;
    
    // 2. Фильтр по серверу
    const serverMatch = p.servers && Array.isArray(p.servers) 
      ? p.servers.includes(selectedServerId)
      : false;

    // Скрываем кейсы из общего списка товаров
    const notCrate = !p.isCrate;

    return categoryMatch && serverMatch && notCrate;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const getEffectivePrice = (p: Product) => p.discount ? Math.floor(p.price * (1 - p.discount.percent / 100)) : p.price;
    const priceA = getEffectivePrice(a);
    const priceB = getEffectivePrice(b);

    switch (sortBy) {
      case 'price-asc': return priceA - priceB;
      case 'price-desc': return priceB - priceA;
      case 'name-asc': return a.name.localeCompare(b.name);
      case 'name-desc': return b.name.localeCompare(a.name);
      case 'discount':
        const hasDiscountA = a.discount ? 1 : 0;
        const hasDiscountB = b.discount ? 1 : 0;
        if (hasDiscountA !== hasDiscountB) return hasDiscountB - hasDiscountA;
        return (b.discount?.percent || 0) - (a.discount?.percent || 0);
      case 'popular':
        return (b.id || 0) > (a.id || 0) ? 1 : -1;
      default: return 0;
    }
  });

  const sortButtons = [
    { key: 'popular', label: 'Популярные', icon: <Star size={12}/> },
    { key: 'price-asc', label: 'Дешевле', icon: <ArrowDown size={12}/> },
    { key: 'price-desc', label: 'Дороже', icon: <ArrowUp size={12}/> },
    { key: 'discount', label: 'На скидке', icon: <Percent size={12}/> },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Top Server Selection Bar */}
      <div className="bg-ostrum-card border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-full bg-ostrum-primary/5 blur-[80px] rounded-full -mr-16"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-ostrum-primary/10 p-3 rounded-xl text-ostrum-primary border border-ostrum-primary/10 shadow-lg">
            <Server size={24} />
          </div>
          <div>
            <div className="text-white text-lg font-extrabold uppercase tracking-tight leading-none">Выбор сервера</div>
            <div className="text-ostrum-muted text-[10px] mt-1 font-bold uppercase tracking-widest">Выберите мир для начала игры</div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 relative z-10">
          {servers.map(srv => (
            <button
              key={srv.id}
              onClick={() => onServerChange(srv.identifier)}
              className={`px-5 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-wide border ${selectedServerId === srv.identifier ? 'bg-ostrum-primary text-white border-ostrum-primary shadow-[0_5px_15px_rgba(139,92,246,0.3)]' : 'bg-black/40 text-ostrum-muted hover:text-white border-white/5'}`}
            >
              {srv.name}
            </button>
          ))}
        </div>
      </div>

      {/* Event Banner */}
      <div className="bg-black border border-blue-500/10 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
         <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-6 transition-transform duration-1000">
            <Snowflake size={180} className="text-blue-400" />
         </div>
         <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-transparent pointer-events-none"></div>
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="bg-blue-600/10 p-8 rounded-[2rem] border border-blue-500/10 shadow-2xl">
                <Snowflake size={54} className="text-blue-400" />
            </div>
            <div className="text-center md:text-left">
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-3 leading-none">Зимнее событие Ostrum</h2>
                <p className="text-blue-100/40 font-bold max-w-xl text-xs leading-relaxed uppercase tracking-widest">
                    Получайте <span className="text-white">0.1 снежинки за каждые 10 ₽</span> покупок. Тратьте их на эксклюзивные ивентовые кейсы!
                </p>
            </div>
         </div>
      </div>

      {/* --- SECTION 1: CRATES --- */}
      {crates.length > 0 && (
        <section className="relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-ostrum-primary/5 rounded-2xl border border-ostrum-primary/10 shadow-lg">
                      <Package className="text-ostrum-primary" size={32} />
                  </div>
                  <div>
                      <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-none">Удача Ostrum</h2>
                      <p className="text-ostrum-muted text-[10px] font-bold uppercase tracking-widest mt-1">Открывай кейсы и получай ценный лут</p>
                  </div>
              </div>
              <div className="h-px flex-1 bg-white/5 mx-8 hidden lg:block"></div>
              <div className="text-ostrum-muted text-[9px] font-bold uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
                  Всего товаров: {crates.length}
              </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {crates.filter(c => c.servers?.includes(selectedServerId)).map(crate => (
                  <Link 
                      to={`/crate/${crate.id}`} 
                      key={crate.id}
                      className={`bg-ostrum-card border rounded-[2rem] p-8 group transition-all duration-300 relative overflow-hidden flex flex-col items-center ${crate.currency === 'EVENT' ? 'border-blue-500/10 hover:border-blue-500/30' : 'border-white/5 hover:border-ostrum-primary/30 shadow-2xl'}`}
                  >
                      <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] rounded-full -mr-16 -mt-16 group-hover:opacity-60 transition-all ${crate.currency === 'EVENT' ? 'bg-blue-500/10' : 'bg-ostrum-primary/10'}`}></div>
                      
                      {crate.currency === 'EVENT' && (
                          <div className="absolute top-6 left-6 bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-blue-500/20 shadow-sm">
                              <Snowflake size={10} /> EVENT
                          </div>
                      )}

                      <img src={crate.image_url} className="w-44 h-44 object-contain mb-8 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-700" alt={crate.name} />
                      
                      <h3 className="text-xl font-extrabold text-white text-center mb-2 uppercase tracking-tight leading-tight w-full truncate">{crate.name}</h3>
                      
                      <div className={`font-black text-3xl flex items-center gap-1.5 ${crate.currency === 'EVENT' ? 'text-blue-400' : 'text-ostrum-primary'}`}>
                          {crate.price} {crate.currency === 'RUB' ? '₽' : <Snowflake size={22} />}
                      </div>
                      
                      <div className={`mt-6 w-full text-center py-3.5 rounded-2xl font-bold transition-all uppercase text-[10px] tracking-widest border shadow-lg ${crate.currency === 'EVENT' ? 'bg-blue-500/10 text-blue-400 border-blue-500/10 group-hover:bg-blue-500 group-hover:text-white' : 'bg-ostrum-primary/5 text-ostrum-primary border-ostrum-primary/10 group-hover:bg-ostrum-primary group-hover:text-white'}`}>
                          {crate.currency === 'EVENT' ? 'За снежинки' : 'Открыть'}
                      </div>
                  </Link>
              ))}
          </div>
        </section>
      )}

      {/* --- SECTION 2: PRODUCTS --- */}
      <section className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-ostrum-secondary/5 rounded-2xl border border-ostrum-secondary/10 shadow-lg">
                    <ShoppingBag className="text-ostrum-secondary" size={32} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-none">Магазин</h2>
                    <p className="text-ostrum-muted text-[10px] font-bold uppercase tracking-widest mt-1">Ресурсы, наборы и инструменты</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                 <div className="bg-black/40 border border-white/5 rounded-xl p-1 flex shadow-xl flex-wrap">
                    {sortButtons.map(btn => (
                      <button 
                          key={btn.key}
                          onClick={() => setSortBy(btn.key as SortOption)}
                          className={`px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase transition-all tracking-wide flex items-center gap-2 ${sortBy === btn.key ? 'bg-ostrum-primary text-white shadow-lg' : 'text-ostrum-muted hover:text-white'}`}
                      >
                          {btn.icon}
                          {btn.label}
                      </button>
                    ))}
                 </div>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
            
            {/* 👇 САЙДБАР: Теперь грузится из массива categories 👇 */}
            <aside className="w-full lg:w-72 flex-shrink-0">
                <div className="bg-ostrum-card rounded-[2.5rem] border border-white/5 p-6 sticky top-24 shadow-2xl">
                    <div className="flex items-center justify-between mb-8 px-2">
                        <h2 className="font-bold text-ostrum-muted uppercase tracking-widest text-[9px] flex items-center gap-2">
                            <LayoutGrid size={12} /> Категории
                        </h2>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                        {categories.map((cat) => {
                            const isAll = cat.slug === 'all';
                            const isActive = selectedCategory === cat.slug;

                            // Стили для кнопки "Все товары" (Фиолетовая плашка)
                            if (isAll) {
                                return (
                                    <button 
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.slug)}
                                        className={`w-full text-center px-5 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-wide shadow-lg mb-4 ${
                                            isActive 
                                            ? 'bg-ostrum-primary text-white border border-ostrum-primary shadow-ostrum-primary/30' 
                                            : 'bg-ostrum-primary/80 text-white/80 hover:bg-ostrum-primary hover:text-white'
                                        }`}
                                    >
                                        {cat.name}
                                    </button>
                                );
                            }

                            // Стили для остальных категорий
                            return (
                                <button 
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.slug)}
                                    className={`text-left px-5 py-3.5 rounded-xl transition-all font-bold text-[11px] uppercase tracking-wide border ${
                                        isActive 
                                        ? 'bg-white/10 text-white border-white/5' 
                                        : 'bg-transparent border-transparent text-ostrum-muted hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            );
                        })}
                        
                        {categories.length === 0 && (
                            <div className="text-center py-4 text-[10px] text-ostrum-muted animate-pulse">Загрузка категорий...</div>
                        )}
                    </div>

                    <div className="mt-10 pt-6 border-t border-white/5">
                        <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                            <div className="text-[9px] font-bold text-ostrum-primary uppercase tracking-widest mb-2">Автовыдача</div>
                            <p className="text-[10px] text-ostrum-muted leading-relaxed font-bold uppercase tracking-tight">
                                Команда <span className="text-white">/shop</span> на сервере.
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
                {sortedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {sortedProducts.map((product) => (
                            <div 
                                key={product.id} 
                                onClick={() => onProductClick(product)}
                                className={`bg-ostrum-card border rounded-[2rem] overflow-hidden group transition-all duration-300 relative flex flex-col cursor-pointer shadow-2xl ${product.currency === 'EVENT' ? 'border-blue-500/10' : 'border-white/5 hover:border-ostrum-primary/30'}`}
                            >
                                <div className="relative h-60 bg-black/10 p-6 flex items-center justify-center overflow-hidden">
                                    {product.discount && (
                                        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 items-start">
                                            <div className="bg-ostrum-accent text-white text-[9px] font-extrabold px-3 py-1.5 rounded-lg shadow-xl uppercase tracking-wider">
                                                -{product.discount.percent}%
                                            </div>
                                            {product.discount.endsAt && (
                                                <CountdownTimer endsAt={product.discount.endsAt} />
                                            )}
                                        </div>
                                    )}
                                    
                                    {product.currency === 'RUB' && !product.isFree && (
                                        <div className="absolute bottom-4 right-4 bg-[#1e1e2d] text-blue-400 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-500/20 flex items-center gap-2 shadow-2xl">
                                            +{product.eventBonus ? product.eventBonus.toFixed(1) : (product.price * 0.01).toFixed(1)} <Snowflake size={12} fill="currentColor" />
                                        </div>
                                    )}

                                    <img src={product.image_url} alt={product.name} className="max-h-full max-w-full object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-700" />
                                </div>

                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex-1">
                                        <div className={`text-[9px] font-bold uppercase tracking-widest mb-2 ${product.currency === 'EVENT' ? 'text-blue-400' : 'text-ostrum-primary'}`}>{product.category}</div>
                                        <h3 className="text-xl font-extrabold text-white leading-tight mb-4 group-hover:text-ostrum-primary transition-colors uppercase tracking-tight">{product.name}</h3>
                                    </div>

                                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
                                        <div>
                                            {product.discount && <div className="text-[10px] text-ostrum-muted line-through font-bold">{product.price} {product.currency === 'RUB' ? '₽' : ''}</div>}
                                            <div className={`text-2xl font-black flex items-center gap-1.5 ${product.currency === 'EVENT' ? 'text-blue-400' : 'text-white'}`}>
                                                {product.discount ? Math.floor(product.price * (1 - product.discount.percent / 100)) : product.price} 
                                                {product.currency === 'RUB' ? '₽' : <Snowflake size={22} />}
                                            </div>
                                        </div>
                                        <button className={`p-4 rounded-2xl transition-all shadow-xl border ${product.currency === 'EVENT' ? 'bg-blue-600/10 text-blue-400 border-blue-500/10 group-hover:bg-blue-600 group-hover:text-white' : 'bg-black/40 text-white border-white/5 group-hover:bg-ostrum-primary group-hover:border-ostrum-primary'}`}>
                                            <ShoppingBag size={22} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 bg-black/10 rounded-[3rem] border border-white/5 border-dashed">
                        <ShoppingBag size={48} className="text-ostrum-muted/10 mb-6" />
                        <div className="text-ostrum-muted font-bold uppercase tracking-widest text-[10px] opacity-30">
                            {products.length === 0 ? "Загрузка товаров..." : "В этой категории пусто"}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </section>
    </div>
  );
};

export default Home;