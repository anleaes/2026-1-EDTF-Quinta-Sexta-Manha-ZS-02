import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface Incident {
  id: string;
  latitude: number;
  longitude: number;
  address: string;
  category: string;
  status: string;
  severity_score: number;
  reincidence_counter: number;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  incident_id: string;
  user_id: string;
  photo_url: string;
  description: string;
  ai_analysis: any;
  created_at: string;
}

// Função auxiliar para calcular a distância entre dois pontos (Fórmula de Haversine)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

// RF13: Função de geocodificação reversa simulada baseada em pontos de referência de SP
export function getSimulatedAddress(lat: number, lon: number): string {
  const distanceTo = (tLat: number, tLon: number) => calculateDistance(lat, lon, tLat, tLon);

  const locations = [
    { name: 'Praça da Sé, 100, Centro, São Paulo - SP', lat: -23.55052, lon: -46.633308 },
    { name: 'Rua Direita, 150, Centro, São Paulo - SP', lat: -23.5512, lon: -46.634 },
    { name: 'Rua Quinze de Novembro, 80, Centro, São Paulo - SP', lat: -23.5495, lon: -46.632 },
    { name: 'Avenida Paulista, 1000, Bela Vista, São Paulo - SP', lat: -23.5615, lon: -46.656 },
    { name: 'Rua Augusta, 500, Consolação, São Paulo - SP', lat: -23.555, lon: -46.658 },
    { name: 'Rua da Consolação, 1200, Higienópolis, São Paulo - SP', lat: -23.548, lon: -46.652 }
  ];

  let closest = locations[0];
  let minDist = distanceTo(closest.lat, closest.lon);

  for (let i = 1; i < locations.length; i++) {
    const d = distanceTo(locations[i].lat, locations[i].lon);
    if (d < minDist) {
      minDist = d;
      closest = locations[i];
    }
  }

  // Gera número aleatório para o endereço
  const number = Math.floor(Math.abs(lat * 100000) % 1500) + 1;
  const formattedAddress = closest.name.replace(/,\s*\d+\s*,/, `, ${number},`);

  return formattedAddress;
}


// Inicializa chaves no LocalStorage para o modo Demonstração
const MOCK_INCIDENTS_KEY = 'urbanguard_mock_incidents';
const MOCK_REPORTS_KEY = 'urbanguard_mock_reports';
const MOCK_VOTES_KEY = 'urbanguard_mock_votes';
const MOCK_USER_KEY = 'urbanguard_mock_user';

const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'inc-1',
    latitude: -23.55052,
    longitude: -46.633308,
    address: 'Praça da Sé, Centro, São Paulo - SP',
    category: 'buraco',
    status: 'aberto',
    severity_score: 8.5,
    reincidence_counter: 0,
    created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
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
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
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
    updated_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  }
];

