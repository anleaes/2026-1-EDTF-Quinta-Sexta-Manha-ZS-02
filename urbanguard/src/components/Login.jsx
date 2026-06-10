import React, { useState } from 'react';
import { db } from '../services/supabaseClient';
import { Shield, Mail, Lock, User, Info, WifiOff } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (isLoginTab) {
      const { data, error } = await db.login(email, password);
      if (error) {
        setErrorMsg(error.message || 'Credenciais inválidas ou erro de conexão.');
        setLoading(false);
      } else {
        onLoginSuccess(data.user);
      }
    } else {
      if (!fullName.trim()) {
        setErrorMsg('Por favor, informe seu nome completo.');
        setLoading(false);
        return;
      }
      
      const { data, error } = await db.signUp(email, password, fullName);
      if (error) {
        setErrorMsg(error.message || 'Erro ao realizar cadastro.');
        setLoading(false);
      } else {
        setSuccessMsg('Cadastro realizado com sucesso! Faça login para continuar.');
        setIsLoginTab(true);
        setPassword('');
        setLoading(false);
      }
    }
  };

  const handleDemoLogin = async (role) => {
    setLoading(true);
    const demoEmail = role === 'operator' ? 'operador@prefeitura.gov.br' : 'cidadao@exemplo.com';
    const { data } = await db.login(demoEmail, 'demo123', true);
    onLoginSuccess(data.user);
  };

  return (
    <div className="flex-center scrollable-y" style={{ padding: '24px', minHeight: '100vh', width: '100%' }}>
      <div className="glass-panel" style={{ width: '100%', padding: '32px 24px', textAlign: 'center', boxShadow: 'var(--shadow-card)' }}>
        
        <div className="flex-center" style={{ margin: '0 auto 16px auto', width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(0, 242, 254, 0.1)', border: '1px solid rgba(0, 242, 254, 0.25)', boxShadow: '0 0 15px rgba(0, 242, 254, 0.15)' }}>
          <Shield size={36} className="text-cyan" />
        </div>

        <h1 style={{ fontSize: '2rem', marginBottom: '4px', background: 'linear-gradient(135deg, #fff 0%, #a3b8cc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'var(--font-title)' }}>
          UrbanGuard
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '0.9rem' }}>
          Zeladoria Colaborativa & Cidades Inteligentes
        </p>

        {/* Tabs de Controle */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
          <button 
            type="button"
            onClick={() => { setIsLoginTab(true); setErrorMsg(''); }}
            style={{ flex: 1, padding: '12px', background: 'none', border: 'none', color: isLoginTab ? 'var(--cyan)' : 'var(--text-secondary)', borderBottom: isLoginTab ? '2px solid var(--cyan)' : 'none', fontWeight: isLoginTab ? '700' : '500', fontFamily: 'var(--font-title)', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Entrar
          </button>
          <button 
            type="button"
            onClick={() => { setIsLoginTab(false); setErrorMsg(''); }}
            style={{ flex: 1, padding: '12px', background: 'none', border: 'none', color: !isLoginTab ? 'var(--cyan)' : 'var(--text-secondary)', borderBottom: !isLoginTab ? '2px solid var(--cyan)' : 'none', fontWeight: !isLoginTab ? '700' : '500', fontFamily: 'var(--font-title)', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Cadastrar
          </button>
        </div>

        {/* Mensagens de Feedback */}
        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '10px', color: '#ff8a8a', fontSize: '0.85rem', marginBottom: '20px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '10px', color: '#8effc1', fontSize: '0.85rem', marginBottom: '20px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Formulário Principal */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {!isLoginTab && (
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Nome Completo</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                <input 
                  id="fullName"
                  type="text" 
                  className="form-input" 
                  placeholder="Seu nome completo" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ width: '100%', paddingLeft: '44px' }}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">E-mail</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
              <input 
                id="email"
                type="email" 
                className="form-input" 
                placeholder="nome@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', paddingLeft: '44px' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '8px' }}>
            <label className="form-label" htmlFor="password">Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
              <input 
                id="password"
                type="password" 
                className="form-input" 
                placeholder="Sua senha de segurança" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: '44px' }}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ width: '100%', marginTop: '12px' }}
          >
            {loading ? <div className="spinner" style={{ width: '20px', height: '20px', borderTopColor: '#000' }} /> : (isLoginTab ? 'Conectar' : 'Criar Conta')}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '32px 0 24px 0', color: 'var(--text-muted)' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          <span style={{ padding: '0 12px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ou Demonstre Offline</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
        </div>

        {/* Modo Demo / Apresentação sem Internet */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          <button 
            type="button"
            onClick={() => handleDemoLogin('citizen')}
            className="btn-accent"
            style={{ width: '100%', fontSize: '0.85rem' }}
          >
            <WifiOff size={16} />
            Acessar como Cidadão (Demo)
          </button>

          <button 
            type="button"
            onClick={() => handleDemoLogin('operator')}
            className="btn-secondary"
            style={{ width: '100%', fontSize: '0.85rem', borderColor: 'rgba(245, 158, 11, 0.25)', color: 'var(--amber)' }}
          >
            <Shield size={16} />
            Acessar como Prefeitura (Demo)
          </button>

        </div>

      </div>
    </div>
  );
}
