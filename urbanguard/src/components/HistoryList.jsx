import React, { useState, useEffect } from 'react';
import { db } from '../services/supabaseClient';
import { Flame, CheckCircle, Clock, Award, Shield, FileText, ChevronRight, ThumbsUp, Send, User } from 'lucide-react';

export default function HistoryList({ incidents, user, refreshData, activeFilters, selectedIncident, onSelectIncident }) {
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [supportLoading, setSupportLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  // Carrega relatos filhos (timeline) quando um incidente pai é selecionado
  useEffect(() => {
    if (!selectedIncident) return;
    
    const fetchTimeline = async () => {
      setLoadingReports(true);
      const { data } = await db.getReports(selectedIncident.id);
      if (data) {
        setReports(data);
      }
      setLoadingReports(false);
    };

    fetchTimeline();
  }, [selectedIncident]);

  const handleSupportClick = async () => {
    if (!selectedIncident) return;
    setSupportLoading(true);
    const { error } = await db.supportIncident(selectedIncident.id);
    if (error) {
      alert(error.message || 'Erro ao apoiar ocorrência.');
    } else {
      refreshData();
      // Recarrega detalhes do incidente selecionado
      const listRes = await db.getIncidents();
      const updated = listRes.data.find(i => i.id === selectedIncident.id);
      if (updated) onSelectIncident(updated);
    }
    setSupportLoading(false);
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedIncident) return;
    setStatusLoading(true);
    
    // Insere um relato automático da prefeitura justificando a alteração de status
    const statusDescriptions = {
      'em_manutencao': 'Equipe de manutenção urbana enviada ao local. Ordem de Serviço aberta.',
      'resolvido': 'Manutenção concluída com sucesso. Local limpo e vistoriado.'
    };

    const payload = {
      photoUrl: selectedIncident.category === 'semaforo'
        ? 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800' // Placeholder sinaleira arrumada
        : 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=800',
      description: statusDescriptions[newStatus] || `Status alterado para ${newStatus}.`,
      latitude: selectedIncident.latitude,
      longitude: selectedIncident.longitude,
      category: selectedIncident.category,
      severity: selectedIncident.severity_score,
      aiAnalysis: { category: selectedIncident.category, severity: selectedIncident.severity_score, sanitized: true, summary: 'Manutenção municipal.' }
    };

    // Submete a alteração de status e anexa foto
    await db.updateIncidentStatus(selectedIncident.id, newStatus);
    await db.submitReport(payload);
    
    refreshData();
    const listRes = await db.getIncidents();
    const updated = listRes.data.find(i => i.id === selectedIncident.id);
    if (updated) onSelectIncident(updated);
    setStatusLoading(false);
  };

  // Mapeia categoria para texto legível
  const getCategoryLabel = (cat) => {
    const labels = {
      'buraco': 'Buraco na Via',
      'iluminacao': 'Iluminação Pública',
      'semaforo': 'Semáforo com Defeito',
      'vandalismo': 'Vandalismo / Pichação',
      'saneamento': 'Vazamento / Esgoto',
      'outros': 'Outros Danos'
    };
    return labels[cat] || cat;
  };

  // Mapeia status para classes e texto do badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'aberto':
        return <span className="badge badge-open">Aberto</span>;
      case 'em_manutencao':
        return <span className="badge badge-maintenance">Em Reparo</span>;
      case 'resolvido':
        return <span className="badge badge-resolved">Resolvido</span>;
      case 'reaberto_por_reincidencia':
        return <span className="badge badge-reincident">Reincidente</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  // Estatísticas simuladas baseadas em incidentes
  const totalActives = incidents.filter(i => i.status !== 'resolvido').length;
  const totalResolved = incidents.filter(i => i.status === 'resolvido').length;
  // Gamificação: pontos baseados em atividade (Demo)
  const userScore = user?.role === 'operator' ? 450 : 120;
  const badgeName = user?.role === 'operator' ? 'Gestor de Smart City' : 'Fiscal do Bairro';

  // --- RF12: Mockup de Geração de Ordem de Serviço (OS PDF) ---
  const handlePrintOS = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Ordem de Serviço - UrbanGuard</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { border-bottom: 2px solid #00f2fe; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 24px; font-weight: bold; margin: 0; }
            .os-number { font-size: 16px; color: #666; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .info-card { background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #ddd; }
            .label { font-size: 11px; text-transform: uppercase; color: #888; font-weight: bold; }
            .value { font-size: 15px; margin-top: 4px; font-weight: bold; }
            .photo-box { text-align: center; border: 1px solid #ddd; padding: 10px; border-radius: 8px; margin-bottom: 30px; }
            .photo { max-width: 100%; max-height: 250px; object-fit: cover; border-radius: 4px; }
            .footer { margin-top: 50px; border-top: 1px solid #ddd; padding-top: 30px; display: flex; justify-content: space-between; }
            .signature { border-top: 1px solid #333; width: 200px; text-align: center; padding-top: 8px; font-size: 12px; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">🛡️ UrbanGuard - Ordem de Serviço</div>
              <div class="os-number">OS #${selectedIncident.id.substring(0, 8).toUpperCase()}</div>
            </div>
            <div style="font-weight: bold; color: #f59e0b;">STATUS: EM MANUTENÇÃO</div>
          </div>
          
          <div class="info-grid">
            <div class="info-card">
              <div class="label">Categoria do Dano</div>
              <div class="value">${getCategoryLabel(selectedIncident.category)}</div>
            </div>
            <div class="info-card">
              <div class="label">Grau de Urgência (IA)</div>
              <div class="value">${selectedIncident.severity_score.toFixed(1)} / 10</div>
            </div>
            <div class="info-card">
              <div class="label">Endereço Resolvido</div>
              <div class="value">${selectedIncident.address}</div>
            </div>
            <div class="info-card">
              <div class="label">Coordenadas de Localização</div>
              <div class="value">Lat: ${selectedIncident.latitude.toFixed(6)}, Long: ${selectedIncident.longitude.toFixed(6)}</div>
            </div>
          </div>

          <div class="photo-box">
            <div class="label" style="margin-bottom: 8px;">Evidência Visual Capturada</div>
            <img class="photo" src="${reports[0]?.photo_url || 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=800'}" />
          </div>

          <div style="margin-bottom: 30px;">
            <div class="label">Descrição do Cidadão</div>
            <div style="margin-top: 6px; padding: 10px; background: #fff; border-left: 3px solid #ccc; font-style: italic;">
              "${reports[0]?.description || 'Nenhuma descrição detalhada informada.'}"
            </div>
          </div>

          <div class="footer">
            <div>
              <div><strong>Prefeitura Municipal de São Paulo</strong></div>
              <div>Secretaria de Obras e Vias Públicas</div>
            </div>
            <div class="signature">
              Assinatura do Técnico de Campo
            </div>
          </div>
          
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', width: '100%' }}>
      
      {/* 1. Dashboard de Estatísticas e Gamificação */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        
        {/* Métricas de Ocorrências */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase' }}>Zeladoria do Bairro</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--cyan)' }}>{totalActives}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ativos</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--emerald)', marginLeft: '12px' }}>{totalResolved}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>concluídos</span>
          </div>
        </div>

        {/* Gamificação */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="flex-center" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0 }}>
            <Award size={20} className="text-amber" />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase' }}>Reputação Cidadã</p>
            <p style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--amber)' }}>{badgeName}</p>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{userScore} pts acumulados</p>
          </div>
        </div>

      </div>

      {/* 2. Lista de Incidentes */}
      <div className="scrollable-y" style={{ padding: '16px' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '12px', fontFamily: 'var(--font-title)' }}>Lista de Ocorrências</h3>
        
        {incidents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            Nenhuma ocorrência encontrada para os filtros selecionados.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {incidents.map(inc => {
              let tagColor = 'text-cyan';
              if (inc.category === 'iluminacao') tagColor = 'text-amber';
              if (inc.category === 'semaforo') tagColor = 'text-crimson';
              if (inc.status === 'resolvido') tagColor = 'text-emerald';

              return (
                <div 
                  key={inc.id} 
                  onClick={() => onSelectIncident(inc)}
                  className="glass-card" 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderLeft: `3px solid ${inc.status === 'resolvido' ? 'var(--emerald)' : (inc.status === 'reaberto_por_reincidencia' ? 'var(--crimson)' : 'var(--cyan)')}` }}
                >
                  <div style={{ flex: 1, paddingRight: '12px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '0.9rem' }}>{getCategoryLabel(inc.category)}</h4>
                      {renderStatusBadge(inc.status)}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '260px' }}>
                      {inc.address}
                    </p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Prioridade: <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{inc.severity_score.toFixed(1)}</span>
                      {inc.reincidence_counter > 0 && ` | Reaberto ${inc.reincidence_counter}x`}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-muted" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Gaveta de Detalhes Expandida (Slide-up Drawer) */}
      {selectedIncident && (
        <div className="glass-panel" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '75%', zIndex: 100, borderTopLeftRadius: '24px', borderTopRightRadius: '24px', display: 'flex', flexDirection: 'column', boxShadow: '0 -8px 40px rgba(0,0,0,0.8)' }}>
          
          {/* Alça de fechar */}
          <div 
            onClick={() => onSelectIncident(null)} 
            style={{ width: '40px', height: '6px', background: 'var(--border-color)', borderRadius: '3px', margin: '12px auto', cursor: 'pointer' }}
          />

          <div className="scrollable-y" style={{ padding: '0 20px 20px 20px' }}>
            
            {/* Cabeçalho do Card */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', textAlign: 'left' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '1.25rem' }}>{getCategoryLabel(selectedIncident.category)}</h3>
                  {renderStatusBadge(selectedIncident.status)}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedIncident.address}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Coordenadas: {selectedIncident.latitude.toFixed(5)}, {selectedIncident.longitude.toFixed(5)}
                </p>
              </div>
              
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--cyan)' }}>{selectedIncident.severity_score.toFixed(1)}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>GRAVIDADE IA</span>
              </div>
            </div>

            {/* Carrossel / Linha do Tempo de Fotos (RF05) */}
            <div style={{ marginBottom: '24px', textAlign: 'left' }}>
              <p className="form-label" style={{ marginBottom: '10px' }}>Evolução Visual e Histórico</p>
              {loadingReports ? (
                <div className="flex-center" style={{ height: '120px' }}><div className="spinner" /></div>
              ) : (
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px' }}>
                  {reports.map((rep, index) => (
                    <div 
                      key={rep.id} 
                      className="glass-card" 
                      style={{ flexShrink: 0, width: '200px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)' }}
                    >
                      <div style={{ width: '100%', height: '110px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                        <img src={rep.photo_url} alt="Evidência" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)', height: '32px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        "{rep.description}"
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', borderTop: '1px solid var(--border-color)', paddingTop: '6px' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={10} />
                          {rep.user_id?.includes('operator') ? 'Prefeitura' : 'Cidadão'}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          {new Date(rep.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ações do Cidadão (Apoiar) */}
            {user?.role === 'citizen' && selectedIncident.status !== 'resolvido' && (
              <button
                type="button"
                onClick={handleSupportClick}
                disabled={supportLoading}
                className="btn-primary"
                style={{ width: '100%', display: 'flex', gap: '8px', marginBottom: '16px' }}
              >
                {supportLoading ? <div className="spinner" style={{ width: '20px', height: '20px', borderTopColor: '#000' }} /> : (
                  <>
                    <ThumbsUp size={18} />
                    <span>Apoiar Ocorrência ("Isso também me afeta")</span>
                  </>
                )}
              </button>
            )}

            {/* Ações da Prefeitura (Exclusivo Perfil Operador - RF08 / RF12) */}
            {user?.role === 'operator' && (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '10px', textAlign: 'left' }}>
                <p className="form-label" style={{ marginBottom: '12px', color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={14} /> Painel Operacional Municipal
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  
                  {/* Botão OS Digital */}
                  {selectedIncident.status === 'em_manutencao' && (
                    <button
                      type="button"
                      onClick={handlePrintOS}
                      className="btn-accent"
                      style={{ width: '100%', display: 'flex', gap: '8px', borderColor: 'rgba(0, 242, 254, 0.4)' }}
                    >
                      <FileText size={18} />
                      <span>Imprimir Ordem de Serviço (OS)</span>
                    </button>
                  )}

                  {/* Fluxos de Transições de status */}
                  {selectedIncident.status !== 'em_manutencao' && selectedIncident.status !== 'resolvido' && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange('em_manutencao')}
                      disabled={statusLoading}
                      className="btn-primary"
                      style={{ width: '100%', background: 'linear-gradient(135deg, var(--amber) 0%, #d97706 100%)', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.2)' }}
                    >
                      <PlayCircle size={18} />
                      <span>Iniciar Manutenção</span>
                    </button>
                  )}

                  {selectedIncident.status !== 'resolvido' && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange('resolvido')}
                      disabled={statusLoading}
                      className="btn-primary"
                      style={{ width: '100%', background: 'linear-gradient(135deg, var(--emerald) 0%, #059669 100%)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)' }}
                    >
                      <CheckCircle size={18} />
                      <span>Marcar como Resolvido</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onSelectIncident(null)}
                    className="btn-secondary"
                    style={{ width: '100%' }}
                  >
                    Voltar ao Mapa
                  </button>

                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
