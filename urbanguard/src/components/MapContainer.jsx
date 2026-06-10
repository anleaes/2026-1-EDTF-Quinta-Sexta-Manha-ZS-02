import React, { useEffect, useRef, useState } from 'react';
import { db } from '../services/supabaseClient';
import { Flame, MapPin, Sliders, CheckCircle, AlertTriangle, PlayCircle } from 'lucide-react';

export default function MapContainer({ incidents, activeFilters, user, onSelectIncident, refreshData }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const heatCirclesRef = useRef([]);

  const [heatmapActive, setHeatmapActive] = useState(false);

  // Inicializa o Mapa (Sé, SP por padrão)
  useEffect(() => {
    if (!window.L || mapInstance.current) return;

    // Ponto central padrão: Praça da Sé, SP
    mapInstance.current = window.L.map(mapRef.current, {
      zoomControl: false // Movemos o controle para o canto inferior direito para ficar mais "mobile"
    }).setView([-23.55052, -46.633308], 15);

    // Adiciona controle de zoom no canto inferior direito
    window.L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);

    // Carrega azulejos escuros do CartoDB Dark Matter
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 20
    }).addTo(mapInstance.current);
  }, []);

  // Atualiza pins e camadas com base nos incidentes e filtros ativos
  useEffect(() => {
    if (!window.L || !mapInstance.current) return;

    const L = window.L;

    // 1. Limpa marcadores anteriores
    markersRef.current.forEach(m => mapInstance.current.removeLayer(m));
    markersRef.current = [];

    // Limpa círculos de calor anteriores
    heatCirclesRef.current.forEach(c => mapInstance.current.removeLayer(c));
    heatCirclesRef.current = [];

    // 2. Filtra a lista de incidentes
    const filteredIncidents = incidents.filter(inc => {
      // Filtro de Categoria
      if (activeFilters.category !== 'all' && inc.category !== activeFilters.category) return false;
      // Filtro de Status
      if (activeFilters.status !== 'all' && inc.status !== activeFilters.status) return false;
      return true;
    });

    // 3. Desenha marcadores ou mapa de calor
    filteredIncidents.forEach(inc => {
      const position = [inc.latitude, inc.longitude];

      if (heatmapActive) {
        // --- MODO MAPA DE CALOR ---
        // Desenha círculos translúcidos com tamanho proporcional ao severity_score
        const radius = 30 + (inc.severity_score * 8);
        const color = inc.status === 'reaberto_por_reincidencia' ? '#ef4444' : '#00f2fe';
        
        const circle = L.circle(position, {
          radius: radius,
          fillColor: color,
          fillOpacity: 0.25,
          color: color,
          weight: 1,
          opacity: 0.4
        }).addTo(mapInstance.current);

        heatCirclesRef.current.push(circle);

        // Ao clicar no círculo de calor, seleciona o incidente
        circle.on('click', () => {
          onSelectIncident(inc);
        });
      } else {
        // --- MODO PINS NEON CUSTOMIZADOS ---
        // Determina a cor com base na categoria e reincidência
        let colorClass = 'cyan';
        if (inc.category === 'iluminacao') colorClass = 'yellow';
        if (inc.category === 'semaforo') colorClass = 'amber';
        
        // Efeitos de status
        let statusClass = '';
        if (inc.status === 'reaberto_por_reincidencia') statusClass = 'pulse-red';
        if (inc.status === 'resolvido') colorClass = 'emerald';

        // Cria o ícone HTML customizado com sombra neon
        const neonIcon = L.divIcon({
          className: 'custom-neon-marker',
          html: `
            <div class="marker-container ${colorClass} ${statusClass}">
              <div class="marker-pin"></div>
              <div class="marker-glow"></div>
              <span class="marker-number">${Math.round(inc.severity_score)}</span>
            </div>
          `,
          iconSize: [36, 42],
          iconAnchor: [18, 42]
        });

        const marker = L.marker(position, { icon: neonIcon }).addTo(mapInstance.current);

        // Bind de popup com informações e botão rápido
        marker.on('click', () => {
          onSelectIncident(inc);
        });

        markersRef.current.push(marker);
      }
    });

    // Centraliza o mapa no primeiro incidente da lista filtrada se houver
    if (filteredIncidents.length > 0 && !heatmapActive) {
      // Apenas reposiciona se não tiver nada focado
    }

  }, [incidents, activeFilters, heatmapActive]);

  // Estilos CSS adicionais para os Marcadores Neon programados na folha do Leaflet
  useEffect(() => {
    const styleId = 'leaflet-custom-marker-css';
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
      }
      .marker-pin {
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        position: absolute;
        top: 0;
        left: 6px;
        border: 2px solid rgba(255, 255, 255, 0.4);
      }
      .marker-number {
        position: relative;
        font-family: 'Outfit', sans-serif;
        font-weight: 800;
        font-size: 0.75rem;
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
        opacity: 0.4;
        z-index: 1;
        top: -4px;
        left: 2px;
      }
      
      /* Temas de Cores */
      .cyan .marker-pin { background-color: #00f2fe; }
      .cyan .marker-glow { background-color: #00f2fe; }
      
      .yellow .marker-pin { background-color: #f59e0b; }
      .yellow .marker-glow { background-color: #f59e0b; }
      
      .amber .marker-pin { background-color: #f59e0b; }
      .amber .marker-glow { background-color: #f59e0b; }
      
      .emerald .marker-pin { background-color: #10b981; }
      .emerald .marker-glow { background-color: #10b981; }
      .emerald .marker-number { color: #ffffff; }

      .pulse-red .marker-pin {
        background-color: #ef4444;
        animation: marker-pulse 1.2s infinite alternate;
        border-color: #ffffff;
      }
      .pulse-red .marker-glow {
        background-color: #ef4444;
        opacity: 0.8;
      }
      .pulse-red .marker-number {
        color: #ffffff;
      }

      @keyframes marker-pulse {
        0% { transform: rotate(-45deg) scale(0.95); }
        100% { transform: rotate(-45deg) scale(1.15); }
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div style={{ position: 'relative', flex: 1, width: '100%', height: '100%' }}>
      {/* Container do Mapa Leaflet */}
      <div ref={mapRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

      {/* Controle de Mapa de Calor Flutuante (Tema Escuro Neon) */}
      <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, display: 'flex', gap: '8px' }}>
        <button
          type="button"
          onClick={() => setHeatmapActive(!heatmapActive)}
          className={heatmapActive ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 14px', borderRadius: '20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', backdropFilter: 'blur(8px)' }}
        >
          <Flame size={16} />
          {heatmapActive ? 'Ver Marcadores' : 'Mapa de Calor'}
        </button>
      </div>
    </div>
  );
}
