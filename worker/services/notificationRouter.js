const logger = require("../utils/logger");

/**
 * NotificationRouter — Multi-channel, multi-provider routing engine.
 *
 * Features:
 *  - Sequential fallback (try next provider on failure)
 *  - Circuit breaker (disable provider after N failures, re-enable after cooldown)
 *  - Weighted routing (configurable % split between providers)
 *  - Per-provider latency + success/failure tracking
 */
class NotificationRouter {
  constructor(providers) {
    this.providers = providers; // { email: [...], sms: [...], push: [...] }
    this.circuitState = {};     // { providerName: { failures, lastFailure, open } }
    this.stats = {};            // { providerName: { sent, failed, totalLatencyMs } }

    // Circuit breaker config
    this.FAILURE_THRESHOLD = Number(process.env.CIRCUIT_FAILURE_THRESHOLD || 5);
    this.COOLDOWN_MS = Number(process.env.CIRCUIT_COOLDOWN_MS || 60000);
  }

  _getCircuit(name) {
    if (!this.circuitState[name]) {
      this.circuitState[name] = { failures: 0, lastFailure: 0, open: false };
    }
    return this.circuitState[name];
  }

  _getStats(name) {
    if (!this.stats[name]) {
      this.stats[name] = { sent: 0, failed: 0, totalLatencyMs: 0 };
    }
    return this.stats[name];
  }

  _isCircuitOpen(name) {
    const c = this._getCircuit(name);
    if (!c.open) return false;
    // Check cooldown
    if (Date.now() - c.lastFailure > this.COOLDOWN_MS) {
      c.open = false;
      c.failures = 0;
      logger.info({ provider: name }, "circuit_breaker_closed");
      return false;
    }
    return true;
  }

  _recordSuccess(name) {
    const c = this._getCircuit(name);
    c.failures = 0;
    c.open = false;
  }

  _recordFailure(name) {
    const c = this._getCircuit(name);
    c.failures++;
    c.lastFailure = Date.now();
    if (c.failures >= this.FAILURE_THRESHOLD) {
      c.open = true;
      logger.warn({ provider: name, failures: c.failures }, "circuit_breaker_opened");
    }
  }

  /**
   * Select provider by weighted random from available (non-open-circuit) providers.
   * Falls back to sequential if weighted selection fails.
   */
  _selectByWeight(providerList) {
    const available = providerList.filter(p => !this._isCircuitOpen(p.name));
    if (!available.length) return providerList; // try all if everything is open

    const totalWeight = available.reduce((sum, p) => sum + (p.weight || 1), 0);
    const rand = Math.random() * totalWeight;
    let cumulative = 0;

    // Reorder: weighted pick first, then the rest as fallbacks
    const ordered = [];
    let picked = null;
    for (const p of available) {
      cumulative += (p.weight || 1);
      if (!picked && rand <= cumulative) {
        picked = p;
      } else {
        ordered.push(p);
      }
    }
    if (picked) ordered.unshift(picked);
    return ordered;
  }

  /**
   * Route a notification through the appropriate channel.
   *
   * @param {string} channel - "email", "sms", or "push"
   * @param {object} payload - { to, subject, body, html, data, eventName }
   * @returns {{ messageId, provider, channel, latencyMs }}
   */
  async route(channel, payload) {
    const providerList = this.providers[channel];
    if (!providerList || !providerList.length) {
      throw new Error(`No providers configured for channel: ${channel}`);
    }

    const ordered = this._selectByWeight(providerList);
    const errors = [];

    for (const entry of ordered) {
      const { instance, name } = entry;
      if (this._isCircuitOpen(name)) continue;

      const start = Date.now();
      try {
        const result = await instance.send(payload);
        const latencyMs = Date.now() - start;

        this._recordSuccess(name);
        const stats = this._getStats(name);
        stats.sent++;
        stats.totalLatencyMs += latencyMs;

        logger.info({ provider: name, channel, latencyMs, to: payload.to }, "notification_delivered");

        return {
          messageId: result.messageId,
          provider: name,
          channel,
          latencyMs
        };
      } catch (err) {
        const latencyMs = Date.now() - start;
        this._recordFailure(name);
        const stats = this._getStats(name);
        stats.failed++;
        stats.totalLatencyMs += latencyMs;

        logger.warn({ provider: name, channel, error: err.message, latencyMs }, "provider_failed_trying_next");
        errors.push({ provider: name, error: err.message, latencyMs });
      }
    }

    // All providers failed
    const err = new Error(`All ${channel} providers failed: ${errors.map(e => `${e.provider}:${e.error}`).join(", ")}`);
    err.providerErrors = errors;
    throw err;
  }

  /**
   * Send an email specifically (convenience method).
   */
  async sendEmail(payload) {
    return this.route("email", payload);
  }

  /**
   * Send an SMS.
   */
  async sendSms(payload) {
    return this.route("sms", payload);
  }

  /**
   * Send a push notification.
   */
  async sendPush(payload) {
    return this.route("push", payload);
  }

  /**
   * Get provider stats for analytics.
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Get circuit breaker status.
   */
  getCircuitStatus() {
    return { ...this.circuitState };
  }
}

module.exports = NotificationRouter;
