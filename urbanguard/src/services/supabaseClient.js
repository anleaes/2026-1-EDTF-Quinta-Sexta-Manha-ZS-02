import { createClient } from '@supabase/supabase-js';

// Função auxiliar para calcular a distância entre dois pontos (Fórmula de Haversine)
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Raio da Terra em metros
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distância em metros
  return distance;
}

// Inicializa chaves no LocalStorage para o modo Demonstração
const MOCK_INCIDENTS_KEY = 'urbanguard_mock_incidents';
const MOCK_REPORTS_KEY = 'urbanguard_mock_reports';
const MOCK_VOTES_KEY = 'urbanguard_mock_votes';
const MOCK_USER_KEY = 'urbanguard_mock_user';

const INITIAL_INCIDENTS = [
  {
    id: 'inc-1',
    latitude: -23.55052,
    longitude: -46.633308,
    address: 'Praça da Sé, Centro, São Paulo - SP',
    category: 'buraco',
    status: 'aberto',
    severity_score: 8.5,
    reincidence_counter: 0,
    created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(), // 5 dias atrás
    updated_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
  },
  {
    id: 'inc-2',
    latitude: -23.5512,
    longitude: -46.634,
    address: 'Rua Direita, 150, Centro, São Paulo - SP',
    category: 'iluminacao',
    status: 'em_manutencao',
    severity_score: 5.0,
    reincidence_counter: 1,
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 dias atrás
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'inc-3',
    latitude: -23.5495,
    longitude: -46.632,
    address: 'Rua Quinze de Novembro, 80, Centro, São Paulo - SP',
    category: 'semaforo',
    status: 'resolvido',
    severity_score: 9.0,
    reincidence_counter: 0,
    created_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString() // Resolvido há 2 dias
  }
];

const INITIAL_REPORTS = [
  {
    id: 'rep-1',
    incident_id: 'inc-1',
    user_id: 'usr-citizen-1',
    photo_url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=800',
    description: 'Cratera enorme atrapalhando a faixa da direita.',
    ai_analysis: { category: 'buraco', severity: 8, sanitized: true, summary: 'Cratera asfáltica profunda.' },
    created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
  },
  {
    id: 'rep-2',
    incident_id: 'inc-2',
    user_id: 'usr-citizen-2',
    photo_url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800',
    description: 'Poste piscando e barulho no reator.',
    ai_analysis: { category: 'iluminacao', severity: 4, sanitized: true, summary: 'Lâmpada piscando de vapor de sódio.' },
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  },
  {
    id: 'rep-3',
    incident_id: 'inc-3',
    user_id: 'usr-citizen-1',
    photo_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
    description: 'Sinal amarelo piscando sem parar no cruzamento perigoso.',
    ai_analysis: { category: 'semaforo', severity: 9, sanitized: true, summary: 'Falha controladora semafórica.' },
    created_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString()
  }
];

// Helper para garantir dados de semente no LocalStorage
function seedLocalStorage() {
  if (!localStorage.getItem(MOCK_INCIDENTS_KEY)) {
    localStorage.setItem(MOCK_INCIDENTS_KEY, JSON.stringify(INITIAL_INCIDENTS));
  }
  if (!localStorage.getItem(MOCK_REPORTS_KEY)) {
    localStorage.setItem(MOCK_REPORTS_KEY, JSON.stringify(INITIAL_REPORTS));
  }
  if (!localStorage.getItem(MOCK_VOTES_KEY)) {
    localStorage.setItem(MOCK_VOTES_KEY, JSON.stringify([]));
  }
}

// Inicializa a semente
seedLocalStorage();

// Classe para gerenciar banco de dados híbrido (Real Supabase + Fallback Simulado)
class DatabaseClient {
  constructor() {
    this.isDemo = true;
    this.supabase = null;
    this.loadClientConfig();
  }

