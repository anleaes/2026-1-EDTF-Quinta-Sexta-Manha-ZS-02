import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { db, Incident } from '../../services/supabaseClient';
import { Sidebar } from '../components/admin/Sidebar';
import { KPICards } from '../components/admin/KPICards';
import { AdminMap } from '../components/admin/AdminMap';
import { IncidentQueue } from '../components/admin/IncidentQueue';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const { data } = await db.getIncidents();
    if (data) {
      setIncidents(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    const currentUser = db.getCurrentUser();
    // Verifica se o usuário está logado e se é operador
    if (!currentUser || currentUser.role !== 'operator') {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    loadData();

    // Polling a cada 15 segundos para atualizar as ocorrências em tempo real
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = async () => {
    await db.logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar onLogout={handleLogout} user={user} />

      <main className="flex-1 overflow-auto pt-14 lg:pt-0">
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="mb-6 lg:mb-8 flex justify-between items-center text-left">
            <div>
              <h1 className="text-2xl lg:text-3xl font-semibold text-foreground mb-1">UrbanGuard Admin</h1>
              <p className="text-sm text-muted-foreground">Painel de Administração Municipal</p>
            </div>
            <div className="text-xs text-muted-foreground bg-card px-3 py-1.5 rounded-lg border border-border">
              Olá, <strong>{user.full_name}</strong>
            </div>
          </div>

          {/* KPI Cards */}
          <KPICards incidents={incidents} />

          {/* Map and Queue */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-4 lg:gap-6 mt-4 lg:mt-6">
            <AdminMap incidents={incidents} />
            <IncidentQueue incidents={incidents} onUpdateStatus={loadData} />
          </div>
        </div>
      </main>
    </div>
  );
}
