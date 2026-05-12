/**
 * Mock HIBP Client para testes sem chave real
 * Simula respostas reais da API HIBP
 */

import { EventEmitter } from 'events';

export class MockHibpClient extends EventEmitter {
  private isOpen = false;

  async checkAccount(email: string): Promise<any[]> {
    // Simula delay da API
    await new Promise(resolve => setTimeout(resolve, 500));

    // Emails conhecidos com breaches
    const knownBreaches: { [key: string]: any[] } = {
      'breached@example.com': [
        {
          Name: 'Equifax',
          Title: 'Equifax Data Breach',
          BreachDate: '2017-07-29',
          DataClasses: ['Email addresses', 'Names', 'SSNs'],
          IsVerified: true,
        },
        {
          Name: 'LinkedIn',
          Title: 'LinkedIn Data Exposure',
          BreachDate: '2021-06-22',
          DataClasses: ['Email addresses', 'Phone numbers'],
          IsVerified: true,
        },
      ],
      'clean@example.com': [],
      'test@example.com': [
        {
          Name: 'TestBreach',
          Title: 'Test Data Breach',
          BreachDate: '2024-01-15',
          DataClasses: ['Email addresses', 'Passwords'],
          IsVerified: false,
        },
      ],
    };

    const breaches = knownBreaches[email.toLowerCase()] || [];
    
    console.log(`[MockHibpClient] Checking ${email}: ${breaches.length} breach(es) found`);
    
    return breaches;
  }

  on(event: string, listener: any): this {
    if (event === 'open') {
      console.log('[MockHibpClient] Circuit breaker opened (mock)');
    } else if (event === 'close') {
      console.log('[MockHibpClient] Circuit breaker closed (mock)');
    }
    return super.on(event, listener);
  }

  async shutdown(): Promise<void> {
    console.log('[MockHibpClient] Shutdown');
  }
}
