import { Construction, Lightbulb, Calendar, Wrench, CheckCircle2, Printer, AlertTriangle, Droplet } from 'lucide-react';
import { db, Incident } from '../../../services/supabaseClient';

interface IncidentQueueProps {
  incidents: Incident[];
  onUpdateStatus: () => void;
}

export function IncidentQueue({ incidents, onUpdateStatus }: IncidentQueueProps) {
  const handleStatusChange = async (id: string, newStatus: string) => {
    const incident = incidents.find(i => i.id === id);
    if (!incident) return;

    const statusDescriptions: Record<string, string> = {
      'em_manutencao': 'Equipe de manutenção urbana enviada ao local. Ordem de Serviço aberta.',
      'resolvido': 'Manutenção concluída com sucesso. Local limpo e vistoriado.'
    };

    const payload = {
      photoUrl: incident.category === 'semaforo'
        ? 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800'
        : (incident.category === 'iluminacao'
          ? 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800'
          : 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=800'),
      description: statusDescriptions[newStatus] || `Status alterado para ${newStatus}.`,
      latitude: incident.latitude,
      longitude: incident.longitude,
      category: incident.category,
      severity: incident.severity_score,
      aiAnalysis: { category: incident.category, severity: incident.severity_score, sanitized: true, summary: 'Manutenção municipal.' }
    };

    const { error } = await db.updateIncidentStatus(id, newStatus);
    if (error) {
      alert('Erro ao atualizar status: ' + (error as any).message);
    } else {
      await db.submitReport(payload);
      onUpdateStatus();
    }
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'aberto':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'em_manutencao':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'resolvido':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'reaberto_por_reincidencia':
        return 'bg-destructive/10 text-destructive border border-destructive/20 animate-pulse';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      'buraco': 'Buraco na Via',
      'iluminacao': 'Iluminação Pública',
      'semaforo': 'Semáforo com Defeito',
      'vandalismo': 'Pichação / Vandalismo',
      'saneamento': 'Saneamento / Esgoto',
      'outros': 'Outros Danos'
    };
    return labels[cat] || cat;
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'buraco':
        return <Construction className="w-5 h-5 text-destructive" />;
      case 'iluminacao':
        return <Lightbulb className="w-5 h-5 text-amber-400" />;
      case 'semaforo':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'saneamento':
        return <Droplet className="w-5 h-5 text-cyan-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
    }
  };

  const handlePrintOS = (incident: Incident) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Ordem de Serviço - UrbanGuard #${incident.id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a1a; padding: 40px; line-height: 1.6; }
            .header { border-bottom: 3px solid #0066cc; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 26px; font-weight: 800; color: #0066cc; letter-spacing: -0.5px; }
            .title { font-size: 20px; font-weight: 700; color: #333; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .meta-item { border: 1px solid #e0e0e0; padding: 15px; border-radius: 8px; background-color: #fcfcfc; }
            .label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #666; margin-bottom: 5px; letter-spacing: 0.5px; }
            .value { font-size: 15px; font-weight: 700; color: #111; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 16px; font-weight: 700; border-bottom: 2px solid #eee; padding-bottom: 5px; margin-bottom: 15px; color: #0066cc; }
            .footer { margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; text-align: center; font-size: 11px; color: #888; }
            .signature { margin-top: 60px; display: flex; justify-content: space-between; }
            .sig-line { border-top: 1.5px solid #666; width: 45%; text-align: center; padding-top: 8px; font-size: 12px; font-weight: 600; color: #444; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">URBAN GUARD</div>
            <div class="title">ORDEM DE SERVIÇO DE MANUTENÇÃO</div>
          </div>
          
          <div class="meta-grid">
            <div class="meta-item">
              <div class="label">Identificador do Incidente</div>
              <div class="value">#${incident.id}</div>
            </div>
            <div class="meta-item">
              <div class="label">Data de Abertura</div>
              <div class="value">${new Date(incident.created_at).toLocaleString('pt-BR')}</div>
            </div>
            <div class="meta-item">
              <div class="label">Categoria do Dano</div>
              <div class="value">${getCategoryLabel(incident.category)}</div>
            </div>
            <div class="meta-item">
              <div class="label">Score de Prioridade (Triagem IA)</div>
              <div class="value">${incident.severity_score.toFixed(1)} / 10.0</div>
            </div>
          </div>

          <div class="section" style="text-align: left;">
            <div class="section-title">Endereço da Via</div>
            <div class="value">${incident.address}</div>
            <div style="font-size: 12px; color: #666; margin-top: 6px; font-weight: 500;">
              Coordenadas de Campo: ${incident.latitude.toFixed(6)}, ${incident.longitude.toFixed(6)}
            </div>
          </div>

          <div class="section" style="text-align: left;">
            <div class="section-title">Instruções de Campo</div>
            <p style="font-size: 13px; margin: 0; padding: 0 0 0 15px; color: #333;">
              1. Deslocar equipe técnica ao local georreferenciado acima.<br/>
              2. Realizar análise visual do dano e isolar a área se necessário.<br/>
              3. Executar o reparo de infraestrutura e fotografar a evidência concluída.<br/>
              4. Reportar encerramento ao painel operacional para atualização do status público.
            </p>
          </div>

          <div class="signature">
            <div class="sig-line">Assinatura Operador (Prefeitura)</div>
            <div class="sig-line">Líder da Equipe Executora</div>
          </div>

          <div class="footer">
            Ordem de serviço gerada eletronicamente via UrbanGuard - Gestão Colaborativa Inteligente.
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Ordena os incidentes por gravidade de status e score de severidade
  const sortedIncidents = [...incidents].sort((a, b) => {
    const statusOrder: Record<string, number> = {
      'reaberto_por_reincidencia': 0,
      'aberto': 1,
      'em_manutencao': 2,
      'resolvido': 3
    };
    
    const aOrder = statusOrder[a.status] ?? 4;
    const bOrder = statusOrder[b.status] ?? 4;
    
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    return b.severity_score - a.severity_score;
  });

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col h-auto lg:h-[500px]">
      {/* Header */}
      <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-border text-left">
        <h2 className="text-base lg:text-lg font-semibold text-foreground">Fila de Prioridade</h2>
        <p className="text-xs lg:text-sm text-muted-foreground">Ordenado por impacto e triagem inteligente</p>
      </div>

      {/* Queue list */}
      <div className="flex-1 overflow-y-auto max-h-[600px] lg:max-h-none">
        <div className="divide-y divide-border">
          {sortedIncidents.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Nenhuma ocorrência registrada no sistema.
            </div>
          ) : (
            sortedIncidents.map((incident) => (
              <div key={incident.id} className="p-3 lg:p-4 hover:bg-accent/50 transition-colors">
                {/* Header row */}
                <div className="flex items-start gap-2 lg:gap-3 mb-2 lg:mb-3 text-left">
                  {/* Category icon */}
                  <div className={`w-9 h-9 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted`}>
                    {getCategoryIcon(incident.category)}
                  </div>

                  {/* Title and info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs lg:text-sm font-semibold text-foreground mb-1 truncate">
                      {getCategoryLabel(incident.category)}
                    </h3>
                    <div className="flex items-center gap-2 lg:gap-3 text-xs text-muted-foreground mb-1 lg:mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-[10px] lg:text-xs">
                          {new Date(incident.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-[10px] lg:text-xs">Reincidência:</span>
                        <span className="font-bold text-[10px] lg:text-xs">{incident.reincidence_counter}</span>
                      </div>
                    </div>
                    <p className="text-[10px] lg:text-xs text-muted-foreground truncate">{incident.address}</p>
                  </div>

                  {/* Impact badge */}
                  <div className={`px-1.5 lg:px-2 py-1 rounded text-[10px] lg:text-xs font-bold ${
                    incident.severity_score >= 8 ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    incident.severity_score >= 5 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                  }`}>
                    {incident.severity_score.toFixed(1)}
                  </div>
                </div>

                {/* Status dropdown */}
                <div className="mb-2 lg:mb-3">
                  <select
                    value={incident.status}
                    onChange={(e) => handleStatusChange(incident.id, e.target.value)}
                    className={`w-full px-2 lg:px-3 py-1.5 rounded border text-xs font-medium appearance-none cursor-pointer transition-colors ${getStatusColorClass(incident.status)}`}
                  >
                    <option value="aberto">Aberto</option>
                    <option value="em_manutencao">Em Reparo / Manutenção</option>
                    <option value="resolvido">Resolvido</option>
                    <option value="reaberto_por_reincidencia">Reaberto por Reincidência</option>
                  </select>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col lg:flex-row gap-2">
                  <button 
                    onClick={() => handleStatusChange(incident.id, 'em_manutencao')}
                    className="flex-1 h-9 lg:h-8 px-2 lg:px-3 bg-primary text-primary-foreground text-xs font-medium rounded hover:bg-primary/90 active:opacity-60 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Iniciar Reparo</span>
                  </button>
                  <button 
                    onClick={() => handleStatusChange(incident.id, 'resolvido')}
                    className="flex-1 h-9 lg:h-8 px-2 lg:px-3 bg-[#388E3C]/10 text-[#388E3C] text-xs font-medium rounded hover:bg-[#388E3C]/20 active:opacity-60 transition-all flex items-center justify-center gap-1.5 border border-[#388E3C]/20"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Marcar Resolvido</span>
                  </button>
                  <button 
                    onClick={() => handlePrintOS(incident)}
                    className="h-9 lg:h-8 px-3 bg-muted text-muted-foreground hover:bg-muted/80 active:opacity-60 text-xs font-medium rounded transition-all flex items-center justify-center gap-1.5 border border-border"
                    title="Imprimir Ordem de Serviço"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span className="lg:hidden">Imprimir OS</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
