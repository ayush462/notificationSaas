export default function Architecture() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">How NotifyStack scales</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          This stack is designed to sell as <strong className="text-ink">notification infrastructure as a service</strong>: your
          customers integrate with an API key; you scale API nodes, workers, and Kafka partitions independently.
        </p>
      </div>

      <section className="card space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Request path</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink">
          <li>
            <strong>HTTPS API</strong> validates <code className="rounded bg-surface-muted px-1 text-xs">x-api-key</code>, applies{' '}
            <strong>Redis</strong> rate limits and idempotency, persists the job in <strong>PostgreSQL</strong>, then publishes to{' '}
            <strong>Kafka</strong> topic <code className="text-xs">email_queue</code>.
          </li>
          <li>
            <strong>Workers</strong> (horizontally scalable consumer group) read from Kafka, send via SMTP, update status in Postgres.
          </li>
          <li>
            After retries, failures go to <strong>DLQ topic</strong> and are marked failed — you can requeue from the dashboard or API.
          </li>
        </ol>
      </section>

      <section className="card space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Why each piece</h2>
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="font-semibold text-ink">Kafka</dt>
            <dd className="mt-1 text-ink-muted">
              Decouples API latency from email delivery. Add partitions and consumer instances to increase throughput without changing
              your app code.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-ink">Redis</dt>
            <dd className="mt-1 text-ink-muted">
              Fast per-tenant rate limiting and idempotency keys so retries and duplicate clicks do not double-send.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-ink">PostgreSQL</dt>
            <dd className="mt-1 text-ink-muted">
              Durable audit: notification rows, API key hashes, and structured activity logs for compliance and support.
            </dd>
          </div>
        </dl>
      </section>

      <section className="card space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Embedding in a website or app</h2>
        <p className="text-sm leading-relaxed text-ink-muted">
          End-users never call Kafka directly. Your <strong className="text-ink">backend</strong> (Node, Python, etc.) calls{' '}
          <code className="rounded bg-surface-muted px-1 text-xs">POST /v1/notifications</code> with the customer&apos;s tenant API key
          (or your key per environment). The browser only talks to your backend — keys stay server-side.
        </p>
      </section>

      <section className="rounded-xl border border-dashed border-surface-border bg-surface-muted p-6 text-sm text-ink-muted">
        <p>
          <strong className="text-ink">Production checklist:</strong> set <code className="text-xs">ADMIN_SECRET</code> on the API, use
          the same value in the dashboard credentials, enable TLS, and run multiple worker replicas behind the same Kafka cluster.
        </p>
      </section>
    </div>
  );
}
