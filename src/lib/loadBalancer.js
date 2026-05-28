/**
 * Client-Side Load Balancer & Resilient Request Manager
 * Implements:
 * 1. Exponential Backoff Retry Logic
 * 2. Concurrent Request Queuing (Concurrency Limiting)
 * 3. Circuit Breaker (Trips on failure, resets after cooldown)
 * 4. Client-side Rate Limiting (Token Bucket approach)
 * 5. In-flight GET Request Deduplication
 * 6. Quick Timeout handling
 */

class LoadBalancer {
  constructor() {
    // Retry Configs
    this.maxRetries = 3;
    this.initialDelayMs = 500;

    // Concurrency / Queue Configs
    this.maxConcurrency = 5;
    this.activeConnections = 0;
    this.queue = [];

    // Rate Limiting (Token Bucket)
    // 20 requests max burst, refills at 10 tokens per second
    this.maxTokens = 20;
    this.tokens = 20;
    this.refillRate = 10; // tokens per second
    this.lastRefillTime = Date.now();

    // Circuit Breaker State (Per-Endpoint / Host basis)
    // For local Next.js relative endpoints, we treat them as a single target "local"
    this.failureThreshold = 5;
    this.cooldownPeriodMs = 15000; // 15 seconds
    this.failureCount = 0;
    this.circuitState = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.lastStateChange = Date.now();

    // GET Request Deduplication
    this.inflightGetRequests = new Map();
  }

  // Refill tokens for rate limiting
  _refillTokens() {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefillTime) / 1000;
    this.lastRefillTime = now;
    
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsedSeconds * this.refillRate);
  }

  // Check rate limit (returns true if allowed, false if rate limited)
  _checkRateLimit() {
    this._refillTokens();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }

  // Check Circuit Breaker status
  _checkCircuit() {
    if (this.circuitState === 'OPEN') {
      const now = Date.now();
      if (now - this.lastStateChange > this.cooldownPeriodMs) {
        this.circuitState = 'HALF_OPEN';
        this.lastStateChange = now;
        console.warn('[LOAD BALANCER] Circuit entering HALF_OPEN state. Testing endpoint...');
      } else {
        return false; // Circuit is OPEN, fail fast
      }
    }
    return true; // Circuit is CLOSED or HALF_OPEN
  }

  // Report request outcome to Circuit Breaker
  _reportSuccess() {
    this.failureCount = 0;
    if (this.circuitState === 'HALF_OPEN') {
      this.circuitState = 'CLOSED';
      this.lastStateChange = Date.now();
      console.log('[LOAD BALANCER] Circuit returned to CLOSED state. Recovery successful!');
    }
  }

  _reportFailure() {
    this.failureCount += 1;
    console.error(`[LOAD BALANCER] Request failure. Failure count: ${this.failureCount}/${this.failureThreshold}`);
    if (this.failureCount >= this.failureThreshold && this.circuitState !== 'OPEN') {
      this.circuitState = 'OPEN';
      this.lastStateChange = Date.now();
      console.error('[LOAD BALANCER] CIRCUIT BREAKER TRIPPED! Fast failing future requests for 15s.');
    }
  }

  /**
   * Main Request Orchestrator
   * Wraps an async fetch or operation with queueing, rate-limiting, deduplication, retries, and circuit breaker.
   */
  async execute(requestFn, options = {}) {
    const { url, method = 'GET', deduplicate = true } = options;
    const isGet = method.toUpperCase() === 'GET';

    // 1. GET Request Deduplication
    if (isGet && deduplicate && url) {
      if (this.inflightGetRequests.has(url)) {
        console.log(`[LOAD BALANCER] Deduplicated GET request to: ${url}`);
        return this.inflightGetRequests.get(url);
      }
    }

    const promise = this._queueRequest(async () => {
      let retryCount = 0;
      let delay = this.initialDelayMs;

      while (true) {
        // 2. Check Circuit Breaker
        if (!this._checkCircuit()) {
          throw new Error('Circuit Breaker is OPEN. Request blocked to prevent server overload. Please try again in a few seconds.');
        }

        // 3. Check Rate Limit
        while (!this._checkRateLimit()) {
          console.warn('[LOAD BALANCER] Client-side Rate Limit reached. Pausing request...');
          await new Promise(r => setTimeout(r, 100)); // Sleep 100ms and check again
        }

        try {
          // Add default timeout (30 seconds) to request execution
          const result = await this._withTimeout(requestFn(), options.timeoutMs || 30000);
          
          // Request succeeded
          this._reportSuccess();
          return result;
        } catch (error) {
          // If circuit is half-open, any failure trips it immediately back to OPEN
          if (this.circuitState === 'HALF_OPEN') {
            this.circuitState = 'OPEN';
            this.lastStateChange = Date.now();
            console.error('[LOAD BALANCER] Half-open test failed! Re-tripping circuit to OPEN.');
            throw error;
          }

          // Decide whether to retry (only retry network errors or 5xx server issues, not 4xx client issues)
          const isServerOrNetworkError = !error.status || (error.status >= 500 && error.status < 600) || error.message.includes('timeout') || error.message.includes('fetch');
          
          if (isServerOrNetworkError && retryCount < this.maxRetries) {
            retryCount++;
            console.warn(`[LOAD BALANCER] Retrying request (Attempt ${retryCount}/${this.maxRetries}) in ${delay}ms due to error: ${error.message}`);
            await new Promise(r => setTimeout(r, delay));
            delay *= 2; // Exponential backoff
            continue;
          }

          // Max retries reached or non-retryable error
          this._reportFailure();
          throw error;
        }
      }
    });

    if (isGet && deduplicate && url) {
      this.inflightGetRequests.set(url, promise);
      try {
        return await promise;
      } finally {
        this.inflightGetRequests.delete(url);
      }
    }

    return promise;
  }

  // Queue wrapper to enforce concurrency limit
  async _queueRequest(taskFn) {
    if (this.activeConnections >= this.maxConcurrency) {
      await new Promise((resolve) => {
        this.queue.push(resolve);
      });
    }

    this.activeConnections++;
    try {
      return await taskFn();
    } finally {
      this.activeConnections--;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        next();
      }
    }
  }

  // Add standard timeout to promise
  _withTimeout(promise, ms) {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Request timed out after ${ms}ms`));
      }, ms);
    });

    return Promise.race([
      promise,
      timeoutPromise
    ]).then(
      (result) => {
        clearTimeout(timeoutId);
        return result;
      },
      (error) => {
        clearTimeout(timeoutId);
        throw error;
      }
    );
  }

  // Simple async Health Check endpoint validator
  async runHealthCheck(url) {
    try {
      const start = Date.now();
      const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
      const latency = Date.now() - start;
      return { ok: res.ok, status: res.status, latencyMs: latency };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }
}

export const loadBalancer = new LoadBalancer();
