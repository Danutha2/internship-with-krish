import { Logger } from '@nestjs/common';

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

interface CircuitBreakerOptions<T> {
  threshold: number;        // 50% failures
  requestVolume: number;    // last  requests to track
  cooldown: number;         // ms
  halfOpenRequests: number; // number of probe requests in half-open
  fallback: () => T;        // function to return fallback value
}

export class CircuitBreaker<T> {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number[] = [];
  private lastStateChange = Date.now();
  private halfOpenCounter = 0;
  private readonly logger = new Logger(CircuitBreaker.name);

  constructor(private options: CircuitBreakerOptions<T>) {}

  public getFallback(): T {
        return this.options.fallback();
    }

  private record(success: boolean) {
    this.failures.push(success ? 0 : 1);
    if (this.failures.length > this.options.requestVolume) {
      this.failures.shift();
    }
    this.logger.debug(`Recorded result: ${success ? 'success' : 'failure'}, current failure rate: ${this.failureRate().toFixed(2)}`);
  }

  private failureRate() {
    if (this.failures.length === 0) return 0;
    return this.failures.reduce((a, b) => a + b, 0) / this.failures.length;
  }

  private canAttempt() {
    if (this.state === CircuitState.OPEN) {
      const now = Date.now();
      if (now - this.lastStateChange > this.options.cooldown) {
        this.state = CircuitState.HALF_OPEN;
        this.halfOpenCounter = 0;
        this.logger.warn('Circuit breaker transitioned from OPEN to HALF_OPEN');
      } else {
        this.logger.warn('Circuit breaker is OPEN, request blocked');
        return false;
      }
    }
    return true;
  }

  async exec(fn: () => Promise<T>): Promise<T> {
    if (!this.canAttempt()) {
      this.logger.warn('Executing fallback due to circuit breaker state');
      return this.options.fallback();
    }

    try {
      const result = await fn();

      if (this.state === CircuitState.HALF_OPEN) {
        this.halfOpenCounter++;
        this.logger.debug(`HALF_OPEN probe succeeded (${this.halfOpenCounter}/${this.options.halfOpenRequests})`);
        if (this.halfOpenCounter >= this.options.halfOpenRequests) {
          this.state = CircuitState.CLOSED;
          this.failures = [];
          this.lastStateChange = Date.now();
          this.logger.log('Circuit breaker CLOSED, normal requests resumed');
        }
      }

      this.record(true);
      return result;
    } catch (err) {
      this.record(false);

      if (this.state === CircuitState.CLOSED && this.failureRate() >= this.options.threshold) {
        this.state = CircuitState.OPEN;
        this.lastStateChange = Date.now();
        this.logger.error('Circuit breaker OPENED due to high failure rate');
      } else if (this.state === CircuitState.HALF_OPEN) {
        this.state = CircuitState.OPEN;
        this.lastStateChange = Date.now();
        this.logger.error('Circuit breaker REOPENED in HALF_OPEN state due to failure');
      }

      this.logger.warn('Executing fallback due to failure');
      return this.options.fallback();
    }
  }
}
