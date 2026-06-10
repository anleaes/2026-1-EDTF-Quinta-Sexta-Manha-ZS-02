import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { MapView } from '../components/MapView';
import { TopBar } from '../components/TopBar';
import { BottomSheet } from '../components/BottomSheet';
import { BottomNav } from '../components/BottomNav';
import { db, Incident } from '../../services/supabaseClient';
import ReportForm from '../components/ReportForm';
import Settings from '../components/Settings';
import { Calendar, Eye, FileText, CheckCircle, Clock, Award } from 'lucide-react';

export function MobileApp() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  
  // States de Dados
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Navigation Tabs e Overlays
  const [activeTab, setActiveTab] = useState<'mapa' | 'historico' | 'reportar'>('mapa');
  const [settingsActive, setSettingsActive] = useState(false);

  // Carrega incidente e autenticação
  const loadData = async () => {
    const { data } = await db.getIncidents();
    if (data) setIncidents(data);
  };

  useEffect(() => {
    const currentUser = db.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    loadData();

    // Polling automático
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = async () => {
    await db.logout();
    navigate('/login');
  };

  // Filtra ocorrências com base na busca
  const filteredIncidents = incidents.filter(inc => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      inc.address.toLowerCase().includes(term) ||
      inc.category.toLowerCase().includes(term)
    );
  });

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      'buraco': 'Buraco na Via',
      'iluminacao': 'Iluminação Apagada',
      'semaforo': 'Semáforo Defeituoso',
      'vandalismo': 'Pichação / Vandalismo',
      'saneamento': 'Vazamento / Esgoto',
      'outros': 'Outros Danos'
    };
    return labels[cat] || cat;
  };

  if (!user) return null;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      
      {/* Renderização de Telas */}
      {settingsActive ? (
        // --- CONFIGURAÇÕES ---
        <div className="w-full h-full overflow-y-auto pb-20 bg-background">
          <Settings 
            onCancel={() => setSettingsActive(false)} 
            refreshData={loadData} 
            onLogout={handleLogout}
          />
        </div>
      ) : activeTab === 'reportar' ? (
        // --- FORMULÁRIO DE REPORTE (CÂMERA/GPS) ---
        <div className="w-full h-full overflow-y-auto pb-20 bg-background">
          <ReportForm 
            onCancel={() => setActiveTab('mapa')} 
            onSubmitSuccess={() => {
              loadData();
              setActiveTab('mapa');
            }} 
          />
        </div>
      ) : activeTab === 'historico' ? (
        // --- LISTA HISTÓRICA DO CIDADÃO ---
        <div className="w-full h-full overflow-y-auto pt-24 pb-20 px-6 bg-background">
          
          {/* Gamificação / Card de Perfil */}
          <div className="bg-card p-4 rounded-xl border border-border mb-6 flex items-center gap-4 text-left max-w-md mx-auto">
            <div className="w-12 h-12 bg-primary/10 border border-primary/25 rounded-full flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-bold uppercase">Fiscal do Bairro</div>
              <div className="text-base font-extrabold text-foreground">{user.full_name}</div>
              <div className="text-xs text-primary font-bold">120 pontos acumulados</div>
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-foreground mb-4 text-left">Histórico de Ocorrências</h3>
            
            {filteredIncidents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                Nenhum incidente cadastrado ou localizado.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => {
                      setSelectedIncident(inc);
                      setActiveTab('mapa'); // Vai para o mapa e foca
                    }}
                    className={`p-4 bg-card rounded-xl border border-border flex items-center justify-between cursor-pointer transition-all hover:translate-y-[-2px] text-left ${
                      inc.status === 'reaberto_por_reincidencia' ? 'border-l-4 border-l-destructive' : (inc.status === 'resolvido' ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-primary')
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-foreground">
                          {getCategoryLabel(inc.category)}
                        </span>
                        {inc.status === 'reaberto_por_reincidencia' && (
                          <span className="px-1.5 py-0.5 bg-red-500/10 text-red-400 text-[8px] font-extrabold rounded uppercase tracking-wider animate-pulse">Reincidente</span>
                        )}
                        {inc.status === 'resolvido' && (
                          <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-extrabold rounded uppercase tracking-wider">Resolvido</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate max-w-[280px]">
                        {inc.address}
                      </p>
                      <span className="text-[10px] text-muted-foreground block mt-2">
                        Prioridade: <strong className="text-foreground">{inc.severity_score.toFixed(1)}</strong>
                      </span>
                    </div>
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // --- MAPA PRINCIPAL ---
        <div className="w-full h-full relative">
          <MapView 
            incidents={filteredIncidents} 
            selectedIncident={selectedIncident}
            onSelectIncident={setSelectedIncident}
          />
          
          {/* Drawer de Detalhes Inferior (BottomSheet) */}
          {selectedIncident && (
            <BottomSheet 
              incident={selectedIncident} 
              onClose={() => setSelectedIncident(null)}
              onSupportSuccess={loadData}
            />
          )}
        </div>
      )}

      {/* TopBar (Disponível no Mapa ou Histórico, oculta em formulários/settings) */}
      {!settingsActive && activeTab !== 'reportar' && (
        <TopBar 
          onLogout={handleLogout} 
          onSettingsClick={() => setSettingsActive(true)}
          onSearch={setSearchTerm}
          onNotificationClick={() => setActiveTab('historico')}
        />
      )}

      {/* Bottom Navigation Fixo */}
      <BottomNav 
        activeTab={activeTab} 
        onChangeTab={(tab) => {
          setSettingsActive(false);
          setActiveTab(tab);
        }}
      />

    </div>
  );
}