  // Tenta carregar as credenciais salvas em localStorage
  loadClientConfig() {
    const savedUrl = localStorage.getItem('urbanguard_supabase_url');
    const savedKey = localStorage.getItem('urbanguard_supabase_key');
    const forceDemo = localStorage.getItem('urbanguard_force_demo') === 'true';

    if (savedUrl && savedKey && !forceDemo) {
      try {
        this.supabase = createClient(savedUrl, savedKey);
        this.isDemo = false;
        console.log('UrbanGuard: Conectado com sucesso ao Supabase real.');
      } catch (err) {
        console.error('Erro ao conectar ao Supabase real, usando modo Demo:', err);
        this.isDemo = true;
      }
    } else {
      this.isDemo = true;
      console.log('UrbanGuard: Rodando no modo Demonstração local (LocalStorage).');
    }
  }

  // Define se deve forçar o modo demonstração
  setForceDemo(value) {
    localStorage.setItem('urbanguard_force_demo', value ? 'true' : 'false');
    this.loadClientConfig();
  }

  // Autenticação: Login
  async login(email, password, bypass = false) {
    if (this.isDemo || bypass) {
      // Simulação Local
      let role = 'citizen';
      let name = 'Cidadão Demonstrativo';

      if (email.toLowerCase().includes('prefeitura') || email.toLowerCase().includes('admin')) {
        role = 'operator';
        name = 'Operador da Prefeitura';
      }

      const mockUser = {
        id: 'usr-mock-' + role,
        email: email,
        full_name: name,
        role: role
      };

      localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser));
      return { data: { user: mockUser }, error: null };
    }

    // Fluxo Supabase Real
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Busca perfil complementar
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const userWithRole = {
        ...data.user,
        full_name: profile?.full_name || 'Usuário Supabase',
        role: profile?.role || 'citizen'
      };

      localStorage.setItem(MOCK_USER_KEY, JSON.stringify(userWithRole));
      return { data: { user: userWithRole }, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  // Autenticação: Cadastro
  async signUp(email, password, fullName) {
    if (this.isDemo) {
      return { data: { user: { email, full_name: fullName } }, error: null };
    }

    try {
      const { data, error } = await this.supabase.auth.signUp({ email, password });
      if (error) throw error;

      // Cria perfil
      const { error: profileError } = await this.supabase
        .from('profiles')
        .insert([{ id: data.user.id, full_name: fullName, role: 'citizen' }]);

      if (profileError) throw profileError;

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  // Deslogar
  async logout() {
    localStorage.removeItem(MOCK_USER_KEY);
    if (!this.isDemo && this.supabase) {
      await this.supabase.auth.signOut();
    }
  }

  // Retorna usuário logado atualmente
  getCurrentUser() {
    const userJson = localStorage.getItem(MOCK_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  // Obter Lista de Incidentes Pais
  async getIncidents() {
    if (this.isDemo) {
      const list = JSON.parse(localStorage.getItem(MOCK_INCIDENTS_KEY)) || [];
      // Ordena decrescente por score de severidade
      const sorted = [...list].sort((a, b) => b.severity_score - a.severity_score);
      return { data: sorted, error: null };
    }

    try {
      const { data, error } = await this.supabase
        .from('incidents')
        .select('*')
        .order('severity_score', { ascending: false });
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  // Obter Relatos filhos vinculados a um Incidente Pai
  async getReports(incidentId) {
    if (this.isDemo) {
      const allReports = JSON.parse(localStorage.getItem(MOCK_REPORTS_KEY)) || [];
      const filtered = allReports.filter(r => r.incident_id === incidentId);
      // Ordena por data crescente
      const sorted = [...filtered].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      return { data: sorted, error: null };
    }

    try {
      const { data, error } = await this.supabase
        .from('reports')
        .select('*')
        .eq('incident_id', incidentId)
        .order('created_at', { ascending: true });
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  // Submissão Inteligente com Agrupamento e Reincidência
  async submitReport({ photoUrl, description, latitude, longitude, category, severity, aiAnalysis }) {
    const user = this.getCurrentUser();
    const userId = user ? user.id : 'usr-anonymous';

    // 1. Pesquisa de incidentes da mesma categoria num raio de 30 metros
    let parentIncident = null;

    if (this.isDemo) {
      const incidents = JSON.parse(localStorage.getItem(MOCK_INCIDENTS_KEY)) || [];
      
      for (const inc of incidents) {
        if (inc.category === category) {
          const dist = calculateDistance(latitude, longitude, inc.latitude, inc.longitude);
          if (dist <= 30) {
            parentIncident = inc;
            break;
          }
        }
      }
    } else {
      try {
        const { data } = await this.supabase
          .from('incidents')
          .select('*')
          .eq('category', category);

        if (data) {
          for (const inc of data) {
            const dist = calculateDistance(latitude, longitude, inc.latitude, inc.longitude);
            if (dist <= 30) {
              parentIncident = inc;
              break;
            }
          }
        }
      } catch (err) {
        console.error('Erro na busca de proximidade no Supabase:', err);
      }
    }

    // 2. Executa a lógica com base na presença de duplicados
    if (parentIncident) {
      console.log(`Incidente próximo encontrado (ID: ${parentIncident.id}). Executando agrupamento.`);
      
      const isResolved = parentIncident.status === 'resolvido';
      const resolvedAt = new Date(parentIncident.updated_at).getTime();
      const thirtyDaysAgo = Date.now() - (1000 * 60 * 60 * 24 * 30);
      const isRecentResolution = resolvedAt >= thirtyDaysAgo;

      let newStatus = parentIncident.status;
      let newReincidence = parentIncident.reincidence_counter;

      // Se resolvido há menos de 30 dias ➡️ REABRE por reincidência
      if (isResolved && isRecentResolution) {
        newStatus = 'reaberto_por_reincidencia';
        newReincidence += 1;
        console.log(`Problema resolvido reincidiu! Reabrindo incidente.`);
      }

      // Calcula novo severity_score combinando a severidade da IA com reincidências
      const updatedSeverity = Math.min(10, severity + (newReincidence * 1.5));

      if (this.isDemo) {
        const incidents = JSON.parse(localStorage.getItem(MOCK_INCIDENTS_KEY)) || [];
        const index = incidents.findIndex(i => i.id === parentIncident.id);
        
        incidents[index] = {
          ...incidents[index],
          status: newStatus,
          reincidence_counter: newReincidence,
          severity_score: updatedSeverity,
          updated_at: new Date().toISOString()
        };
        localStorage.setItem(MOCK_INCIDENTS_KEY, JSON.stringify(incidents));

        // Cria o relato filho
        const newReport = {
          id: 'rep-' + Math.random().toString(36).substr(2, 9),
          incident_id: parentIncident.id,
          user_id: userId,
          photo_url: photoUrl,
          description: description || 'Sem descrição extra.',
          ai_analysis: aiAnalysis,
          created_at: new Date().toISOString()
        };

        const reports = JSON.parse(localStorage.getItem(MOCK_REPORTS_KEY)) || [];
        reports.push(newReport);
        localStorage.setItem(MOCK_REPORTS_KEY, JSON.stringify(reports));

        return { data: { incidentId: parentIncident.id, status: newStatus }, error: null };
      } else {
        // Supabase real
        try {
          await this.supabase
            .from('incidents')
            .update({
              status: newStatus,
              reincidence_counter: newReincidence,
              severity_score: updatedSeverity,
              updated_at: new Date().toISOString()
            })
            .eq('id', parentIncident.id);

          const { data } = await this.supabase
            .from('reports')
            .insert([{
              incident_id: parentIncident.id,
              user_id: userId,
              photo_url: photoUrl,
              description: description,
              ai_analysis: aiAnalysis
            }])
            .select()
            .single();

          return { data: { incidentId: parentIncident.id, status: newStatus, report: data }, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      }
    } else {
      // 3. Caso não encontre duplicados: cria novo incidente pai e anexa o relato filho
      console.log('Nenhum incidente próximo encontrado. Criando novo incidente.');
      
      // Obtém endereço legível simulado (para o modo demo)
      const mockAddress = `Rua Georreferenciada (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`;

      if (this.isDemo) {
        const newIncidentId = 'inc-' + Math.random().toString(36).substr(2, 9);
        const newIncident = {
          id: newIncidentId,
          latitude,
          longitude,
          address: mockAddress,
          category,
          status: 'aberto',
          severity_score: severity,
          reincidence_counter: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const incidents = JSON.parse(localStorage.getItem(MOCK_INCIDENTS_KEY)) || [];
        incidents.push(newIncident);
        localStorage.setItem(MOCK_INCIDENTS_KEY, JSON.stringify(incidents));

        const newReport = {
          id: 'rep-' + Math.random().toString(36).substr(2, 9),
          incident_id: newIncidentId,
          user_id: userId,
          photo_url: photoUrl,
          description: description || 'Sem descrição extra.',
          ai_analysis: aiAnalysis,
          created_at: new Date().toISOString()
        };

        const reports = JSON.parse(localStorage.getItem(MOCK_REPORTS_KEY)) || [];
        reports.push(newReport);
        localStorage.setItem(MOCK_REPORTS_KEY, JSON.stringify(reports));

        return { data: { incidentId: newIncidentId, status: 'aberto' }, error: null };
      } else {
        // Supabase real
        try {
          const { data: newInc, error: incError } = await this.supabase
            .from('incidents')
            .insert([{
              latitude,
              longitude,
              address: mockAddress,
              category,
              status: 'aberto',
              severity_score: severity,
              reincidence_counter: 0
            }])
            .select()
            .single();

          if (incError) throw incError;

          const { data: newRep } = await this.supabase
            .from('reports')
            .insert([{
              incident_id: newInc.id,
              user_id: userId,
              photo_url: photoUrl,
              description: description,
              ai_analysis: aiAnalysis
            }])
            .select()
            .single();

          return { data: { incidentId: newInc.id, status: 'aberto', report: newRep }, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      }
    }
  }

  // Atualizar Status do Incidente (Exclusivo Prefeitura)
  async updateIncidentStatus(incidentId, newStatus) {
    if (this.isDemo) {
      const incidents = JSON.parse(localStorage.getItem(MOCK_INCIDENTS_KEY)) || [];
      const index = incidents.findIndex(i => i.id === incidentId);
      if (index !== -1) {
        incidents[index].status = newStatus;
        incidents[index].updated_at = new Date().toISOString();
        localStorage.setItem(MOCK_INCIDENTS_KEY, JSON.stringify(incidents));
      }
      return { data: true, error: null };
    }

    try {
      const { data, error } = await this.supabase
        .from('incidents')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', incidentId);
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  // Votar / Apoiador no Incidente
  async supportIncident(incidentId) {
    const user = this.getCurrentUser();
    const userId = user ? user.id : 'usr-mock-citizen';

    if (this.isDemo) {
      const votes = JSON.parse(localStorage.getItem(MOCK_VOTES_KEY)) || [];
      
      const exists = votes.some(v => v.incident_id === incidentId && v.user_id === userId);
      if (exists) {
        return { data: null, error: { message: 'Você já apoiou esta ocorrência.' } };
      }

      votes.push({ incident_id: incidentId, user_id: userId, created_at: new Date().toISOString() });
      localStorage.setItem(MOCK_VOTES_KEY, JSON.stringify(votes));

      const incidents = JSON.parse(localStorage.getItem(MOCK_INCIDENTS_KEY)) || [];
      const index = incidents.findIndex(i => i.id === incidentId);
      if (index !== -1) {
        incidents[index].severity_score = Math.min(10, incidents[index].severity_score + 0.5);
        localStorage.setItem(MOCK_INCIDENTS_KEY, JSON.stringify(incidents));
      }

      return { data: true, error: null };
    }

    try {
      const { data, error } = await this.supabase
        .from('votes')
        .insert([{ incident_id: incidentId, user_id: userId }]);
      
      if (error) throw error;

      const { data: parent } = await this.supabase.from('incidents').select('severity_score').eq('id', incidentId).single();
      if (parent) {
        await this.supabase
          .from('incidents')
          .update({ severity_score: Math.min(10, parent.severity_score + 0.5) })
          .eq('id', incidentId);
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }
}

export const db = new DatabaseClient();
