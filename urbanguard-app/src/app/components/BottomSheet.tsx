import { useState, useEffect } from 'react';
import { ThumbsUp, Calendar, Users, X, User } from 'lucide-react';
import { db, Incident, Report } from '../../services/supabaseClient';

interface BottomSheetProps {
  incident: Incident | null;
  onClose: () => void;
  onSupportSuccess: () => void;
}

export function BottomSheet({ incident, onClose, onSupportSuccess }: BottomSheetProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [supportLoading, setSupportLoading] = useState(false);

  // Carrega relatos filhos (timeline) ao selecionar o incidente
  useEffect(() => {
    if (!incident) return;
    
    const fetchTimeline = async () => {
      setLoading(false);
      setIsSupported(false);
      
      // Verifica se o usuário logado já votou nesse item
      const currentUser = db.getCurrentUser();
      const votesKey = 'urbanguard_mock_votes';
      const votes = JSON.parse(localStorage.getItem(votesKey) || '[]') as any[];
      const exists = votes.some(v => v.incident_id === incident.id && v.user_id === (currentUser?.id || 'usr-mock-citizen'));
      setIsSupported(exists);

      setLoading(true);
      const { data } = await db.getReports(incident.id);
      if (data) {
        setReports(data);
      }
      setLoading(false);
    };

    fetchTimeline();
  }, [incident]);

  if (!incident) return null;

  const handleSupport = async () => {
    if (isSupported || supportLoading) return;
    setSupportLoading(true);
    
    const { error } = await db.supportIncident(incident.id);
    if (error) {
      alert((error as any).message || 'Erro ao votar.');
    } else {
      setIsSupported(true);
      onSupportSuccess();
    }
    setSupportLoading(false);
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      'buraco': 'Buraco na Via',
      'iluminacao': 'Iluminação Pública Apagada',
      'semaforo': 'Semáforo com Defeito',
      'vandalismo': 'Vandalismo / Pichação',
      'saneamento': 'Saneamento / Esgoto',
      'outros': 'Outros Danos'
    };
    return labels[cat] || cat;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'aberto':
        return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
      case 'em_manutencao':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'resolvido':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'reaberto_por_reincidencia':
        return 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'aberto': return 'Aberto';
      case 'em_manutencao': return 'Em Reparo';
      case 'resolvido': return 'Resolvido';
      case 'reaberto_por_reincidencia': return 'Reincidente';
      default: return status;
    }
  };

  // Primeira foto do incidente (ou placeholder se vazio)
  const mainPhotoUrl = reports.length > 0
    ? reports[0].photo_url
    : 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=800';

  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 bg-card rounded-t-2xl shadow-[0_-4px_16px_rgba(0,0,0,0.1)] transition-transform duration-300">
      
      {/* Drag handle */}
      <div className="w-full pt-2 pb-3 flex justify-center relative">
        <div className="w-8 h-1 bg-border rounded-full"></div>
        <button 
          type="button"
          onClick={onClose}
          className="p-1 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors absolute right-4 top-2"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="px-6 pb-24 pt-2 max-h-[60vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 text-left">
            <h2 className="text-xl font-bold text-foreground mb-1">
              {getCategoryLabel(incident.category)}
            </h2>
            <div className="text-xs text-muted-foreground mb-1">{incident.address}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>Reportado em {new Date(incident.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
          <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${getStatusBadgeClass(incident.status)}`}>
            {getStatusLabel(incident.status)}
          </div>
        </div>

        {/* Imagem e severidade */}
        <div className="flex gap-4 mb-5 text-left">
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
            <img
              src={mainPhotoUrl}
              alt={incident.category}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1">
            {/* Severity indicator */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">Prioridade</span>
                <span className="text-lg font-bold text-[#D32F2F]">{incident.severity_score.toFixed(1)}/10</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#D32F2F] rounded-full transition-all"
                  style={{ width: `${incident.severity_score * 10}%` }}
                ></div>
              </div>
            </div>

            {/* Support count */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>{Math.round(incident.severity_score * 3)} apoios cidadãos</span>
              {incident.reincidence_counter > 0 && (
                <span className="text-red-400 font-bold ml-2">Reaberto {incident.reincidence_counter}x</span>
              )}
            </div>
          </div>
        </div>

        {/* Histórico visual de fotos (Carrossel - RF05) */}
        {reports.length > 1 && (
          <div className="mb-5 text-left">
            <label className="block text-xs font-bold uppercase text-muted-foreground mb-2">Linha do Tempo Visual</label>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {reports.map((rep, idx) => (
                <div key={rep.id} className="flex-shrink-0 w-24 bg-muted/40 p-1.5 rounded border border-border flex flex-col gap-1">
                  <img src={rep.photo_url} className="w-full h-14 object-cover rounded" alt="Histórico" />
                  <span className="text-[8px] text-muted-foreground block text-right">
                    {new Date(rep.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="text-left mb-6">
          <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">Descrição</label>
          <p className="text-sm text-foreground bg-muted/20 p-3 rounded border border-border leading-relaxed">
            {reports[0]?.description || 'Sem observações adicionais.'}
          </p>
        </div>

        {/* Support button */}
        {incident.status !== 'resolvido' && (
          <button
            onClick={handleSupport}
            disabled={isSupported || supportLoading}
            className={`w-full h-12 rounded-lg font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ${
              isSupported
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            <ThumbsUp className={`w-5 h-5 ${isSupported ? 'fill-current' : ''}`} />
            {isSupported ? 'Você já apoiou' : 'Apoiar esta Ocorrência'}
          </button>
        )}
      </div>
    </div>
  );
}
