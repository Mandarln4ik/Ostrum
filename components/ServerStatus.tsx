
import React, { useState, useEffect } from 'react';
import { ServerInfo } from '../types';
import { Copy, Map, RefreshCw, Users, Activity } from 'lucide-react';

interface ServerStatusProps {
  server: ServerInfo;
}

const ServerStatus: React.FC<ServerStatusProps> = ({ server: initialServer }) => {
  const [server, setServer] = useState<ServerInfo>(initialServer);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Update local state if prop changes (e.g. initial load)
  useEffect(() => {
    setServer(initialServer);
  }, [initialServer]);

  useEffect(() => {
    const fetchStatus = async () => {
      setIsRefreshing(true);
      
      // Simulate API Latency
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate data update
      // In a real app, you would fetch from: await fetch(`/api/servers/${server.id}/status`)
      setServer(prev => {
        const playerChange = Math.floor(Math.random() * 7) - 3; // Random flux -3 to +3
        const newPlayers = Math.max(0, Math.min(prev.maxPlayers, prev.currentPlayers + playerChange));
        
        return {
          ...prev,
          currentPlayers: newPlayers,
          status: Math.random() > 0.98 ? 'offline' : 'online' // 2% chance of simulating offline for UI testing
        };
      });
      
      setLastUpdate(new Date());
      setIsRefreshing(false);
    };

    const interval = setInterval(fetchStatus, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [server.id]);

  const percentage = Math.min((server.currentPlayers / server.maxPlayers) * 100, 100);

  const copyIp = () => {
    const cmd = `client.connect ${server.ip}:${server.port}`;
    navigator.clipboard.writeText(cmd);
    // Using a more modern notification style would be better, but keeping it simple for now
    const btn = document.getElementById(`copy-btn-${server.id}`);
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = 'Скопировано!';
      btn.classList.add('bg-green-600');
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.remove('bg-green-600');
      }, 2000);
    }
  };

  return (
    <div className="bg-ostrum-card border border-white/5 rounded-2xl p-6 hover:border-ostrum-primary/50 transition-all duration-300 group shadow-xl relative overflow-hidden">
      {/* Decorative Background Glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] rounded-full -mr-16 -mt-16 transition-colors duration-1000 ${server.status === 'online' ? 'bg-green-500/10' : 'bg-red-500/10'}`}></div>

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <h3 className="text-xl font-black text-white uppercase tracking-tight italic">{server.name}</h3>
             {isRefreshing && <RefreshCw size={14} className="text-ostrum-primary animate-spin" />}
          </div>
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
            <div className={`flex items-center gap-1.5 ${server.status === 'online' ? 'text-green-500' : 'text-red-500'}`}>
              <Activity size={12} className={server.status === 'online' ? 'animate-pulse' : ''} />
              <span>{server.status}</span>
            </div>
            <span className="text-white/10">|</span>
            <span className="text-gray-500">Wipe: {server.lastWipe}</span>
          </div>
        </div>
        
        <div className="text-right">
           <div className="flex items-center gap-1.5 justify-end text-ostrum-primary mb-1">
              <Users size={16} />
              <span className="text-2xl font-black">{server.currentPlayers}</span>
           </div>
           <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
             Лимит: {server.maxPlayers}
           </div>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative h-3 bg-black/40 rounded-full overflow-hidden mb-6 border border-white/5 shadow-inner">
        <div 
          className={`h-full transition-all duration-1000 ease-out rounded-full ${percentage > 90 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-gradient-to-r from-ostrum-primary to-ostrum-secondary shadow-[0_0_10px_rgba(139,92,246,0.5)]'}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-2 gap-3 relative z-10">
        <button 
          id={`copy-btn-${server.id}`}
          onClick={copyIp}
          className="flex items-center justify-center gap-2 bg-white/5 hover:bg-ostrum-primary text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all transform active:scale-95 border border-white/5 hover:border-ostrum-primary shadow-lg"
        >
          <Copy size={16} />
          Подключиться
        </button>
        <a 
          href={server.mapUrl} 
          target="_blank" 
          rel="noreferrer"
          className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-white/5 shadow-lg"
        >
          <Map size={16} />
          Карта
        </a>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
         <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
           Обновлено: {lastUpdate.toLocaleTimeString()}
         </div>
         <div className="flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded text-[9px] text-green-500 font-black uppercase tracking-tighter border border-green-500/20">
            <div className="w-1 h-1 bg-green-500 rounded-full animate-ping"></div>
            Live
         </div>
      </div>
    </div>
  );
};

export default ServerStatus;
