declare class NotifySDK {
  constructor(apiKey: string, options?: {
    baseUrl?: string;
    maxRetries?: number;
    timeoutMs?: number;
    debug?: boolean;
  });

  /** Send event-based notification using a template */
  track(eventName: string, data: Record<string, any> & { email: string }, options?: {
    metadata?: Record<string, any>;
    channel?: "email" | "sms" | "push";
    priority?: "low" | "normal" | "high";
  }): Promise<{ id: string; status: string }>;

  /** Send a direct email */
  send(params: {
    to: string;
    subject: string;
    body: string;
    metadata?: Record<string, any>;
  }): Promise<{ id: string; status: string }>;

  /** Send an SMS */
  sendSms(params: {
    to: string;
    body: string;
    metadata?: Record<string, any>;
  }): Promise<{ id: string; status: string }>;

  /** Send a push notification */
  sendPush(params: {
    token: string;
    title: string;
    body: string;
    data?: Record<string, any>;
    metadata?: Record<string, any>;
  }): Promise<{ id: string; status: string }>;

  /** Send batch notifications (max 100) */
  sendBatch(notifications: Array<Record<string, any>>): Promise<{
    results: Array<{ index: number; id: string; status: string }>;
    errors: Array<{ index: number; error: string }>;
    total: number;
    succeeded: number;
    failed: number;
  }>;

  /** List notifications */
  listNotifications(params?: {
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<any>;

  /** Check API health */
  health(): Promise<{ ok: boolean }>;
}

declare class NotifyError extends Error {
  status: number;
  response: any;
  constructor(message: string, status: number, response: any);
}

export = NotifySDK;
export { NotifyError };
