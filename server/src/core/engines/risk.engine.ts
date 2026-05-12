/**
 * RiskEngine - Motor de Cálculo de Risco Cibernético
 * 
 * Implementa fórmula matemática de avaliação ponderada conforme especificação.
 * Cada vazamento é analisado segundo:
 * - Criticidade dos dados (Data Classes)
 * - Fator de Recência (quando ocorreu)
 * - Fator de Verificação (HIBP confirmado?)
 */

interface DataClassWeight {
  [key: string]: number;
}

interface BreachData {
  Name: string;
  Title: string;
  BreachDate: string;
  DataClasses: string[];
  IsVerified: boolean;
}

interface SubScore {
  breach: string;
  maxPClass: number;
  recencyFactor: number;
  confidenceFactor: number;
  score: number;
}

interface RiskCalculation {
  totalScore: number;
  classification: 'LOW' | 'MODERATE' | 'CRITICAL';
  subscores: SubScore[];
  breachesFound: number;
}

export class RiskEngine {
  /**
   * Dicionário Hierárquico de Data Classes com pesos
   */
  private readonly dataClassWeights: DataClassWeight = {
    'Passwords': 10,
    'Banking Information': 10,
    'Credit Cards': 10,
    'Social Security Numbers': 10,
    'Phone Numbers': 7,
    'Physical Addresses': 7,
    'Passport Numbers': 7,
    'Names': 4,
    'Date of Birth': 4,
    'Job Titles': 4,
    'Employers': 4,
    'Email Addresses': 1,
    'Usernames': 1,
    'IP Addresses': 1,
  };

  /**
   * Calcula recency factor baseado em meses desde o breach
   */
  private calculateRecencyFactor(breachDateStr: string): number {
    const breachDate = new Date(breachDateStr);
    const now = new Date();
    
    const diffTime = Math.abs(now.getTime() - breachDate.getTime());
    const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));

    if (diffMonths < 12) {
      return 1.5; // Risco agudo, senha provavelmente ainda ativa
    } else if (diffMonths <= 36) {
      return 1.0;
    } else {
      return 0.6; // Maioria dos usuários já rotacionou credenciais
    }
  }

  /**
   * Calcula confidence factor baseado em se breach foi verificado pelo HIBP
   */
  private calculateConfidenceFactor(isVerified: boolean): number {
    return isVerified ? 1.0 : 0.5;
  }

  /**
   * Extrai o peso máximo (mais crítico) das Data Classes de um vazamento
   */
  private getMaxDataClassWeight(dataClasses: string[]): number {
    return dataClasses.reduce((max, dataClass) => {
      const weight = this.dataClassWeights[dataClass] || 0;
      return Math.max(max, weight);
    }, 0);
  }

  /**
   * Calcula o SubScore para um vazamento individual
   * Formula: Si = max(Pclasses) × Frecencia × Fconfianca
   */
  private calculateSubScore(breach: BreachData): SubScore {
    const maxPClass = this.getMaxDataClassWeight(breach.DataClasses);
    const recencyFactor = this.calculateRecencyFactor(breach.BreachDate);
    const confidenceFactor = this.calculateConfidenceFactor(breach.IsVerified);

    const score = maxPClass * recencyFactor * confidenceFactor;

    return {
      breach: breach.Name,
      maxPClass,
      recencyFactor,
      confidenceFactor,
      score,
    };
  }

  /**
   * Calcula Risk Score final agregando todos os SubScores
   * Com teto máximo de 100 para evitar scores absurdos
   */
  calculate(breaches: BreachData[]): RiskCalculation {
    if (!breaches || breaches.length === 0) {
      return {
        totalScore: 0,
        classification: 'LOW',
        subscores: [],
        breachesFound: 0,
      };
    }

    const subscores: SubScore[] = breaches.map(breach =>
      this.calculateSubScore(breach)
    );

    // Soma todos os subscores com teto de 100
    const totalScore = Math.min(
      subscores.reduce((sum, sub) => sum + sub.score, 0),
      100
    );

    // Classificação
    let classification: 'LOW' | 'MODERATE' | 'CRITICAL';
    if (totalScore >= 71) {
      classification = 'CRITICAL';
    } else if (totalScore >= 31) {
      classification = 'MODERATE';
    } else {
      classification = 'LOW';
    }

    return {
      totalScore: Math.round(totalScore),
      classification,
      subscores,
      breachesFound: breaches.length,
    };
  }
}
