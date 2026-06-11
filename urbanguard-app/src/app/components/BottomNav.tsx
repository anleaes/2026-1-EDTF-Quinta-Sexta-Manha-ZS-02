import { Map, Camera, Clock } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'mapa' | 'historico' | 'reportar';
  onChangeTab: (tab: 'mapa' | 'historico' | 'reportar') => void;
}

export function BottomNav({ activeTab, onChangeTab }: BottomNavProps) {
  return (
    <div 
      className="absolute bottom-0 left-0 right-0 z-50"
      style={{
        background: 'linear-gradient(to top, #060913 70%, rgba(6, 9, 19, 0.95) 85%, rgba(6, 9, 19, 0) 100%)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
      }}
    >
      <div className="flex items-center justify-around px-4 pt-2 pb-2">
        {/* Mapa tab */}
        <button
          onClick={() => onChangeTab('mapa')}
          className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl transition-all ${
            activeTab === 'mapa' 
              ? 'text-primary bg-primary/10' 
              : 'text-[#9E9E9E] active:text-foreground'
          }`}
          style={{ minWidth: '64px', minHeight: '48px' }}
        >
          <Map className="w-6 h-6" />
          <span className="text-[11px] font-semibold">Mapa</span>
        </button>

        {/* Center camera FAB */}
        <button 
          onClick={() => onChangeTab('reportar')}
          className="relative -top-5 w-16 h-16 bg-primary rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{
            boxShadow: '0 4px 20px rgba(0, 242, 254, 0.4), 0 0 40px rgba(0, 242, 254, 0.15)',
          }}
        >
          <Camera className="w-7 h-7 text-primary-foreground" />
        </button>

        {/* Histórico tab */}
        <button
          onClick={() => onChangeTab('historico')}
          className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl transition-all ${
            activeTab === 'historico' 
              ? 'text-primary bg-primary/10' 
              : 'text-[#9E9E9E] active:text-foreground'
          }`}
          style={{ minWidth: '64px', minHeight: '48px' }}
        >
          <Clock className="w-6 h-6" />
          <span className="text-[11px] font-semibold">Histórico</span>
        </button>
      </div>
    </div>
  );
}
