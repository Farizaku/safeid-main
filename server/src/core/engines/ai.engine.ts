/**
 * AIEngine - Motor de Inteligência Cognitiva
 * 
 * Transforma análise estruturada em orientações semânticas.
 * Usa Google Gemini (gemini-pro) para gerar recomendações em português.
 * Processa TODAS as breaches encontradas, não apenas a primeira.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

interface HIBPBreach {
  Name: string;
  Title: string;
  BreachDate: string;
  DataClasses: string[];
  IsVerified: boolean;
  [key: string]: any;
}

interface AIRecommendation {
  executive_summary: string;
  mitigation_steps: string[];
  urgency_level: string;
}

export class AIEngine {
  private client: GoogleGenerativeAI;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = (apiKey || '').trim();
    this.client = new GoogleGenerativeAI(this.apiKey || 'missing-api-key');
  }

  /**
   * Gera recomendações baseadas em TODAS as breaches encontradas
   * NUNCA envia dados sensíveis (email) para o Gemini
   * Apenas metadados genéricos sobre as breaches
   */
  async generateRecommendation(context: {
    breaches: HIBPBreach[];
    riskScore: number;
  }): Promise<AIRecommendation> {
    if (!this.apiKey) {
      return this.buildFallbackRecommendation(context);
    }

    const prompt = this.buildSafePrompt(context);

    try {
      const candidateModels = [
        'gemini-3.1-flash-lite',
        'models/gemini-3.1-flash-lite',
        'gemini-2.0-flash',
        'models/gemini-2.0-flash',
        'gemini-1.5-flash',
        'models/gemini-1.5-flash',
        'gemini-pro',
        'models/gemini-pro',
      ];

      let lastError: any = null;
      for (const m of candidateModels) {
        try {
          const model = this.client.getGenerativeModel({ model: m });
          const response = await model.generateContent(prompt);
          const textContent = response.response?.text?.();
          if (!textContent) throw new Error('Empty response from model');

          const jsonMatch = textContent.match(/\{[\s\S]*\}/);
          const jsonStr = jsonMatch ? jsonMatch[0] : textContent;
          return JSON.parse(jsonStr) as AIRecommendation;
        } catch (err) {
          lastError = err;
        }
      }

      // If none of the common names worked, try listing models (if supported)
      if (typeof this.client.listModels === 'function') {
        try {
          const listing = await this.client.listModels();
          const genModel = (listing.models || []).find((md: any) => (
            (md.supportedMethods || []).some((s: string) => /generate/i.test(s)) || /bison|gemini|chat/i.test(md.name)
          ));
          if (genModel) {
            const model = this.client.getGenerativeModel({ model: genModel.name });
            const response = await model.generateContent(prompt);
            const textContent = response.response?.text?.();
            if (!textContent) throw new Error('Empty response from listed model');
            const jsonMatch = textContent.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : textContent;
            return JSON.parse(jsonStr) as AIRecommendation;
          }
        } catch (err) {
          lastError = err;
        }
      }

      throw lastError || new Error('No compatible generative model found');
    } catch (error) {
      console.error('AIEngine error:', error);
      return this.buildFallbackRecommendation(context);
    }
  }

  private buildFallbackRecommendation(context: {
    breaches: HIBPBreach[];
    riskScore: number;
  }): AIRecommendation {
    const breachNames = context.breaches.map(b => b.Name).join(', ') || 'Unknown';
    const allDataTypes = Array.from(
      new Set(context.breaches.flatMap(b => b.DataClasses || []))
    );
    const dataTypesStr = allDataTypes.length > 0
      ? allDataTypes.join(', ')
      : 'dados não especificados';

    return {
      executive_summary:
        `Detectamos ${context.breaches.length} possível(is) vazamento(s) em: ${breachNames}, envolvendo ${dataTypesStr}. Troque sua senha imediatamente e revise suas contas conectadas.`,
      mitigation_steps: [
        'Troque a senha afetada por uma senha única e forte.',
        'Ative autenticação de dois fatores nas contas principais.',
        'Revise atividades recentes e alertas de login em seus serviços.',
        `Acompanhe ${context.breaches.length} serviço(s) comprometido(s) para atualizações de segurança.`,
      ],
      urgency_level: context.riskScore >= 70 ? 'HIGH' : 'MEDIUM',
    };
  }

  /**
   * Constrói prompt seguro sem expor dados sensíveis
   * Inclui informações de TODAS as breaches
   */
  private buildSafePrompt(context: {
    breaches: HIBPBreach[];
    riskScore: number;
  }): string {
    const breachesInfo = context.breaches
      .map((breach, idx) => {
        const dataTypes = breach.DataClasses?.join(', ') || 'unknown';
        const daysAgo = this.calculateDaysAgo(breach.BreachDate);
        const timeframe = daysAgo > 365
          ? `há mais de ${Math.floor(daysAgo / 365)} ano(s)`
          : daysAgo > 0
          ? `há ${daysAgo} dias`
          : 'recentemente';
        return `- ${breach.Name} (${timeframe}): ${dataTypes}`;
      })
      .join('\n');

    return `You are a cybersecurity expert providing guidance to non-technical users in Portuguese.

Multiple data breaches were found:
${breachesInfo}

Overall Risk Score: ${context.riskScore}/100
Total breaches found: ${context.breaches.length}

Provide a JSON response with exactly these fields:
{
  "executive_summary": "Brief, comprehensive summary in Portuguese addressing ALL breaches (2-3 sentences)",
  "mitigation_steps": ["Step 1 in Portuguese", "Step 2 in Portuguese", "Step 3 in Portuguese", "Step 4 in Portuguese"],
  "urgency_level": "HIGH" or "MEDIUM" or "LOW"
}

Be direct, technical but accessible, and focus on immediate actions the user should take.
Response must be valid JSON only, no markdown or code blocks.`;
  }

  private calculateDaysAgo(breachDate: string): number {
    try {
      const breach = new Date(breachDate);
      const today = new Date();
      const diff = today.getTime() - breach.getTime();
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  }
}
