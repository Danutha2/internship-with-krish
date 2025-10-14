import { Logger } from '@nestjs/common';

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

interface CircuitBreakerOptions<T> {
  threshold: number;                 // 0.5 for 50% failures
  requestVolume: number;            // total number of recent requests to track
  minRequestsBeforeEvaluate: number; // minimum number of requests before evaluating
  cooldown: number;                // cooldown time in ms
  halfOpenRequests: number;        // number of probe requests before deciding to close/open again
  fallback: () => T;               // function to return fallback value
}

export class CircuitBreaker<T> {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number[] = [];
  private lastStateChange = Date.now();
  private halfOpenCounter = 0;
  private halfOpenSuccesses = 0;
  private halfOpenFailures = 0;
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
    this.logger.debug(`Failures recorded: ${this.failures.length}`);
    this.logger.debug(
      `Recorded result: ${success ? 'success' : 'failure'}, current failure rate: ${this.failureRate().toFixed(2)}`
    );
  }

  private failureRate(): number {
    if (this.failures.length === 0) return 0;
    return this.failures.reduce((a, b) => a + b, 0) / this.failures.length;
  }

  private canAttempt(): boolean {
    if (this.state === CircuitState.OPEN) {
      const now = Date.now();
      if (now - this.lastStateChange > this.options.cooldown) {
        this.state = CircuitState.HALF_OPEN;
        this.halfOpenCounter = 0;
        this.halfOpenSuccesses = 0;
        this.halfOpenFailures = 0;
        this.logger.warn('Circuit breaker transitioned from OPEN to HALF_OPEN');
      } else {
        this.logger.warn('Circuit breaker is OPEN, request blocked');
        return false;
      }
    }
    return true;
  }

  private evaluateHalfOpenState() {
    const failureRate = this.halfOpenFailures / this.halfOpenCounter;
    if (failureRate <= this.options.threshold) {
      this.state = CircuitState.CLOSED;
      this.failures = [];
      this.lastStateChange = Date.now();
      this.logger.log(
        `Circuit breaker CLOSED after HALF_OPEN. Failure rate: ${failureRate.toFixed(2)}`
      );
    } else {
      this.state = CircuitState.OPEN;
      this.lastStateChange = Date.now();
      this.logger.error(
        `Circuit breaker REOPENED after HALF_OPEN. Failure rate ${failureRate.toFixed(2)} exceeded threshold ${this.options.threshold}`
      );
    }
  }

  async exec(fn: () => Promise<T>): Promise<T> {
    if (!this.canAttempt()) {
      this.logger.warn('Executing fallback due to circuit breaker OPEN state');
      return this.options.fallback();
    }

    try {
      const result = await fn();

      if (this.state === CircuitState.HALF_OPEN) {
        this.halfOpenCounter++;
        this.halfOpenSuccesses++;
        this.logger.debug(
          `HALF_OPEN probe succeeded (${this.halfOpenCounter}/${this.options.halfOpenRequests})`
        );

        if (this.halfOpenCounter >= this.options.halfOpenRequests) {
          this.evaluateHalfOpenState();
        }
      }

      this.record(true);
      return result;
    } catch (err) {
      if (this.state === CircuitState.HALF_OPEN) {
        this.halfOpenCounter++;
        this.halfOpenFailures++;
        this.logger.debug(
          `HALF_OPEN probe failed (${this.halfOpenCounter}/${this.options.halfOpenRequests})`
        );

        if (this.halfOpenCounter >= this.options.halfOpenRequests) {
          this.evaluateHalfOpenState();
        }

        this.logger.warn('Executing fallback due to failure in HALF_OPEN');
        return this.options.fallback();
      }

      this.record(false);

      if (
        this.state === CircuitState.CLOSED &&
        this.failures.length >= this.options.minRequestsBeforeEvaluate &&
        this.failureRate() >= this.options.threshold
      ) {
        this.state = CircuitState.OPEN;
        this.lastStateChange = Date.now();
        this.logger.error(
          `Circuit breaker OPENED — failure rate ${this.failureRate().toFixed(2)} exceeded threshold ${this.options.threshold}`
        );
      }

      this.logger.warn('Executing fallback due to failure');
      return this.options.fallback();
    }
  }
}
