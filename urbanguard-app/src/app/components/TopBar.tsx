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
    <div 
      className="absolute top-0 left-0 right-0 z-30"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)',
        paddingLeft: 'max(env(safe-area-inset-left, 0px), 12px)',
        paddingRight: 'max(env(safe-area-inset-right, 0px), 12px)',
        paddingBottom: '8px',
        background: 'linear-gradient(to bottom, rgba(6, 9, 19, 0.85) 0%, rgba(6, 9, 19, 0.6) 70%, transparent 100%)',
      }}
    >
      <div className="flex items-center gap-2">
        {/* Search bar */}
        <div 
          className="flex-1 min-w-0 h-12 rounded-full px-3 flex items-center gap-2"
          style={{
            background: 'rgba(22, 33, 58, 0.7)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder={`Olá, ${userName}`}
            onChange={(e) => onSearch(e.target.value)}
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm"
          />
        </div>

        {/* Profile avatar button */}
        <button 
          onClick={onSettingsClick}
          title="Configurações"
          className="w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{
            background: 'rgba(22, 33, 58, 0.7)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
        </button>

        {/* Notification bell */}
        <button 
          onClick={onNotificationClick}
          title="Histórico de Notificações"
          className="w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center active:scale-90 transition-transform relative"
          style={{
            background: 'rgba(22, 33, 58, 0.7)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Bell className="w-5 h-5 text-foreground" />
          <div 
            className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full"
            style={{ background: '#EF4444', border: '2px solid rgba(22, 33, 58, 0.7)' }}
          />
        </button>
      </div>
    </div>
  );
}
