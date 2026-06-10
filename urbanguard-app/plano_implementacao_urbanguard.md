# Plano de Implementação - UrbanGuard (Smart Cities)

Este plano descreve o roteiro de desenvolvimento prático passo a passo do **UrbanGuard**, uma plataforma colaborativa mobile-first de reporte de problemas urbanos integrada com **Supabase** (Persistência/Autenticação) e **Google Gemini** (IA Triagem de Imagem).

---

## 📂 1. Estrutura de Diretórios Recomendada

O projeto será desenvolvido em React (com Vite) aproveitando a estrutura de frontend móvel no tema escuro moderno:

```
urbanguard-app/
├── public/
│   └── manifest.json         # Configurações do PWA (Progressive Web App)
├── src/
│   ├── assets/               # Ícones customizados e logo
│   ├── components/
│   │   ├── Login.jsx         # Login, Cadastro e Modo Demonstração Local
│   │   ├── MapContainer.jsx  # Mapa Leaflet.js, Heatmap e Pins
│   │   ├── ReportForm.jsx    # Captura de Foto, Localização e IA Gemini
│   │   ├── HistoryList.jsx   # Histórico do Cidadão e Linha do Tempo (Carrossel)
│   │   └── Settings.jsx      # Chaves de API (Supabase & Gemini) e Controles
│   ├── services/
│   │   ├── supabaseClient.js # Conexão Supabase + Algoritmo de Agrupamento Local
│   │   └── geminiService.js  # Integração SDK do Google Generative AI
│   ├── App.jsx               # Roteador Principal e Estado Global
│   ├── index.css             # Design System (Tema Escuro Neon)
│   └── main.jsx
├── index.html                # CDN do Leaflet.js e Meta Tags SEO/Acessibilidade
├── package.json
└── vite.config.js
```

---

## 🛠️ 2. Fases do Desenvolvimento

### Fase 1: Fundação Visual (index.css & index.html)
*   **index.css:** Criação das variáveis do design system:
    *   Fundo principal: `#0a0e17` (Deep Midnight Blue).
    *   Painéis de vidro: `rgba(16, 22, 35, 0.75)` com `backdrop-filter: blur(12px)`.
    *   Bordas e detalhes: Ciano neon (`#00f2fe`) e Verde esmeralda (`#4facfe`).
    *   Fontes limpas e modernas: Google Fonts (Inter / Montserrat).
*   **index.html:** Importação dos estilos e scripts da biblioteca **Leaflet.js** via CDN pública rápida para exibição instantânea de mapas de alta performance no celular.

### Fase 2: Configuração dos Serviços (supabaseClient & geminiService)
*   **supabaseClient.js:**
    *   Instanciação do cliente oficial Supabase usando variáveis de ambiente.
    *   **Algoritmo de Deduplicação Local / Haversine:** Função que calcula a distância entre coordenadas. Se encontrar um ponto da mesma categoria a menos de 30m, vincula o novo relato (`report`) ao ID do incidente pai (`incident`) existente no Supabase ou localmente.
    *   **Bypass de Apresentação (LocalStorage):** Se o usuário escolher o modo demonstração, o cliente intercepta as consultas de gravação/leitura salvando no `localStorage` do navegador para assegurar apresentação 100% livre de falhas de rede.
*   **geminiService.js:**
    *   Integração direta com o SDK `@google/generative-ai`.
    *   Construção de um prompt instrucional rígido (System Prompt) para a IA retornar obrigatoriamente um objeto JSON contendo:
        1. `category`: 'buraco' | 'iluminacao' | 'semaforo' | 'vandalismo' | 'saneamento'.
        2. `severity`: 1 a 10 (representando a gravidade visual do estrago).
        3. `sanitized`: boolean (confirmação se omitiu placas ou rostos nas imagens para conformidade com a LGPD).

### Fase 3: Desenvolvimento dos Componentes de Interface
*   **Login.jsx:** Tela elegante de acesso. Permite autenticação real ou ativação imediata do Modo Demo Local (ótimo para testes rápidos de avaliação).
*   **MapContainer.jsx:** Exibe o mapa. Permite alternar entre mapa comum (pins coloridos dinâmicos por categoria/status) e mapa de calor (Heatmap) desenhado em camadas no mapa.
*   **ReportForm.jsx:** Captura móvel. Possui botões integrados para tirar foto direto da câmera do smartphone, comprimir a imagem no dispositivo do usuário antes do upload (RNF05) e capturar a geolocalização do GPS.
*   **HistoryList.jsx:** Linha do tempo visual. Permite ver todos os incidentes resolvidos ou abertos no mapa, exibindo o carrossel de fotos histórico que prova o antes e depois da manutenção urbana.

---

## 📈 3. Plano de Verificação Técnica (Apresentação Prática)

Para testar o sistema no dia da entrega ou apresentação perante a banca acadêmica, sugerimos seguir esta trilha de validação rápida:

1.  **Validação de Resiliência (Apresentação Offline):** Desconectar o notebook da rede e mostrar a tela de login. Clicar no botão "Modo Demonstração". O sistema deve inicializar perfeitamente as telas de mapa e formulário lendo dados pré-gravados do navegador sem travar.
2.  **Validação de Agrupamento Espacial:**
    *   Cadastrar um incidente na categoria "Buraco" nas coordenadas do pátio da faculdade.
    *   Cadastrar um segundo reporte na categoria "Buraco" na calçada vizinha (menos de 20 metros de distância).
    *   O sistema deve detectar o ponto próximo, associar a nova foto e descrição sob o mesmo pin, manter apenas um único marcador no mapa e exibir duas fotos diferentes na timeline de histórico desse marcador.
3.  **Validação de Reincidência Temporal:**
    *   No painel da prefeitura, marcar o buraco cadastrado como "Resolvido" (o pin deve mudar de cor ou desaparecer dependendo dos filtros).
    *   Cadastrar uma nova ocorrência no exato local no dia seguinte.
    *   O sistema deve detectar que a ocorrência estava resolvida há menos de 30 dias, mudar o status de volta para "Reaberto por Reincidência", somar 1 no contador e destacar o alerta prioritário.
