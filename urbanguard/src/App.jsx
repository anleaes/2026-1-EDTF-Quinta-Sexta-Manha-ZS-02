import React, { useState, useEffect } from 'react';
import { db } from './services/supabaseClient';
import Login from './components/Login';
import MapContainer from './components/MapContainer';
import ReportForm from './components/ReportForm';
import HistoryList from './components/HistoryList';
import Settings from './components/Settings';
import { Map, Camera, FileText, Settings as SettingsIcon, LogOut, Sliders, Shield, ShieldAlert } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('map'); // 'map' | 'report' | 'history' | 'settings'
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  
  // Filtros de busca
  const [activeFilters, setActiveFilters] = useState({ category: 'all', status: 'all' });
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Recarrega dados do banco de dados
  const loadIncidents = async () => {
    const { data } = await db.getIncidents();
    if (data) {
      setIncidents(data);
    }
  };

  // Verifica se já existe login salvo
  useEffect(() => {
    const savedUser = db.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
    loadIncidents();
  }, []);

  // Polling automático leve de 15 segundos para atualizar pins
  useEffect(() => {
    const timer = setInterval(() => {
      loadIncidents();
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    loadIncidents();
    setCurrentScreen('map');
  };

  const handleLogout = async () => {
    await db.logout();
    setUser(null);
    setSelectedIncident(null);
    setCurrentScreen('map');
  };

  const handleReportSubmitSuccess = () => {
    loadIncidents();
    setCurrentScreen('map');
    alert('Incidente registrado com sucesso!');
  };

  // Se não estiver logado, exibe tela de login
  if (!user) {
    return (
      <div className="app-container flex-center">
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="app-container">
      
      {/* 🛡️ Header Fixo Superior */}
      <header className="glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 50, flexShrink: 0 }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'var(--font-title)', fontWeight: '800', fontSize: '1.1rem', background: 'linear-gradient(135deg, #fff 0%, #a3b8cc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              UrbanGuard
            </span>
            <span style={{ fontSize: '0.65rem', color: user.role === 'operator' ? 'var(--amber)' : 'var(--cyan)', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>
              {user.role === 'operator' ? <Shield size={10} /> : <ShieldAlert size={10} />}
              {user.role === 'operator' ? 'Operador Municipal' : 'Fiscal Cidadão'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Botão de Filtro (Disponível apenas no Mapa ou Histórico) */}
          {(currentScreen === 'map' || currentScreen === 'history') && (
            <button 
              type="button"
              onClick={() => setShowFiltersModal(true)}
              className="btn-secondary"
              style={{ padding: '8px', borderRadius: '50%', border: activeFilters.category !== 'all' || activeFilters.status !== 'all' ? '1px solid var(--cyan)' : '1px solid var(--border-color)' }}
            >
              <Sliders size={18} className={activeFilters.category !== 'all' || activeFilters.status !== 'all' ? 'text-cyan' : 'text-primary'} />
            </button>
          )}

          {/* Botão Configurações */}
          <button 
            type="button"
            onClick={() => setCurrentScreen('settings')}
            className="btn-secondary"
            style={{ padding: '8px', borderRadius: '50%' }}
          >
            <SettingsIcon size={18} />
          </button>

          {/* Botão Logout */}
          <button 
            type="button"
            onClick={handleLogout}
            className="btn-secondary"
            style={{ padding: '8px', borderRadius: '50%', borderColor: 'rgba(239, 68, 68, 0.2)' }}
          >
            <LogOut size={18} className="text-crimson" />
          </button>
        </div>

      </header>

      {/* 🌐 Área Principal de Conteúdo */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        
        {currentScreen === 'map' && (
          <MapContainer 
            incidents={incidents}
            activeFilters={activeFilters}
            user={user}
            onSelectIncident={(inc) => {
              setSelectedIncident(inc);
              setCurrentScreen('history'); // Redireciona para exibir detalhes no drawer de histórico
            }}
            refreshData={loadIncidents}
          />
        )}

        {currentScreen === 'report' && (
          <ReportForm 
            onCancel={() => setCurrentScreen('map')}
            onSubmitSuccess={handleReportSubmitSuccess}
          />
        )}

        {currentScreen === 'history' && (
          <HistoryList 
            incidents={incidents}
            user={user}
            refreshData={loadIncidents}
            activeFilters={activeFilters}
            selectedIncident={selectedIncident}
            onSelectIncident={setSelectedIncident}
          />
        )}

        {currentScreen === 'settings' && (
          <Settings 
            onCancel={() => setCurrentScreen('map')}
            refreshData={loadIncidents}
          />
        )}

      </main>

      {/* 🧭 Barra de Navegação Inferior Móvel */}
      <nav className="glass-panel" style={{ borderRadius: 0, borderBottom: 'none', borderLeft: 'none', borderRight: 'none', display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '68px', padding: '0 8px', zIndex: 50, flexShrink: 0 }}>
        
        {/* Guia Mapa */}
        <button
          type="button"
          onClick={() => { setSelectedIncident(null); setCurrentScreen('map'); }}
          style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', color: currentScreen === 'map' ? 'var(--cyan)' : 'var(--text-muted)' }}
        >
          <Map size={22} />
          <span style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>Mapa</span>
        </button>

        {/* Guia Principal Reportar (Câmera flutuante - Apenas Cidadão) */}
        {user.role === 'citizen' && (
          <button
            type="button"
            onClick={() => setCurrentScreen('report')}
            className="btn-primary"
            style={{ borderRadius: '50%', width: '56px', height: '56px', marginTop: '-24px', padding: 0, border: '4px solid var(--bg-dark)', zIndex: 100 }}
          >
            <Camera size={26} />
          </button>
        )}

        {/* Guia Ocorrências */}
        <button
          type="button"
          onClick={() => setCurrentScreen('history')}
          style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', color: currentScreen === 'history' ? 'var(--cyan)' : 'var(--text-muted)' }}
        >
          <FileText size={22} />
          <span style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>Histórico</span>
        </button>

      </nav>

      {/* 🎚️ Modal Suspenso de Filtros */}
      {showFiltersModal && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '75px 20px 20px 20px', backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ width: '100%', padding: '20px', textAlign: 'left', boxShadow: 'var(--shadow-card)' }}>
            
            <h3 style={{ fontSize: '1rem', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              Filtrar Ocorrências
            </h3>

            {/* Filtro Categoria */}
            <div className="form-group">
              <label className="form-label">Categoria</label>
              <select 
                value={activeFilters.category} 
                onChange={(e) => setActiveFilters({ ...activeFilters, category: e.target.value })}
                className="form-select"
                style={{ width: '100%' }}
              >
                <option value="all">Todas as Categorias</option>
                <option value="buraco">Buracos na Via</option>
                <option value="iluminacao">Iluminação Pública</option>
                <option value="semaforo">Semáforos com Defeito</option>
                <option value="vandalismo">Vandalismo</option>
                <option value="saneamento">Saneamento</option>
              </select>
            </div>

            {/* Filtro Status */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Status</label>
              <select 
                value={activeFilters.status} 
                onChange={(e) => setActiveFilters({ ...activeFilters, status: e.target.value })}
                className="form-select"
                style={{ width: '100%' }}
              >
                <option value="all">Todos os Status</option>
                <option value="aberto">Abertos</option>
                <option value="em_manutencao">Em Manutenção</option>
                <option value="resolvido">Resolvidos</option>
                <option value="reaberto_por_reincidencia">Reincidentes</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => {
                  setActiveFilters({ category: 'all', status: 'all' });
                  setShowFiltersModal(false);
                }}
                className="btn-secondary"
                style={{ flex: 1, fontSize: '0.85rem' }}
              >
                Limpar
              </button>
              <button 
                type="button" 
                onClick={() => setShowFiltersModal(false)}
                className="btn-primary"
                style={{ flex: 1, fontSize: '0.85rem' }}
              >
                Aplicar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
