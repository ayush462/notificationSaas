import { useEffect, useState } from "react";
import api from "../lib/api";
import Badge from "../components/Badge";

export default function DLQ() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState(() => new Set());
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const res = await api.get("/v1/notifications/dlq?limit=100");
      setItems(res.data.data || []);
      setSelected(new Set());
    } catch (e) {
      setMessage(e.response?.data?.message || "Failed to fetch DLQ");
    }
  }

  useEffect(() => {
    load();
  }, []);

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    if (selected.size === items.length) setSelected(new Set());
    else setSelected(new Set(items.map((i) => i.id)));
  }

  async function requeueOne(id) {
    setBusy(true);
    setMessage("");
    try {
      await api.post(`/v1/notifications/dlq/${id}/requeue`);
      await load();
    } catch (e) {
      setMessage(e.response?.data?.message || "Requeue failed");
    } finally {
      setBusy(false);
    }
  }

  async function requeueBulk() {
    const ids = [...selected];
    if (!ids.length) return;
    setBusy(true);
    setMessage("");
    try {
      const res = await api.post("/v1/notifications/dlq/requeue-bulk", { ids });
      const d = res.data.data;
      setMessage(`Requeued ${d.count}. Skipped: ${d.skipped?.length || 0}.`);
      await load();
    } catch (e) {
      setMessage(e.response?.data?.message || "Bulk requeue failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Dead letter queue</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Messages that exceeded retry limits. Requeue sends them back to the processing pipeline for your tenant.
        </p>
      </div>

      <div className="card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="btn btn-secondary text-sm" onClick={load} disabled={busy}>
              Refresh
            </button>
            <button type="button" className="btn btn-primary text-sm" onClick={requeueBulk} disabled={busy || !selected.size}>
              Requeue selected ({selected.size})
            </button>
            <button type="button" className="btn btn-secondary text-sm" onClick={selectAll}>
              {selected.size === items.length && items.length ? "Clear selection" : "Select all"}
            </button>
          </div>
          <Badge variant="danger">Failed</Badge>
        </div>
        {message && <p className="mb-4 text-sm text-ink">{message}</p>}
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-10" />
                <th>Notification</th>
                <th>Error</th>
                <th className="w-32">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((n) => (
                <tr key={n.id}>
                  <td>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-surface-border"
                      checked={selected.has(n.id)}
                      onChange={() => toggle(n.id)}
                    />
                  </td>
                  <td>
                    <div className="font-mono text-xs text-ink">{n.id}</div>
                    <div className="text-xs text-ink-muted">{n.recipient_email}</div>
                  </td>
                  <td className="max-w-md truncate text-xs text-red-800" title={n.error_message}>
                    {n.error_message || "—"}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-secondary px-2 py-1 text-xs"
                      disabled={busy}
                      onClick={() => requeueOne(n.id)}
                    >
                      Requeue
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!items.length && <p className="py-8 text-center text-sm text-ink-muted">No dead-letter items for this key.</p>}
      </div>
    </div>
  );
}
