/**
 * AIEngine - Motor de Inteligência Cognitiva
 * 
 * Transforma análise estruturada em orientações semânticas.
 * Usa OpenAI (gpt-4o-mini) para gerar recomendações em português.
 */

import OpenAI from 'openai';

interface AIRecommendation {
  executive_summary: string;
  mitigation_steps: string[];
  urgency_level: string;
}

export class AIEngine {
  private client: OpenAI;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = (apiKey || '').trim();
    this.client = new OpenAI({
      apiKey: this.apiKey || 'missing-api-key',
    });
  }

  /**
   * Gera recomendações baseadas no contexto do vazamento
   * NUNCA envia dados sensíveis (email) para a OpenAI
   * Apenas metadados genéricos
   */
  async generateRecommendation(context: {
    breachName: string;
    exposedDataTypes: string[];
    daysAgo: number;
    riskScore: number;
  }): Promise<AIRecommendation> {
    if (!this.apiKey) {
      return this.buildFallbackRecommendation(context);
    }

    const prompt = this.buildSafePrompt(context);

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2, // Respostas técnicas e determinísticas
        max_tokens: 300, // Limite de tokens para objetividade
        response_format: { type: 'json_object' },
      });

      const textContent = response.choices[0].message.content;
      if (!textContent) {
        throw new Error('Empty response from OpenAI');
      }

      return JSON.parse(textContent) as AIRecommendation;
    } catch (error) {
      console.error('AIEngine error:', error);
      return this.buildFallbackRecommendation(context);
    }
  }

  private buildFallbackRecommendation(context: {
    breachName: string;
    exposedDataTypes: string[];
    daysAgo: number;
    riskScore: number;
  }): AIRecommendation {
    const dataTypes = context.exposedDataTypes.length > 0
      ? context.exposedDataTypes.join(', ')
      : 'dados não especificados';

    return {
      executive_summary:
        `Detectamos um possível vazamento em ${context.breachName} envolvendo ${dataTypes}. Troque sua senha imediatamente e revise suas contas conectadas.`,
      mitigation_steps: [
        'Troque a senha afetada por uma senha única e forte.',
        'Ative autenticação de dois fatores nas contas principais.',
        'Revise atividades recentes e alertas de login em seus serviços.',
      ],
      urgency_level: context.riskScore >= 70 ? 'HIGH' : 'MEDIUM',
    };
  }

  /**
   * Constrói prompt seguro sem expor dados sensíveis
   */
  private buildSafePrompt(context: {
    breachName: string;
    exposedDataTypes: string[];
    daysAgo: number;
    riskScore: number;
  }): string {
    const dataTypesStr = context.exposedDataTypes.join(', ');
    const timeframeStr = context.daysAgo > 365 
      ? `há mais de ${Math.floor(context.daysAgo / 365)} ano(s)`
      : `há ${context.daysAgo} dias`;

    return `You are a cybersecurity expert providing guidance to non-technical users in Portuguese.

A data breach occurred in the service "${context.breachName}" ${timeframeStr}.
Exposed data types: ${dataTypesStr}.
Risk score: ${context.riskScore}/100.

Provide a JSON response with exactly these fields:
{
  "executive_summary": "Brief, clear summary in Portuguese (1-2 sentences)",
  "mitigation_steps": ["Step 1 in Portuguese", "Step 2 in Portuguese", "Step 3 in Portuguese"],
  "urgency_level": "HIGH" or "MEDIUM" or "LOW"
}

Be direct, technical but accessible, and focus on immediate actions the user should take.
Response must be valid JSON only, no markdown or code blocks.`;
  }
}
