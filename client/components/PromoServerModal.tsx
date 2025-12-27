import React, { useState } from 'react';
import { ServerInfo } from '../types';
import { X, Server } from 'lucide-react';

interface Props {
  servers: ServerInfo[];
  onClose: () => void;
  onSelect: (serverId: string) => void;
}

const PromoServerModal: React.FC<Props> = ({ servers, onClose, onSelect }) => {
  const [selected, setSelected] = useState<string>(servers[0]?.identifier || '');

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-ostrum-card border border-white/10 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-ostrum-muted hover:text-white"><X size={24} /></button>
        
        <div className="text-center mb-6">
            <div className="mx-auto bg-ostrum-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center text-ostrum-primary mb-4 border border-ostrum-primary/20">
                <Server size={32} />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-2">Выберите сервер</h3>
            <p className="text-[10px] text-ostrum-muted font-bold uppercase tracking-widest">
                Куда выдать награду за промокод?
            </p>
        </div>

        <div className="space-y-4">
            <select 
                value={selected} 
                onChange={(e) => setSelected(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-bold outline-none uppercase text-xs focus:border-ostrum-primary transition-all cursor-pointer"
            >
                {servers.map(s => (
                    <option key={s.id} value={s.identifier} className="bg-black">{s.name}</option>
                ))}
            </select>

            <button 
                onClick={() => onSelect(selected)}
                className="w-full bg-ostrum-primary hover:bg-ostrum-secondary text-white py-4 rounded-xl font-black uppercase text-sm tracking-widest shadow-lg transition-transform active:scale-95"
            >
                Активировать
            </button>
        </div>
      </div>
    </div>
  );
};

export default PromoServerModal;