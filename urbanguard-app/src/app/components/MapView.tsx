import { useEffect, useRef } from 'react';

interface Incident {
  id: string;
  category: string;
  latitude: number;
  longitude: number;
  severity_score: number;
  status: string;
  address: string;
  description?: string;
  created_at: string;
}

interface MapViewProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident | null) => void;
}

export function MapView({ incidents, selectedIncident, onSelectIncident }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // 1. Inicializa o mapa Leaflet
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const L = (window as any).L;
    if (!L) {
      console.error('Leaflet.js CDN não foi carregado corretamente.');
      return;
    }

    // Inicializa o mapa centralizado em São Paulo (Sé)
    mapInstance.current = L.map(mapRef.current, {
      zoomControl: false,
    }).setView([-23.55052, -46.633308], 15);

    // Zoom no canto inferior direito para usabilidade mobile
    L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);

    // Tiles escuros premium (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 20
    }).addTo(mapInstance.current);

    // Ajusta o mapa no primeiro incidente, se houver
    if (incidents.length > 0) {
      const first = incidents[0];
      mapInstance.current.setView([first.latitude, first.longitude], 15);
    }
  }, []);

  // 2. Foca no incidente selecionado externa ou internamente
  useEffect(() => {
    if (selectedIncident && mapInstance.current) {
      mapInstance.current.setView([selectedIncident.latitude, selectedIncident.longitude], 16, {
        animate: true,
        duration: 0.8
      });
    }
  }, [selectedIncident]);

  // 3. Atualiza os marcadores quando a lista de incidentes muda
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapInstance.current) return;

    // Remove marcadores anteriores
    markersRef.current.forEach((marker) => mapInstance.current.removeLayer(marker));
    markersRef.current = [];

    // Desenha novos marcadores
    incidents.forEach((inc) => {
      // Determina a classe de cor com base na severidade e status
      let colorClass = 'cyan';
      if (inc.status === 'resolvido') {
        colorClass = 'emerald';
      } else if (inc.status === 'reaberto_por_reincidencia') {
        colorClass = 'crimson';
      } else if (inc.severity_score >= 8) {
        colorClass = 'crimson';
      } else if (inc.severity_score >= 5) {
        colorClass = 'amber';
      } else {
        colorClass = 'yellow';
      }

      const isSelected = selectedIncident && selectedIncident.id === inc.id;
      const pulseClass = inc.status === 'reaberto_por_reincidencia' ? 'pulse-active' : '';
      const selectedClass = isSelected ? 'marker-selected' : '';

      const neonIcon = L.divIcon({
        className: 'custom-neon-marker',
        html: `
          <div class="marker-container ${colorClass} ${pulseClass} ${selectedClass}">
            <div class="marker-pin"></div>
            <div class="marker-glow"></div>
            <span class="marker-number">${Math.round(inc.severity_score)}</span>
          </div>
        `,
        iconSize: [36, 42],
        iconAnchor: [18, 42]
      });

      const marker = L.marker([inc.latitude, inc.longitude], { icon: neonIcon }).addTo(mapInstance.current);

      marker.on('click', (e: any) => {
        L.DomEvent.stopPropagation(e);
        onSelectIncident(inc);
      });

      markersRef.current.push(marker);
    });

    // Se o usuário clicar fora de qualquer marcador no mapa, desmarca o selecionado
    mapInstance.current.on('click', () => {
      onSelectIncident(null);
    });
  }, [incidents, selectedIncident, onSelectIncident]);

  // 4. Injeta estilos CSS para marcadores neon personalizados
  useEffect(() => {
    const styleId = 'leaflet-custom-marker-app-css';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      .custom-neon-marker {
        background: none !important;
        border: none !important;
      }
      .marker-container {
        position: relative;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      .marker-pin {
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        position: absolute;
        top: 0;
        left: 6px;
        border: 2px solid rgba(255, 255, 255, 0.5);
        z-index: 2;
      }
      .marker-number {
        position: relative;
        font-family: 'Outfit', sans-serif;
        font-weight: 800;
        font-size: 0.7rem;
        color: #060913;
        z-index: 10;
        margin-top: -4px;
      }
      .marker-glow {
        position: absolute;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        filter: blur(8px);
        opacity: 0.35;
        z-index: 1;
        top: -4px;
        left: 2px;
      }
      
      /* Cores de Acordo com Figma */
      .cyan .marker-pin { background-color: #00F2FE; }
      .cyan .marker-glow { background-color: #00F2FE; }
      .cyan .marker-number { color: #060913; }
      
      .amber .marker-pin { background-color: #F59E0B; }
      .amber .marker-glow { background-color: #F59E0B; }
      .amber .marker-number { color: #ffffff; }

      .yellow .marker-pin { background-color: #FBC02D; }
      .yellow .marker-glow { background-color: #FBC02D; }
      .yellow .marker-number { color: #060913; }
      
      .emerald .marker-pin { background-color: #10B981; }
      .emerald .marker-glow { background-color: #10B981; }
      .emerald .marker-number { color: #ffffff; }
      
      .crimson .marker-pin { background-color: #EF4444; }
      .crimson .marker-glow { background-color: #EF4444; }
      .crimson .marker-number { color: #ffffff; }

      /* Pins Selecionados */
      .marker-selected {
        transform: scale(1.35) translateY(-6px);
        z-index: 999 !important;
      }
      .marker-selected .marker-pin {
        border-color: #ffffff;
        box-shadow: 0 0 10px #ffffff;
      }

      /* Pulsação Reincidente */
      .pulse-active .marker-pin {
        animation: pin-pulse 1s infinite alternate ease-in-out;
      }
      
      @keyframes pin-pulse {
        0% {
          transform: rotate(-45deg) scale(0.95);
        }
        100% {
          transform: rotate(-45deg) scale(1.2);
        }
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full">
      <div ref={mapRef} className="w-full h-full z-10" />
    </div>
  );
}
