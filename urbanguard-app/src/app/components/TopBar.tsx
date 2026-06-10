import { Search, Bell, User } from 'lucide-react';
import { db } from '../../services/supabaseClient';

interface TopBarProps {
  onLogout: () => void;
  onSettingsClick: () => void;
  onSearch: (term: string) => void;
  onNotificationClick: () => void;
}

export function TopBar({ onLogout, onSettingsClick, onSearch, onNotificationClick }: TopBarProps) {
  const user = db.getCurrentUser();
  const userName = user ? user.full_name : 'Cidadão';

  return (
    <div className="absolute top-0 left-0 right-0 z-30 p-4 pt-6">
      <div className="flex items-center gap-3">
        {/* Search bar */}
        <div className="flex-1 h-14 bg-white/95 backdrop-blur-sm rounded-[28px] shadow-[0_2px_8px_rgba(0,0,0,0.12)] px-4 flex items-center gap-3">
          <Search className="w-6 h-6 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder={`Olá, ${userName}. Buscar...`}
            onChange={(e) => onSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm"
          />
        </div>

        {/* Profile avatar button (triggers Settings) */}
        <button 
          onClick={onSettingsClick}
          title="Configurações"
          className="w-14 h-14 min-w-[56px] bg-white/95 backdrop-blur-sm rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.12)] flex items-center justify-center active:opacity-60 transition-opacity"
        >
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
        </button>

        {/* Notification bell (triggers Historico) */}
        <button 
          onClick={onNotificationClick}
          title="Histórico de Notificações"
          className="w-14 h-14 min-w-[56px] bg-white/95 backdrop-blur-sm rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.12)] flex items-center justify-center active:opacity-60 transition-opacity relative"
        >
          <Bell className="w-6 h-6 text-foreground" />
          {/* Notification badge */}
          <div className="absolute top-2 right-2 w-3 h-3 bg-destructive rounded-full border-2 border-white"></div>
        </button>
      </div>
    </div>
  );
}
