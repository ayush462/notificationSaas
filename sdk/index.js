const crypto = require("crypto");

/**
 * NotifyStack SDK — Production-grade notification client.
 *
 * Supports: Email, SMS, Push notifications
 * Features: Auto-retry, idempotency, batch sending, debug mode, rate limit handling
 *
 * Usage:
 *   const NotifySDK = require("notify-saas-sdk");
 *   const notify = new NotifySDK("ntf_live_xxxxxxxxx");
 *   await notify.track("USER_LOGIN", { email: "user@email.com", name: "Ayush" });
 */
class NotifySDK {
  /**
   * @param {string} apiKey - Your NotifyStack API key (ntf_live_xxx)
   * @param {object} [options]
   * @param {string} [options.baseUrl="https://api.notifystack.shop"] - API base URL
   * @param {number} [options.maxRetries=3] - Max retry attempts
   * @param {number} [options.timeoutMs=10000] - Request timeout in ms
   * @param {boolean} [options.debug=false] - Enable verbose logging
   */
  constructor(apiKey, options = {}) {
    if (!apiKey || !apiKey.startsWith("ntf_live_")) {
      throw new Error("Invalid API key. Must start with 'ntf_live_'");
    }
    this.apiKey = apiKey;
    this.baseUrl = (options.baseUrl || "https://api.notifystack.shop").replace(/\/$/, "");
    this.maxRetries = options.maxRetries ?? 3;
    this.timeoutMs = options.timeoutMs ?? 30000;
    this.debug = options.debug || false;
  }

  _log(...args) {
    if (this.debug) console.log("[NotifySDK]", ...args);
  }

  /**
   * Send an event-based notification using a registered template.
   * @param {string} eventName - Event name (e.g. "USER_LOGIN", "ORDER_PLACED")
   * @param {object} data - Template variables (must include `email`)
   * @param {object} [options] - { metadata, channel, priority }
   * @returns {Promise<{id: string, status: string}>}
   */
  async track(eventName, data, options = {}) {
    if (!eventName) throw new Error("eventName is required");
    if (!data || !data.email) throw new Error("data.email is required for event-based notifications");

    this._log(`track(${eventName})`, data);
    return this._request("POST", "/v1/notifications", {
      event: eventName,
      data,
      channel: options.channel || "email",
      metadata: options.metadata || options
    });
  }

  /**
   * Send a direct email notification (no template).
   * @param {object} params
   * @param {string} params.to - Recipient email
   * @param {string} params.subject - Email subject
   * @param {string} params.body - Email body
   * @param {object} [params.metadata]
   * @returns {Promise<{id: string, status: string}>}
   */
  async send({ to, subject, body, metadata }) {
    if (!to || !subject || !body) throw new Error("to, subject, and body are required");

    this._log(`send() to=${to}`);
    return this._request("POST", "/v1/notifications", {
      recipientEmail: to,
      subject,
      body,
      channel: "email",
      metadata
    });
  }

  /**
   * Send an SMS notification.
   * @param {object} params
   * @param {string} params.to - Phone number (E.164 format)
   * @param {string} params.body - SMS body (max 1600 chars)
   * @param {object} [params.metadata]
   * @returns {Promise<{id: string, status: string}>}
   */
  async sendSms({ to, body, metadata }) {
    if (!to || !body) throw new Error("to and body are required");
    if (body.length > 1600) throw new Error("SMS body exceeds 1600 character limit");

    this._log(`sendSms() to=${to}`);
    return this._request("POST", "/v1/notifications", {
      recipientPhone: to,
      subject: "SMS",
      body,
      channel: "sms",
      metadata
    });
  }

  /**
   * Send a push notification.
   * @param {object} params
   * @param {string} params.token - Device token or subscription JSON
   * @param {string} params.title - Notification title
   * @param {string} params.body - Notification body
   * @param {object} [params.data] - Custom data payload
   * @param {object} [params.metadata]
   * @returns {Promise<{id: string, status: string}>}
   */
  async sendPush({ token, title, body, data, metadata }) {
    if (!token || !title || !body) throw new Error("token, title, and body are required");

    this._log(`sendPush() title=${title}`);
    return this._request("POST", "/v1/notifications", {
      deviceToken: token,
      subject: title,
      body,
      channel: "push",
      metadata: { ...metadata, pushData: data }
    });
  }

