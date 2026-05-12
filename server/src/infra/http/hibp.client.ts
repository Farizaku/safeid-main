import axios, { AxiosInstance } from 'axios';
import CircuitBreaker from 'opossum';
import { createHash } from 'crypto';

export interface HibpClientOptions {
  apiKey: string;
  baseUrl?: string;
  userAgent?: string;
}

export class HibpClient {
  private axios: AxiosInstance;
  private breaker: any;
  private hasApiKey: boolean;
  private missingApiKeyWarned = false;

  constructor(options: HibpClientOptions) {
    const baseUrl = options.baseUrl || 'https://haveibeenpwned.com/api/v3';
    const apiKey = (options.apiKey || '').trim();

    this.hasApiKey = apiKey.length > 0;

    this.axios = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      headers: {
        'hibp-api-key': apiKey,
        'User-Agent': options.userAgent || 'safeid-backend',
      },
    });

    // Wrap the HTTP call in a circuit breaker
    const httpCall = async (email: string) => {
      try {
        return await this.checkAccountDirect(email);
      } catch (err: any) {
        const status = err?.response?.status;

        if (status === 401 || status === 403) {
          return this.checkAccountByRange(email);
        }

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

  private async checkAccountDirect(email: string): Promise<any[]> {
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
  }

  private async checkAccountByRange(email: string): Promise<any[]> {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const sha1 = createHash('sha1').update(normalizedEmail).digest('hex').toUpperCase();
      const prefix = sha1.slice(0, 6);
      const suffix = sha1.slice(6);

      const response = await this.axios.get(`/breachedaccount/range/${prefix}`);
      const entries = Array.isArray(response.data) ? response.data : [];
      const matchedAccount = entries.find((entry: any) => {
        const entrySuffix = entry?.hashSuffix || entry?.HashSuffix || entry?.suffix;
        return entrySuffix === suffix;
      });

      if (!matchedAccount) {
        return [];
      }

      const websites =
        (matchedAccount.websites as string[]) ||
        (matchedAccount.Websites as string[]) ||
        (matchedAccount.breaches as string[]) ||
        [];

      const uniqueBreachNames = Array.from(new Set(websites));
      const breaches = await Promise.all(
        uniqueBreachNames.map(async (breachName: string) => {
          const breachResponse = await this.axios.get(`/breach/${encodeURIComponent(breachName)}`);
          return breachResponse.data;
        })
      );

      return breaches.filter(Boolean);
    } catch (err: any) {
      const status = err?.response?.status;

      // Treat auth errors in degraded mode so signup can still complete with a safe snapshot.
      if (status === 401 || status === 403 || status === 404) {
        return [];
      }

      throw err;
    }
  }

  async checkAccount(email: string): Promise<any[]> {
    if (!this.hasApiKey) {
      if (!this.missingApiKeyWarned) {
        console.warn('[HIBP Client] HIBP_API_KEY not configured. Returning empty result in degraded mode.');
        this.missingApiKeyWarned = true;
      }

      return [];
    }

    try {
      return await this.breaker.fire(email);
    } catch (err: any) {
      const status = err?.response?.status;
      const message = String(err?.message || '');

      if (status === 401 || status === 403 || /breaker is open/i.test(message)) {
        return [];
      }

      throw err;
    }
  }
}
