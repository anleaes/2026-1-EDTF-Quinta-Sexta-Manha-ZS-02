import { LayoutDashboard, AlertTriangle, ClipboardList, Settings, Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  onLogout: () => void;
  user: {
    full_name: string;
    email: string;
  };
}

export function Sidebar({ onLogout, user }: SidebarProps) {
  const [activeItem, setActiveItem] = useState('visao-geral');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'visao-geral', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'incidentes-criticos', label: 'Incidentes Críticos', icon: AlertTriangle },
    { id: 'ordens-servico', label: 'Ordens de Serviço', icon: ClipboardList },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  const getInitials = (name: string) => {
    return (name || 'US')
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">UrbanGuard</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-10 h-10 flex items-center justify-center text-foreground"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-card border-r border-border flex flex-col z-40 transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo (desktop only) */}
        <div className="hidden lg:flex h-16 px-6 items-center gap-3 border-b border-border">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">UrbanGuard</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 mt-14 lg:mt-0">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveItem(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-border flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-muted rounded-full flex items-center justify-center text-sm font-semibold text-foreground">
              {getInitials(user.full_name)}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-foreground truncate">{user.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="w-full h-9 bg-destructive/10 text-destructive text-xs font-semibold rounded hover:bg-destructive/20 transition-all"
          >
            Sair do Painel
          </button>
        </div>
      </aside>
    </>
  );
}
