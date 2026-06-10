# UrbanGuard - Zeladoria Urbana Colaborativa (Smart Cities)

Este repositório contém a solução desenvolvida para a atividade avaliativa **A3 - Exploração Digital e Fundamentos Tecnológicos** da unidade curricular.

O **UrbanGuard** é um aplicativo mobile-first voltado para a zeladoria urbana colaborativa (Smart Cities), permitindo que cidadãos reportem incidentes urbanos (como buracos, falta de iluminação pública, falhas semafóricas, saneamento e vandalismo) e que a prefeitura realize a gestão eficiente desses problemas.

## 🚀 Tecnologias e Stack Utilizadas

- **Frontend (Interface):** React, TypeScript e Tailwind CSS v4 (Baseado no design de alta fidelidade do Figma).
- **Mapas Interativos:** Leaflet.js integrado com a camada premium escura *CartoDB Dark Matter*.
- **Banco de Dados & Auth (BaaS):** Supabase (Tabelas: `profiles`, `incidents`, `reports` e `votes`).
- **Inteligência Artificial (Cérebro):** Google Generative AI (`gemini-3.1-flash-lite`) via Google AI Studio para triagem automática, análise de severidade física e adequação à LGPD.
- **Hospedagem:** Vercel.

---

## 📁 Estrutura do Repositório

O projeto principal está contido na pasta:
- **`urbanguard-app/`**: Contém o código-fonte React/TS. (A pasta legado `urbanguard` foi removida para simplificar e organizar o repositório).

---

## 🛠️ Como Executar Localmente

### 1. Pré-requisitos
- Node.js (v18+) instalado.
- Conta no Supabase e no Google AI Studio (para obter chaves de API).

### 2. Configurar Variáveis de Ambiente
Na pasta `urbanguard-app/`, crie um arquivo `.env` com suas credenciais:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
VITE_GEMINI_API_KEY=sua-chave-do-ai-studio
VITE_GEMINI_MODEL=gemini-3.1-flash-lite
```

### 3. Instalar Dependências e Iniciar
Navegue até a pasta do projeto e inicie o servidor de desenvolvimento:
```bash
cd urbanguard-app
npm install
npm run dev
```

---

## 📋 Critérios Atendidos (A3 PDF)
1. **Funcionalidade e IA (Orquestração de LLMs):** Triagem e categorização em tempo real das fotos enviadas por cidadãos.
2. **Sistema Relacional (Supabase):** Modelagem Pai e Filho que agrupa múltiplos reportes de cidadãos no mesmo ponto geográfico eterno no mapa (evitando duplicidade).
3. **Privacidade e LGPD:** Ocultação de dados sensíveis dos cidadãos e descarte de dados biométricos (rostos/placas) na análise de imagem feita pela IA.
4. **Exportação de Ordem de Serviço (PDF):** Painel do operador permite a geração e impressão de OSs padronizadas com criticidade e dados estruturados.