import { GoogleGenerativeAI } from '@google/generative-ai';

// Função auxiliar para converter blob/base64 de arquivo no formato esperado pelo Gemini
function fileToGenerativePart(base64Data, mimeType) {
  return {
    inlineData: {
      data: base64Data.split(',')[1], // Remove o prefixo "data:image/png;base64,"
      mimeType
    },
  };
}

class GeminiService {
  constructor() {
    this.apiKey = localStorage.getItem('urbanguard_gemini_key') || '';
    this.modelName = 'gemini-1.5-flash';
  }

  setApiKey(key) {
    this.apiKey = key;
    localStorage.setItem('urbanguard_gemini_key', key);
  }

  hasApiKey() {
    return this.apiKey && this.apiKey.trim().length > 0;
  }

  async analyzeUrbanIncident(imageBase64, mimeType = 'image/jpeg') {
    if (!this.hasApiKey()) {
      console.log('Gemini AI: Nenhuma chave cadastrada. Executando simulador local de IA.');
      return this.simulateAITriage();
    }

    try {
      const ai = new GoogleGenerativeAI(this.apiKey);
      const model = ai.getGenerativeModel({ model: this.modelName });

      const imagePart = fileToGenerativePart(imageBase64, mimeType);

      const systemInstruction = `
        Você é a IA analista de infraestrutura da Smart City UrbanGuard.
        Analise a imagem de dano urbano enviada pelo cidadão.
        Seu objetivo é classificar a imagem e retornar estritamente um objeto JSON estruturado com os seguintes campos:
        
        {
          "category": "buraco" | "iluminacao" | "semaforo" | "vandalismo" | "saneamento" | "outros",
          "severity": <número inteiro de 1 a 10 representando a gravidade física do dano ou risco de acidente urbano>,
          "sanitized": true,
          "summary": "<uma frase curta em português descrevendo a gravidade e o problema observado>"
        }

        Instruções de LGPD (Privacidade):
        - Defina "sanitized" como true para indicar que você garantiu que rostos de pedestres ou placas de veículos pessoais expostas na imagem foram desconsiderados e não serão indexados na análise de triagem municipal.

        Retorne APENAS o objeto JSON estruturado, sem blocos markdown adicionais ou textos explicativos.
      `;

      const result = await model.generateContent({
        contents: [
          { role: 'user', parts: [imagePart, { text: systemInstruction }] }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      });

      const responseText = result.response.text();
      console.log('Gemini AI Response:', responseText);

      return JSON.parse(responseText);
    } catch (err) {
      console.error('Erro na chamada da API real do Gemini, ativando simulador de contingência:', err);
      return this.simulateAITriage(true);
    }
  }

  simulateAITriage(failedApi = false) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const categories = ['buraco', 'iluminacao', 'semaforo', 'vandalismo', 'saneamento'];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const randomSeverity = Math.floor(Math.random() * 8) + 3; // Severidades de 3 a 10

        const summaries = {
          'buraco': 'Cratera profunda na pista de rolamento com risco de danos a suspensões.',
          'iluminacao': 'Poste público apagado gerando ponto cego e risco de segurança no período noturno.',
          'semaforo': 'Lente semafórica desligada ou controladora piscando em amarelo intermitente.',
          'vandalismo': 'Pichação ou depredação física de patrimônio público a nível de calçada.',
          'saneamento': 'Vazamento ou refluxo de galeria pluvial gerando acúmulo de detritos na via.'
        };

        resolve({
          category: randomCategory,
          severity: randomSeverity,
          sanitized: true,
          summary: summaries[randomCategory] || 'Incidente de infraestrutura urbana detectado.',
          is_simulated: true,
          simulated_reason: failedApi ? 'API falhou, usando modelo local' : 'Sem chave de API configurada'
        });
      }, 1500);
    });
  }
}

export const ai = new GeminiService();
