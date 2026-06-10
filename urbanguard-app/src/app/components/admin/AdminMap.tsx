import { useEffect, useRef } from 'react';
import { Incident } from '../../../services/supabaseClient';

interface AdminMapProps {
  incidents: Incident[];
}

export function AdminMap({ incidents }: AdminMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const heatCirclesRef = useRef<any[]>([]);

  // 1. Inicializa o mapa
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const L = (window as any).L;
    if (!L) return;

    mapInstance.current = L.map(mapRef.current, {
      zoomControl: true
    }).setView([-23.55052, -46.633308], 15);

    // Tiles escuros do CartoDB Dark Matter
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 20
    }).addTo(mapInstance.current);

    // Centraliza no primeiro incidente ativo, se houver
    const active = incidents.filter(i => i.status !== 'resolvido');
    if (active.length > 0) {
      mapInstance.current.setView([active[0].latitude, active[0].longitude], 15);
    }
  }, []);

  // 2. Atualiza a camada de calor (círculos) quando os incidentes mudam
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapInstance.current) return;

    // Limpa círculos anteriores
    heatCirclesRef.current.forEach(c => mapInstance.current.removeLayer(c));
    heatCirclesRef.current = [];

    // Filtra incidentes não resolvidos para o mapa de calor operacional
    const activeIncidents = incidents.filter(i => i.status !== 'resolvido');

    activeIncidents.forEach((inc) => {
      const position: [number, number] = [inc.latitude, inc.longitude];
      
      // Cor de acordo com severidade e status de reincidência (conforme Figma/StyleGuide)
      let color = '#00F2FE'; // Cyan padrão
      if (inc.status === 'reaberto_por_reincidencia' || inc.severity_score >= 8) {
        color = '#EF4444'; // Vermelho Neon / Crimson Alert
      } else if (inc.severity_score >= 5) {
        color = '#F59E0B'; // Amber Warning
      } else {
        color = '#FBC02D'; // Yellow
      }

      // Tamanho do círculo proporcional à severidade
      const radius = 30 + (inc.severity_score * 8);

      const circle = L.circle(position, {
        radius: radius,
        fillColor: color,
        fillOpacity: 0.3,
        color: color,
        weight: 1.5,
        opacity: 0.6
      }).addTo(mapInstance.current);

      // Tooltip informativo simples no hover
      const categoryLabel = inc.category === 'buraco' ? 'Buraco' : 
                            inc.category === 'iluminacao' ? 'Iluminação' : 
                            inc.category === 'semaforo' ? 'Semáforo' : 
                            inc.category === 'saneamento' ? 'Saneamento' : 'Outro';
      circle.bindTooltip(`<strong>${categoryLabel}</strong> - Prioridade: ${inc.severity_score.toFixed(1)}<br/>${inc.address}`, {
        direction: 'top',
        className: 'admin-map-tooltip'
      });

      heatCirclesRef.current.push(circle);
    });
  }, [incidents]);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-border text-left">
        <h2 className="text-base lg:text-lg font-semibold text-foreground">Mapa de Calor Operacional</h2>
        <p className="text-xs lg:text-sm text-muted-foreground">Concentração de incidentes ativos e gravidade por região</p>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[300px] lg:h-[500px]">
        <div ref={mapRef} className="w-full h-full z-10" />

        {/* Legend overlay */}
        <div className="absolute bottom-4 left-4 z-20 bg-background/90 backdrop-blur-md rounded-lg border border-border p-3 shadow-md text-left">
          <p className="text-xs font-bold text-foreground mb-2 uppercase tracking-wide">Urgência (Triagem IA)</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#EF4444]/30 border border-[#EF4444]"></div>
              <span className="text-[10px] text-muted-foreground font-semibold">Crítica / Reincidente (8+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#F59E0B]/30 border border-[#F59E0B]"></div>
              <span className="text-[10px] text-muted-foreground font-semibold">Média (5-8)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FBC02D]/30 border border-[#FBC02D]"></div>
              <span className="text-[10px] text-muted-foreground font-semibold">Baixa (&lt;5)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
