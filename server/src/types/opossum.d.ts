declare module 'opossum' {
  interface CircuitBreakerOptions {
    timeout?: number;
    errorThresholdPercentage?: number;
    resetTimeout?: number;
    rollingCountTimeout?: number;
    rollingCountBuckets?: number;
    [key: string]: any;
  }

  type CircuitBreakerEvent = (...args: any[]) => void;

  class CircuitBreaker {
    constructor(func: (...args: any[]) => any, options?: CircuitBreakerOptions);
    fire(...args: any[]): Promise<any>;
    on(event: string, listener: CircuitBreakerEvent): this;
    off(event: string, listener: CircuitBreakerEvent): this;
    shutdown(): Promise<void>;
    [key: string]: any;
  }

  export default CircuitBreaker;
}
