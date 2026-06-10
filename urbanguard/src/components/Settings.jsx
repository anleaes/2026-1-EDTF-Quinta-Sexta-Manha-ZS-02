import React, { useState } from 'react';
import { db } from '../services/supabaseClient';
import { ai } from '../services/geminiService';
import { ChevronLeft, Save, ShieldAlert, Key, Database, RefreshCw, Eye, EyeOff } from 'lucide-react';

export default function Settings({ onCancel, refreshData }) {
  const [supabaseUrl, setSupabaseUrl] = useState(localStorage.getItem('urbanguard_supabase_url') || '');
  const [supabaseKey, setSupabaseKey] = useState(localStorage.getItem('urbanguard_supabase_key') || '');
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('urbanguard_gemini_key') || '');
  const [forceDemo, setForceDemo] = useState(localStorage.getItem('urbanguard_force_demo') === 'true');

  const [showSupaKey, setShowSupaKey] = useState(false);
  const [showGemKey, setShowGemKey] = useState(false);
  
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setSuccessMsg('');

    // Salva chaves Supabase
    if (supabaseUrl.trim() && supabaseKey.trim()) {
      localStorage.setItem('urbanguard_supabase_url', supabaseUrl.trim());
      localStorage.setItem('urbanguard_supabase_key', supabaseKey.trim());
    } else {
      localStorage.removeItem('urbanguard_supabase_url');
      localStorage.removeItem('urbanguard_supabase_key');
    }

    // Salva chave Gemini
    ai.setApiKey(geminiKey.trim());

    // Salva estado do Modo Demo
    db.setForceDemo(forceDemo);

    setTimeout(() => {
      setSaveLoading(false);
      setSuccessMsg('Configurações salvas com sucesso!');
      db.loadClientConfig(); // Recarrega conexões
      refreshData();
    }, 800);
  };

  const clearDatabase = () => {
    if (window.confirm('Deseja limpar todos os dados simulados do LocalStorage? Isso resetará os pins do mapa.')) {
      localStorage.removeItem('urbanguard_mock_incidents');
      localStorage.removeItem('urbanguard_mock_reports');
      localStorage.removeItem('urbanguard_mock_votes');
      window.location.reload();
    }
  };

  return (
    <div className="scrollable-y" style={{ width: '100%', padding: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button 
          type="button" 
          onClick={onCancel} 
          className="btn-secondary" 
          style={{ padding: '8px', borderRadius: '50%' }}
        >
          <ChevronLeft size={20} />
        </button>
        <h2 style={{ fontSize: '1.25rem' }}>Configurações do Sistema</h2>
      </div>

      {successMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '10px', color: '#8effc1', fontSize: '0.85rem', marginBottom: '20px' }}>
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Toggle Modo Demo */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '3px solid var(--amber)' }}>
          <div style={{ textAlign: 'left', paddingRight: '10px' }}>
            <p style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--amber)' }}>Forçar Modo Demonstração</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Ignora os servidores Supabase e usa apenas o banco local do navegador. Essencial para apresentações sem sinal de rede.
            </p>
          </div>
          <input 
            type="checkbox" 
            checked={forceDemo}
            onChange={(e) => setForceDemo(e.target.checked)}
            style={{ width: '22px', height: '22px', accentColor: 'var(--amber)', cursor: 'pointer' }}
          />
        </div>

        {/* Supabase Config */}
        <div className="glass-card" style={{ textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Database size={16} className="text-cyan" />
            <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--cyan)' }}>Banco de Dados Supabase</h3>
          </div>

          <div className="form-group">
            <label className="form-label">URL do Projeto</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="https://xyz.supabase.co" 
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              disabled={forceDemo}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Chave Anon Key</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showSupaKey ? 'text' : 'password'} 
                className="form-input" 
                placeholder="eyJhbGciOi..." 
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                style={{ width: '100%', paddingRight: '44px' }}
                disabled={forceDemo}
              />
              <button
                type="button"
                onClick={() => setShowSupaKey(!showSupaKey)}
                style={{ position: 'absolute', right: '12px', top: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                disabled={forceDemo}
              >
                {showSupaKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Gemini Config */}
        <div className="glass-card" style={{ textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Key size={16} className="text-cyan" />
            <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--cyan)' }}>Google Generative AI (Gemini)</h3>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">API Key do Gemini 1.5 Flash</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showGemKey ? 'text' : 'password'} 
                className="form-input" 
                placeholder="AIzaSy..." 
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                style={{ width: '100%', paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowGemKey(!showGemKey)}
                style={{ position: 'absolute', right: '12px', top: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {showGemKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Se deixado em branco, o aplicativo utilizará um simulador de visão computacional local muito realista para a apresentação.
            </p>
          </div>
        </div>

        {/* Detalhes de LGPD */}
        <div className="glass-card" style={{ textAlign: 'left', borderLeft: '3px solid var(--emerald)', background: 'rgba(16, 185, 129, 0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <ShieldAlert size={16} className="text-emerald" />
            <h4 style={{ fontSize: '0.85rem', color: 'var(--emerald)' }}>Salvaguardas de Privacidade & LGPD</h4>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            O prompt do modelo do Gemini 1.5 Flash está configurado por padrão para ignorar e não armazenar dados de identificação pessoal (rostos ou placas de carros) capturados na mídias. As ocorrências gravadas no banco não indexam esses metadados pessoais.
          </p>
        </div>

        {/* Botão de Gravar */}
        <button 
          type="submit" 
          className="btn-primary" 
          disabled={saveLoading}
          style={{ width: '100%' }}
        >
          {saveLoading ? <RefreshCw size={18} className="spinner" style={{ borderTopColor: '#000' }} /> : (
            <>
              <Save size={18} />
              <span>Gravar Configurações</span>
            </>
          )}
        </button>

        {/* Resetar Demo */}
        {forceDemo && (
          <button 
            type="button" 
            onClick={clearDatabase}
            className="btn-secondary"
            style={{ width: '100%', borderColor: 'rgba(239, 68, 68, 0.25)', color: 'var(--crimson)' }}
          >
            Limpar Banco Simulado (Reset)
          </button>
        )}

      </form>
    </div>
  );
}
