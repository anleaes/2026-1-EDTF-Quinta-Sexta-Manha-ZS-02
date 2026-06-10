import { Map, Camera, Clock } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'mapa' | 'historico' | 'reportar';
  onChangeTab: (tab: 'mapa' | 'historico' | 'reportar') => void;
}

export function BottomNav({ activeTab, onChangeTab }: BottomNavProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 h-16 bg-card border-t border-border flex items-center justify-around pb-safe">
      
      {/* Mapa tab */}
      <button
        onClick={() => onChangeTab('mapa')}
        className={`flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] transition-colors ${
          activeTab === 'mapa' ? 'text-primary' : 'text-[#9E9E9E]'
        }`}
      >
        <Map className="w-5 h-5" />
        <span className="text-[10px] font-medium">Mapa</span>
      </button>

      {/* Center camera FAB */}
      <div className="relative -top-4">
        <button 
          onClick={() => onChangeTab('reportar')}
          className="w-14 h-14 bg-primary rounded-full shadow-[0_4px_15px_rgba(0,242,254,0.3)] flex items-center justify-center active:scale-90 transition-transform"
        >
          <Camera className="w-6 h-6 text-primary-foreground" />
        </button>
      </div>

      {/* Histórico tab */}
      <button
        onClick={() => onChangeTab('historico')}
        className={`flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] transition-colors ${
          activeTab === 'historico' ? 'text-primary' : 'text-[#9E9E9E]'
        }`}
      >
        <Clock className="w-5 h-5" />
        <span className="text-[10px] font-medium">Histórico</span>
      </button>
      
    </div>
  );
}
