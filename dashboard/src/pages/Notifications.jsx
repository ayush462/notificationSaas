import { useEffect, useState } from "react";
import api from "../lib/api";
import Badge from "../components/Badge";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ recipientEmail: "", subject: "", body: "" });
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/v1/notifications?limit=100");
      setItems(res.data.data || []);
    } catch (e) {
      setMessage(e.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setMessage("");
    try {
      await api.post("/v1/notifications", form, {
        headers: { "x-idempotency-key": `${Date.now()}-${form.recipientEmail}` }
      });
      setForm({ recipientEmail: "", subject: "", body: "" });
      setMessage("Queued successfully.");
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Request failed");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Send email</h1>
        <p className="mt-1 text-sm text-ink-muted">Your app calls the same endpoint with the API key below.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <form className="card space-y-4" onSubmit={submit}>
          <h2 className="text-sm font-semibold text-ink">Compose</h2>
          <div>
            <label className="label">Recipient</label>
            <input
              className="input"
              type="email"
              required
              placeholder="user@company.com"
              value={form.recipientEmail}
              onChange={(e) => setForm((p) => ({ ...p, recipientEmail: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Subject</label>
            <input
              className="input"
              required
              placeholder="Invoice ready"
              value={form.subject}
              onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Body</label>
            <textarea
              className="input min-h-[120px]"
              required
              placeholder="Plain text body"
              value={form.body}
              onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Queue notification
          </button>
          {message && <p className="text-sm text-ink-muted">{message}</p>}
        </form>

        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Integration</h2>
            <button type="button" className="btn btn-secondary text-xs" onClick={load}>
              Refresh
            </button>
          </div>
          <pre className="overflow-x-auto rounded-lg border border-surface-border bg-surface-muted p-4 text-xs leading-relaxed text-ink">
{`curl -X POST ${
  import.meta.env.VITE_API_URL || "http://localhost:3000"
}/v1/notifications \\
  -H "x-api-key: YOUR_KEY" \\
  -H "x-idempotency-key: unique-id" \\
  -H "Content-Type: application/json" \\
  -d '{"recipientEmail":"a@b.com","subject":"Hi","body":"..."}'`}
          </pre>
          {loading ? (
            <p className="mt-4 text-sm text-ink-muted">Loading…</p>
          ) : (
            <div className="table-wrap mt-4">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>To</th>
                    <th>ID</th>
                  </tr>
                </thead>
                <tbody>
                  {items.slice(0, 15).map((n) => (
                    <tr key={n.id}>
                      <td>
                        <Badge
                          variant={
                            n.status === "sent"
                              ? "success"
                              : n.status === "failed"
                                ? "danger"
                                : "default"
                          }
                        >
                          {n.status}
                        </Badge>
                      </td>
                      <td className="max-w-[140px] truncate text-xs">{n.recipient_email}</td>
                      <td className="font-mono text-xs text-ink-muted">{n.id.slice(0, 12)}…</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
