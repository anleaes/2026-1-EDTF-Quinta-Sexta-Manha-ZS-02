import React, { useState, useRef } from 'react';
import { ai } from '../../services/geminiService';
import { db } from '../../services/supabaseClient';
import { Camera, MapPin, Sparkles, Check, ChevronLeft, Upload, RefreshCw, Eye } from 'lucide-react';

export default function ReportForm({ onCancel, onSubmitSuccess }) {
  const [photo, setPhoto] = useState(null); // base64 compressed data URL
  const [photoBlob, setPhotoBlob] = useState(null);
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  
  // States da Triagem IA
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [category, setCategory] = useState('buraco');
  const [severity, setSeverity] = useState(5);
  
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const streamRef = useRef(null);

  // --- RNF05: Compressão de Imagem Client-Side ---
  const compressImage = (imageFile) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 1080;

          // Redimensiona proporcionalmente
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Comprime para JPEG de 80% de qualidade
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressedBase64);
        };
      };
    });
  };

  // --- Simulação para Apresentação em computadores sem Câmera/GPS ---
  const handleUseDemoData = async () => {
    setLocLoading(true);
    setErrorMsg('');
    
    // Coordenadas simuladas na região central de São Paulo (próximo à Sé)
    setLatitude(-23.55052 + (Math.random() - 0.5) * 0.003);
    setLongitude(-46.633308 + (Math.random() - 0.5) * 0.003);
    
    try {
      const response = await fetch('https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=600');
      const blob = await response.blob();
      
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        setPhoto(reader.result);
        setAiResult(null); // Reseta a IA anterior
        setLocLoading(false);
      };
    } catch (err) {
      console.error('Erro ao carregar imagem demo, usando fallback local de 1x1px:', err);
      // Fallback base64 curto para evitar falha completa se não houver internet
      setPhoto('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
      setLocLoading(false);
    }
  };

  // Upload por arquivo
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLocLoading(true); // Obtém GPS ao subir imagem se possível
    handleGPSCapture();

    try {
      const compressed = await compressImage(file);
      setPhoto(compressed);
      setAiResult(null); // Reseta a IA anterior
    } catch (err) {
      setErrorMsg('Erro ao processar imagem.');
    }
  };

  // Câmera Nativa (Webcam)
  const startCamera = async () => {
    setCameraActive(true);
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Abre câmera traseira no celular
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Erro ao abrir câmera traseira, usando galeria:', err);
      setErrorMsg('Não foi possível abrir a câmera. Por favor, suba um arquivo.');
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    // Comprime
    const compressed = canvas.toDataURL('image/jpeg', 0.8);
    setPhoto(compressed);
    
    // Desliga câmera
    stopCamera();
    
    // Auto-captura GPS
    handleGPSCapture();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  // --- RF02: Captura automática de Geolocalização ---
  const handleGPSCapture = () => {
    setLocLoading(true);
    setErrorMsg('');
    
    if (!navigator.geolocation) {
      setErrorMsg('Seu navegador não suporta geolocalização.');
      setLocLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocLoading(false);
      },
      (err) => {
        console.warn('Erro ao obter coordenadas precisas do GPS, usando Praça da Sé:', err);
        // Fallback simulação acadêmica para testes
        setLatitude(-23.55052 + (Math.random() - 0.5) * 0.005);
        setLongitude(-46.633308 + (Math.random() - 0.5) * 0.005);
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // --- RF06 / RNF03: Triagem por Inteligência Artificial (Gemini) ---
  const runAITriage = async () => {
    if (!photo) {
      setErrorMsg('Tire uma foto ou suba um arquivo antes de rodar a triagem.');
      return;
    }
    setAiLoading(true);
    setErrorMsg('');

    try {
      const result = await ai.analyzeUrbanIncident(photo);
      setAiResult(result);
      setCategory(result.category);
      setSeverity(result.severity);
      if (description.trim() === '') {
        setDescription(result.summary);
      }
    } catch (err) {
      setErrorMsg('Falha ao rodar triagem automática da IA.');
    } finally {
      setAiLoading(false);
    }
  };

  // Submissão
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!photo) {
      setErrorMsg('Por favor, anexe uma imagem do incidente.');
      return;
    }
    if (!latitude || !longitude) {
      setErrorMsg('Precisamos das coordenadas GPS. Ative a geolocalização.');
      return;
    }

    setSubmitLoading(true);
    setErrorMsg('');

    const payload = {
      photoUrl: photo, // Enviamos em Base64 no modo Demo ou link no Supabase real
      description,
      latitude,
      longitude,
      category,
      severity,
      aiAnalysis: aiResult || {
        category,
        severity,
        sanitized: true,
        summary: description || 'Problema urbano reportado manualmente.'
      }
    };

    const { data, error } = await db.submitReport(payload);

    if (error) {
      setErrorMsg(error.message || 'Erro ao registrar reporte.');
      setSubmitLoading(false);
    } else {
      setSubmitLoading(false);
      onSubmitSuccess();
    }
  };

  return (
    <div className="scrollable-y" style={{ width: '100%', padding: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button 
          type="button" 
          onClick={() => { stopCamera(); onCancel(); }} 
          className="btn-secondary" 
          style={{ padding: '8px', borderRadius: '50%' }}
        >
          <ChevronLeft size={20} />
        </button>
        <h2 style={{ fontSize: '1.25rem' }}>Reportar Incidente</h2>
      </div>

      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '10px', color: '#ff8a8a', fontSize: '0.85rem', marginBottom: '20px' }}>
          {errorMsg}
        </div>
      )}

      {/* Câmera Ativa ou Preview de Foto */}
      {cameraActive ? (
        <div style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', background: '#000', aspectRatio: '4/3', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
          <div style={{ position: 'absolute', bottom: '16px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '16px', zIndex: 10 }}>
            <button 
              type="button" 
              onClick={capturePhoto} 
              className="btn-primary" 
              style={{ borderRadius: '50%', width: '56px', height: '56px', padding: 0 }}
            >
              <Camera size={24} />
            </button>
            <button 
              type="button" 
              onClick={stopCamera} 
              className="btn-secondary" 
              style={{ borderRadius: '20px', fontSize: '0.8rem', padding: '8px 16px', background: 'rgba(0,0,0,0.6)' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: '20px' }}>
          {photo ? (
            <div style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', aspectRatio: '4/3', border: '1px solid var(--border-color)' }}>
              <img src={photo} alt="Incidente" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              
              {/* Efeito de Bounding Box da IA Gemini se analisada */}
              {aiResult && (
                <div style={{ position: 'absolute', top: '15%', left: '15%', right: '15%', bottom: '25%', border: '2px dashed var(--cyan)', boxShadow: '0 0 15px rgba(0, 242, 254, 0.3)', borderRadius: '8px', pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '8px' }}>
                  <span style={{ fontSize: '0.65rem', background: 'var(--cyan)', color: '#060913', padding: '2px 6px', borderRadius: '4px', alignSelf: 'flex-start', fontFamily: 'var(--font-title)', fontWeight: '800', textTransform: 'uppercase' }}>
                    {category} - Severidade {severity}/10
                  </span>
                  {aiResult.sanitized && (
                    <span style={{ fontSize: '0.65rem', background: 'var(--emerald)', color: '#fff', padding: '2px 6px', borderRadius: '4px', alignSelf: 'flex-end', fontWeight: 'bold' }}>
                      LGPD Sanitizado 🛡️
                    </span>
                  )}
                </div>
              )}

              <button 
                type="button" 
                onClick={() => setPhoto(null)} 
                className="btn-secondary" 
                style={{ position: 'absolute', top: '12px', right: '12px', padding: '6px 12px', fontSize: '0.75rem', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
              >
                Trocar Foto
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Box de Upload / Captura */}
              <div 
                onClick={() => fileInputRef.current.click()} 
                style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '40px 20px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.01)', transition: 'all 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--cyan)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <Upload size={32} className="text-secondary" style={{ marginBottom: '12px', opacity: 0.7 }} />
                <p style={{ fontWeight: '600', marginBottom: '4px' }}>Subir foto da Galeria</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Formatos suportados: JPG, PNG</p>
              </div>

              {/* Botão Câmera Ao Vivo */}
              <button 
                type="button" 
                onClick={startCamera} 
                className="btn-accent" 
                style={{ width: '100%' }}
              >
                <Camera size={18} />
                Abrir Câmera do Celular
              </button>

              {/* Botão Usar Dados de Demonstração */}
              <button 
                type="button" 
                onClick={handleUseDemoData} 
                className="btn-secondary" 
                style={{ width: '100%', borderColor: 'rgba(0, 242, 254, 0.35)', color: 'var(--cyan)' }}
              >
                <Sparkles size={18} />
                Usar Foto + GPS de Exemplo (Apresentação)
              </button>

              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
              />
            </div>
          )}
        </div>
      )}

      {/* Formulário */}
      <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Geolocalização GPS */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)' }}>Coordenadas GPS (Geolocalização)</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {latitude && longitude 
                ? `Lat: ${latitude.toFixed(5)}, Long: ${longitude.toFixed(5)}` 
                : 'Não capturado.'
              }
            </p>
          </div>
          <button 
            type="button" 
            onClick={handleGPSCapture} 
            disabled={locLoading}
            className="btn-secondary" 
            style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', gap: '6px' }}
          >
            {locLoading ? <RefreshCw size={14} className="spinner" /> : <MapPin size={14} />}
            {latitude ? 'Recapturar' : 'Capturar'}
          </button>
        </div>

        {/* Botão Processar IA (Apenas se tiver foto) */}
        {photo && !aiResult && (
          <button 
            type="button" 
            onClick={runAITriage} 
            disabled={aiLoading}
            className="btn-primary" 
            style={{ width: '100%', background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.2)' }}
          >
            {aiLoading ? (
              <>
                <RefreshCw size={18} className="spinner" style={{ borderTopColor: '#fff' }} />
                <span>IA Analisando Imagem...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Triagem Automática por IA (Gemini)</span>
              </>
            )}
          </button>
        )}

        {/* Resultados da IA visíveis / Editáveis */}
        {aiResult && (
          <div className="glass-card" style={{ borderLeft: '3px solid var(--cyan)', background: 'rgba(0, 242, 254, 0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <Sparkles size={16} className="text-cyan" />
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--cyan)' }}>Triagem Gerada pela IA</h4>
            </div>

            <div className="form-group">
              <label className="form-label">Categoria do Incidente</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
              >
                <option value="buraco">Buraco na Via</option>
                <option value="iluminacao">Iluminação Pública Apagada</option>
                <option value="semaforo">Semáforo com Defeito</option>
                <option value="vandalismo">Vandalismo / Pichação</option>
                <option value="saneamento">Saneamento / Galeria Pluvial</option>
                <option value="outros">Outros Danos Urbanos</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Severidade Detectada: {severity}/10</label>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={severity}
                onChange={(e) => setSeverity(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--cyan)' }} 
              />
            </div>
          </div>
        )}

        {/* Descrição */}
        <div className="form-group">
          <label className="form-label" htmlFor="description">Descrição Adicional / Detalhes</label>
          <textarea 
            id="description"
            className="form-input" 
            placeholder="Diga mais detalhes sobre o problema..." 
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ resize: 'none' }}
          />
        </div>

        {/* Botão Enviar */}
        <button 
          type="submit" 
          className="btn-primary" 
          disabled={submitLoading || !photo || !latitude}
          style={{ width: '100%', marginTop: '8px' }}
        >
          {submitLoading ? <div className="spinner" style={{ width: '20px', height: '20px', borderTopColor: '#000' }} /> : (
            <>
              <Check size={18} />
              <span>Confirmar Reporte</span>
            </>
          )}
        </button>

      </form>
    </div>
  );
}
