import axios, { AxiosInstance } from 'axios';
import CircuitBreaker from 'opossum';

export interface HibpClientOptions {
  apiKey: string;
  baseUrl?: string;
  userAgent?: string;
}

export class HibpClient {
  private axios: AxiosInstance;
  private breaker: any;

  constructor(options: HibpClientOptions) {
    const baseUrl = options.baseUrl || 'https://haveibeenpwned.com/api/v3';

    this.axios = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      headers: {
        'hibp-api-key': options.apiKey || '',
        'User-Agent': options.userAgent || 'safeid-backend',
      },
    });

    // Wrap the HTTP call in a circuit breaker
    const httpCall = async (email: string) => {
      const url = `/breachedaccount/${encodeURIComponent(email)}`;

      try {
        const res = await this.axios.get(url, {
          params: { truncateResponse: false },
        });

        return res.data || [];
      } catch (err: any) {
        // HIBP returns 404 when no breaches found — treat as empty array
        if (err?.response?.status === 404) {
          return [];
        }

        // propagate other errors
        throw err;
      }
    };

    this.breaker = new CircuitBreaker(httpCall, {
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
      rollingCountTimeout: 10000,
      rollingCountBuckets: 10,
    });

    // Optional: forward breaker events to console for now
    this.breaker.on('open', () => console.warn('[HIBP Circuit] OPEN'));
    this.breaker.on('halfOpen', () => console.info('[HIBP Circuit] HALF_OPEN'));
    this.breaker.on('close', () => console.info('[HIBP Circuit] CLOSED'));
  }

  async checkAccount(email: string): Promise<any[]> {
    return this.breaker.fire(email);
  }
}