  /**
   * Send multiple notifications in a batch.
   * @param {Array<object>} notifications - Array of notification payloads
   * @returns {Promise<Array<{id: string, status: string}>>}
   */
  async sendBatch(notifications) {
    if (!Array.isArray(notifications) || !notifications.length) {
      throw new Error("notifications must be a non-empty array");
    }
    if (notifications.length > 100) {
      throw new Error("Batch size cannot exceed 100");
    }

    this._log(`sendBatch() count=${notifications.length}`);
    const results = [];
    const errors = [];

    // Process in parallel with concurrency limit of 10
    const chunks = [];
    for (let i = 0; i < notifications.length; i += 10) {
      chunks.push(notifications.slice(i, i + 10));
    }

    for (const chunk of chunks) {
      const promises = chunk.map(async (n, idx) => {
        try {
          const result = await this._request("POST", "/v1/notifications", n);
          results.push({ index: idx, ...result });
        } catch (e) {
          errors.push({ index: idx, error: e.message });
        }
      });
      await Promise.all(promises);
    }

    return { results, errors, total: notifications.length, succeeded: results.length, failed: errors.length };
  }

  /**
   * List notifications for the project.
   * @param {object} [params]
   * @param {number} [params.limit=50]
   * @param {number} [params.offset=0]
   * @param {string} [params.status]
   * @returns {Promise<object>}
   */
  async listNotifications(params = {}) {
    const qs = new URLSearchParams();
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.offset) qs.set("offset", String(params.offset));
    if (params.status) qs.set("status", params.status);
    const query = qs.toString();
    return this._request("GET", `/v1/notifications${query ? "?" + query : ""}`);
  }

  /**
   * Check API health.
   * @returns {Promise<{ok: boolean}>}
   */
  async health() {
    return this._request("GET", "/health");
  }

  /**
   * Internal: HTTP request with retry, idempotency, and 429 handling.
   */
  async _request(method, path, body) {
    const idempotencyKey = `idem_${crypto.randomUUID()}`;
    let lastError;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      const start = Date.now();
      try {
        const url = `${this.baseUrl}${path}`;
        const headers = {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "x-idempotency-key": idempotencyKey,
          "User-Agent": "NotifyStack-SDK/2.0"
        };

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

        const fetchOptions = { method, headers, signal: controller.signal };
        if (body && method !== "GET") fetchOptions.body = JSON.stringify(body);

        const response = await fetch(url, fetchOptions);
        clearTimeout(timeout);

        const json = await response.json();
        const latency = Date.now() - start;

        this._log(`${method} ${path} → ${response.status} (${latency}ms)`);

        if (response.ok) return json.data || json;

        // Rate limited — wait and retry
        if (response.status === 429) {
          const retryAfter = response.headers.get("retry-after");
          const waitMs = retryAfter ? Number(retryAfter) * 1000 : 5000;
          this._log(`Rate limited. Waiting ${waitMs}ms...`);
          await new Promise(r => setTimeout(r, waitMs));
          continue;
        }

        // Don't retry client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          throw new NotifyError(json.message || "Request failed", response.status, json);
        }

        lastError = new NotifyError(json.message || "Request failed", response.status, json);
      } catch (e) {
        if (e instanceof NotifyError && e.status >= 400 && e.status < 500) throw e;
        lastError = e;
        this._log(`Attempt ${attempt + 1} failed: ${e.message}`);
      }

      // Exponential backoff with jitter
      if (attempt < this.maxRetries - 1) {
        const base = Math.min(1000 * Math.pow(2, attempt), 10000);
        const jitter = base * 0.2 * (Math.random() * 2 - 1);
        const delay = Math.round(base + jitter);
        this._log(`Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }

    throw lastError || new Error("Request failed after retries");
  }
}

class NotifyError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = "NotifyError";
    this.status = status;
    this.response = response;
  }
}

module.exports = {
  NotifySDK,
  NotifyError
};