const INITIAL_REPORTS: Report[] = [
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

seedLocalStorage();

class DatabaseClient {
  public isDemo = true;
  public supabase: SupabaseClient | null = null;

  constructor() {
    this.loadClientConfig();
  }

  loadClientConfig() {
    const envUrl = import.meta.env.VITE_SUPABASE_URL;
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const savedUrl = localStorage.getItem('urbanguard_supabase_url') || envUrl;
    const savedKey = localStorage.getItem('urbanguard_supabase_key') || envKey;
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

  setForceDemo(value: boolean) {
    localStorage.setItem('urbanguard_force_demo', value ? 'true' : 'false');
    this.loadClientConfig();
  }

  async login(email: string, password?: string, bypass = false) {
    if (this.isDemo || bypass) {
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

    try {
      if (!this.supabase) throw new Error('Supabase não configurado.');
      const { data, error } = await this.supabase.auth.signInWithPassword({ email, password: password || '' });
      if (error) throw error;

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
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  async signUp(email: string, password?: string, fullName?: string) {
    if (this.isDemo) {
      return { data: { user: { email, full_name: fullName } }, error: null };
    }

    try {
      if (!this.supabase) throw new Error('Supabase não configurado.');
      const { data, error } = await this.supabase.auth.signUp({ email, password: password || '' });
      if (error) throw error;

      const { error: profileError } = await this.supabase
        .from('profiles')
        .insert([{ id: data.user.id, full_name: fullName, role: 'citizen' }]);

      if (profileError) throw profileError;

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  async logout() {
    localStorage.removeItem(MOCK_USER_KEY);
    if (!this.isDemo && this.supabase) {
      await this.supabase.auth.signOut();
    }
  }

  getCurrentUser() {
    const userJson = localStorage.getItem(MOCK_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  async getIncidents() {
    if (this.isDemo) {
      const list = JSON.parse(localStorage.getItem(MOCK_INCIDENTS_KEY) || '[]') as Incident[];
      const sorted = [...list].sort((a, b) => b.severity_score - a.severity_score);
      return { data: sorted, error: null };
    }

    try {
      if (!this.supabase) throw new Error('Supabase não configurado.');
      const { data, error } = await this.supabase
        .from('incidents')
        .select('*')
        .order('severity_score', { ascending: false });
      return { data: data as Incident[] | null, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  async getReports(incidentId: string) {
    if (this.isDemo) {
      const allReports = JSON.parse(localStorage.getItem(MOCK_REPORTS_KEY) || '[]') as Report[];
      const filtered = allReports.filter(r => r.incident_id === incidentId);
      const sorted = [...filtered].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      return { data: sorted, error: null };
    }

    try {
      if (!this.supabase) throw new Error('Supabase não configurado.');
      const { data, error } = await this.supabase
        .from('reports')
        .select('*')
        .eq('incident_id', incidentId)
        .order('created_at', { ascending: true });
      return { data: data as Report[] | null, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  async submitReport({ photoUrl, description, latitude, longitude, category, severity, aiAnalysis }: any) {
    const user = this.getCurrentUser();
    const userId = user ? user.id : 'usr-anonymous';

    let parentIncident: Incident | null = null;

    if (this.isDemo) {
      const incidents = JSON.parse(localStorage.getItem(MOCK_INCIDENTS_KEY) || '[]') as Incident[];
      
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
        if (!this.supabase) throw new Error('Supabase não configurado.');
        const { data } = await this.supabase
          .from('incidents')
          .select('*')
          .eq('category', category);

        if (data) {
          for (const inc of data) {
            const dist = calculateDistance(latitude, longitude, inc.latitude, inc.longitude);
            if (dist <= 30) {
              parentIncident = inc as Incident;
              break;
            }
          }
        }
      } catch (err) {
        console.error('Erro na busca de proximidade no Supabase:', err);
      }
    }

    if (parentIncident) {
      const isResolved = parentIncident.status === 'resolvido';
      const resolvedAt = new Date(parentIncident.updated_at).getTime();
      const thirtyDaysAgo = Date.now() - (1000 * 60 * 60 * 24 * 30);
      const isRecentResolution = resolvedAt >= thirtyDaysAgo;

      let newStatus = parentIncident.status;
      let newReincidence = parentIncident.reincidence_counter;

      if (isResolved && isRecentResolution) {
        newStatus = 'reaberto_por_reincidencia';
        newReincidence += 1;
      }

      const updatedSeverity = Math.min(10, severity + (newReincidence * 1.5));

      if (this.isDemo) {
        const incidents = JSON.parse(localStorage.getItem(MOCK_INCIDENTS_KEY) || '[]') as Incident[];
        const index = incidents.findIndex(i => i.id === parentIncident!.id);
        
        incidents[index] = {
          ...incidents[index],
          status: newStatus,
          reincidence_counter: newReincidence,
          severity_score: updatedSeverity,
          updated_at: new Date().toISOString()
        };
        localStorage.setItem(MOCK_INCIDENTS_KEY, JSON.stringify(incidents));

        const newReport: Report = {
          id: 'rep-' + Math.random().toString(36).substr(2, 9),
          incident_id: parentIncident.id,
          user_id: userId,
          photo_url: photoUrl,
          description: description || 'Sem descrição extra.',
          ai_analysis: aiAnalysis,
          created_at: new Date().toISOString()
        };

        const reports = JSON.parse(localStorage.getItem(MOCK_REPORTS_KEY) || '[]') as Report[];
        reports.push(newReport);
        localStorage.setItem(MOCK_REPORTS_KEY, JSON.stringify(reports));

        return { data: { incidentId: parentIncident.id, status: newStatus }, error: null };
      } else {
        try {
          if (!this.supabase) throw new Error('Supabase não configurado.');
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
        } catch (err: any) {
          return { data: null, error: err };
        }
      }
    } else {
      const mockAddress = getSimulatedAddress(latitude, longitude);

      if (this.isDemo) {
        const newIncidentId = 'inc-' + Math.random().toString(36).substr(2, 9);
        const newIncident: Incident = {
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

        const incidents = JSON.parse(localStorage.getItem(MOCK_INCIDENTS_KEY) || '[]') as Incident[];
        incidents.push(newIncident);
        localStorage.setItem(MOCK_INCIDENTS_KEY, JSON.stringify(incidents));

        const newReport: Report = {
          id: 'rep-' + Math.random().toString(36).substr(2, 9),
          incident_id: newIncidentId,
          user_id: userId,
          photo_url: photoUrl,
          description: description || 'Sem descrição extra.',
          ai_analysis: aiAnalysis,
          created_at: new Date().toISOString()
        };

        const reports = JSON.parse(localStorage.getItem(MOCK_REPORTS_KEY) || '[]') as Report[];
        reports.push(newReport);
        localStorage.setItem(MOCK_REPORTS_KEY, JSON.stringify(reports));

        return { data: { incidentId: newIncidentId, status: 'aberto' }, error: null };
      } else {
        try {
          if (!this.supabase) throw new Error('Supabase não configurado.');
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
              incident_id: (newInc as Incident).id,
              user_id: userId,
              photo_url: photoUrl,
              description: description,
              ai_analysis: aiAnalysis
            }])
            .select()
            .single();

          return { data: { incidentId: (newInc as Incident).id, status: 'aberto', report: newRep }, error: null };
        } catch (err: any) {
          return { data: null, error: err };
        }
      }
    }
  }

  async updateIncidentStatus(incidentId: string, newStatus: string) {
    if (this.isDemo) {
      const incidents = JSON.parse(localStorage.getItem(MOCK_INCIDENTS_KEY) || '[]') as Incident[];
      const index = incidents.findIndex(i => i.id === incidentId);
      if (index !== -1) {
        incidents[index].status = newStatus;
        incidents[index].updated_at = new Date().toISOString();
        localStorage.setItem(MOCK_INCIDENTS_KEY, JSON.stringify(incidents));
      }
      return { data: true, error: null };
    }

    try {
      if (!this.supabase) throw new Error('Supabase não configurado.');
      const { data, error } = await this.supabase
        .from('incidents')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', incidentId);
      return { data, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  async supportIncident(incidentId: string) {
    const user = this.getCurrentUser();
    const userId = user ? user.id : 'usr-mock-citizen';

    if (this.isDemo) {
      const votes = JSON.parse(localStorage.getItem(MOCK_VOTES_KEY) || '[]') as any[];
      const exists = votes.some(v => v.incident_id === incidentId && v.user_id === userId);
      if (exists) {
        return { data: null, error: { message: 'Você já apoiou esta ocorrência.' } };
      }

      votes.push({ incident_id: incidentId, user_id: userId, created_at: new Date().toISOString() });
      localStorage.setItem(MOCK_VOTES_KEY, JSON.stringify(votes));

      const incidents = JSON.parse(localStorage.getItem(MOCK_INCIDENTS_KEY) || '[]') as Incident[];
      const index = incidents.findIndex(i => i.id === incidentId);
      if (index !== -1) {
        incidents[index].severity_score = Math.min(10, incidents[index].severity_score + 0.5);
        localStorage.setItem(MOCK_INCIDENTS_KEY, JSON.stringify(incidents));
      }

      return { data: true, error: null };
    }

    try {
      if (!this.supabase) throw new Error('Supabase não configurado.');
      const { data, error } = await this.supabase
        .from('votes')
        .insert([{ incident_id: incidentId, user_id: userId }]);
      
      if (error) throw error;

      const { data: parent } = await this.supabase.from('incidents').select('severity_score').eq('id', incidentId).single();
      if (parent) {
        await this.supabase
          .from('incidents')
          .update({ severity_score: Math.min(10, (parent as any).severity_score + 0.5) })
          .eq('id', incidentId);
      }

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }
}

export const db = new DatabaseClient();
