import { useEffect, useState } from "react";
import { useProject } from "../contexts/ProjectContext";
import { useToast } from "../components/Toast";
import api from "../lib/api";
import Badge from "../components/Badge";
import { PageLoader } from "../components/LoadingSpinner";
import { RotateCcw, AlertTriangle } from "lucide-react";

export default function DLQ() {
  const { current } = useProject();
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [busy, setBusy] = useState(false);

  async function load() {
    if (!current) return;
    setLoading(true);
    try {
      const res = await api.get(`/v1/dashboard/notifications/dlq?projectId=${current.id}&limit=100`);
      setItems(res.data.data || []);
      setSelected(new Set());
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [current?.id]);

  async function requeueSingle(id) {
    try {
      await api.post(`/v1/dashboard/notifications/dlq/${id}/requeue?projectId=${current.id}`);
      addToast(`Requeued ${id}`, "success");
      await load();
    } catch (e) {
      addToast(e.response?.data?.message || "Requeue failed", "error");
    }
  }

  async function requeueBulk() {
    if (!selected.size) return;
    setBusy(true);
    try {
      const res = await api.post(`/v1/dashboard/notifications/dlq/requeue-bulk?projectId=${current.id}`, {
        ids: [...selected]
      });
      addToast(`Requeued ${res.data.data?.count || 0} notifications`, "success");
      await load();
    } catch (e) {
      addToast(e.response?.data?.message || "Bulk requeue failed", "error");
    } finally {
      setBusy(false);
    }
  }

  function toggleSelect(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === items.length) setSelected(new Set());
    else setSelected(new Set(items.map((i) => i.id)));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Dead Letter Queue</h1>
        <p className="mt-1 text-sm text-ink-muted">Failed notifications that exceeded retry limits.</p>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium">{items.length} failed notification{items.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="btn btn-secondary text-sm">Refresh</button>
            {selected.size > 0 && (
              <button onClick={requeueBulk} disabled={busy} className="btn btn-primary text-sm gap-1">
                <RotateCcw className="h-4 w-4" />
                Retry selected ({selected.size})
              </button>
            )}
          </div>
        </div>

        {loading ? <PageLoader /> : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-10">
                    <input
                      type="checkbox"
                      checked={items.length > 0 && selected.size === items.length}
                      onChange={toggleAll}
                      className="h-4 w-4 rounded border-neutral-300"
                    />
                  </th>
                  <th>ID</th>
                  <th>Recipient</th>
                  <th>Subject</th>
                  <th>Attempts</th>
                  <th>Error</th>
                  <th>Failed At</th>
                  <th className="w-24">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((n) => (
                  <tr key={n.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.has(n.id)}
                        onChange={() => toggleSelect(n.id)}
                        className="h-4 w-4 rounded border-neutral-300"
                      />
                    </td>
                    <td className="font-mono text-xs">{n.id?.slice(0, 14)}…</td>
                    <td className="max-w-[160px] truncate">{n.recipient_email}</td>
                    <td className="max-w-[180px] truncate text-xs">{n.subject}</td>
                    <td className="tabular-nums">{n.attempts}</td>
                    <td className="max-w-[200px] truncate text-xs text-red-600">{n.error_message}</td>
                    <td className="whitespace-nowrap text-xs text-ink-muted">
                      {n.processed_at ? new Date(n.processed_at).toLocaleString() : "—"}
                    </td>
                    <td>
                      <button
                        onClick={() => requeueSingle(n.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-ink hover:underline"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Retry
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !items.length && (
          <p className="py-8 text-center text-sm text-ink-muted"> No failed notifications. All clear!</p>
        )}
      </div>
    </div>
  );
}
