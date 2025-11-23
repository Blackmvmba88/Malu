import React, { useEffect, useState } from 'react';
import { HistoryItem, getHistory, generateMockFeedItem } from '../services/storageService';
import { Play, User, Globe, Clock, Heart } from 'lucide-react';

interface HistoryFeedProps {
  themeColor: string;
  onLoadItem: (text: string) => void;
  lastGeneratedId?: string; // Trigger refresh
}

const HistoryFeed: React.FC<HistoryFeedProps> = ({ themeColor, onLoadItem, lastGeneratedId }) => {
  const [myHistory, setMyHistory] = useState<HistoryItem[]>([]);
  const [globalFeed, setGlobalFeed] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'mine' | 'global'>('mine');

  // Load history on mount and when new item generated
  useEffect(() => {
    setMyHistory(getHistory());
  }, [lastGeneratedId]);

  // Simulate Global Feed updates
  useEffect(() => {
    // Initial population
    const initialFeed = Array(3).fill(null).map(generateMockFeedItem);
    setGlobalFeed(initialFeed);

    const interval = setInterval(() => {
      setGlobalFeed(prev => [generateMockFeedItem(), ...prev].slice(0, 10));
    }, 8000); // New item every 8 seconds

    return () => clearInterval(interval);
  }, []);

  const getThemeStyles = () => {
    switch(themeColor) {
        case 'blue': return 'text-sky-400 bg-sky-500';
        case 'red': return 'text-rose-400 bg-rose-500';
        case 'purple': return 'text-violet-400 bg-violet-500';
        case 'emerald': return 'text-emerald-400 bg-emerald-500';
        default: return 'text-amber-400 bg-amber-500';
    }
  };

  const themeClass = getThemeStyles();
  const txtColor = themeClass.split(' ')[0];
  const bgColor = themeClass.split(' ')[1]; // class for background items

  const itemsToShow = activeTab === 'mine' ? myHistory : globalFeed;

  return (
    <div className="w-full max-w-3xl mt-12 mb-12">
      <div className="flex items-center gap-6 mb-6 border-b border-white/10 pb-2">
        <button 
            onClick={() => setActiveTab('mine')}
            className={`flex items-center gap-2 pb-2 text-sm font-bold uppercase tracking-wider transition-all ${
                activeTab === 'mine' ? `${txtColor} border-b-2 border-current` : 'text-gray-500 hover:text-gray-300'
            }`}
        >
            <Clock className="w-4 h-4" />
            Mi Historial
        </button>
        <button 
            onClick={() => setActiveTab('global')}
            className={`flex items-center gap-2 pb-2 text-sm font-bold uppercase tracking-wider transition-all ${
                activeTab === 'global' ? `${txtColor} border-b-2 border-current` : 'text-gray-500 hover:text-gray-300'
            }`}
        >
            <Globe className="w-4 h-4" />
            Feed Global
            <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${bgColor}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${bgColor}`}></span>
            </span>
        </button>
      </div>

      <div className="space-y-4">
        {itemsToShow.length === 0 ? (
            <div className="text-center py-8 text-gray-500 italic">
                {activeTab === 'mine' ? "Aún no has generado ningún audio." : "Conectando con el servidor..."}
            </div>
        ) : (
            itemsToShow.map((item) => (
                <div key={item.id} className="bg-white/5 border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all hover:bg-white/10 group">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                                <User className="w-3 h-3 text-gray-300" />
                            </div>
                            <span className="text-xs font-bold text-gray-300">{item.user}</span>
                            <span className="text-[10px] text-gray-500">• {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full bg-black/50 border border-white/10 ${item.style === 'epic' ? 'text-yellow-500' : 'text-blue-400'}`}>
                                {item.style === 'epic' ? 'ÉPICO' : 'PRO'}
                            </span>
                        </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-3 italic line-clamp-2">"{item.generatedScript}"</p>
                    
                    <div className="flex justify-between items-center">
                        <div className="flex gap-4 text-xs text-gray-500">
                             <button className="flex items-center gap-1 hover:text-red-400 transition-colors">
                                <Heart className="w-3 h-3" /> {item.likes}
                             </button>
                        </div>
                        
                        {activeTab === 'mine' && (
                             <button 
                                onClick={() => onLoadItem(item.originalText)}
                                className={`text-xs flex items-center gap-1 font-bold ${txtColor} opacity-0 group-hover:opacity-100 transition-opacity`}
                            >
                                <Play className="w-3 h-3" /> REUTILIZAR
                             </button>
                        )}
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default HistoryFeed;
