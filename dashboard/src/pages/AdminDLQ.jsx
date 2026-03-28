import { useEffect, useState } from "react";
import api from "../lib/api";
import Badge from "../components/Badge";
import { useToast } from "../components/Toast";
import { PageLoader } from "../components/LoadingSpinner";
import { RotateCcw, ShieldAlert } from "lucide-react";

export default function AdminDLQ() {
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/v1/admin/dlq?limit=100");
      setItems(res.data.data || []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function requeue(id) {
    try {
      await api.post(`/v1/admin/dlq/${id}/requeue`);
      addToast(`Requeued ${id}`, "success");
      await load();
    } catch (e) {
      addToast(e.response?.data?.message || "Requeue failed", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">System DLQ</h1>
        <p className="mt-1 text-sm text-ink-muted">Failed notifications across all projects.</p>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium">{items.length} failed across platform</span>
          </div>
          <button onClick={load} className="btn btn-secondary text-sm">Refresh</button>
        </div>

        {loading ? <PageLoader /> : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Project</th>
                  <th>Recipient</th>
                  <th>Subject</th>
                  <th>Attempts</th>
                  <th>Error</th>
                  <th>Failed At</th>
                  <th className="w-20">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((n) => (
                  <tr key={n.id}>
                    <td className="font-mono text-xs">{n.id?.slice(0, 14)}…</td>
                    <td className="text-xs">
                      <Badge variant="default">{n.project_name || "—"}</Badge>
                    </td>
                    <td className="max-w-[140px] truncate text-sm">{n.recipient_email}</td>
                    <td className="max-w-[160px] truncate text-xs">{n.subject}</td>
                    <td className="tabular-nums">{n.attempts}</td>
                    <td className="max-w-[200px] truncate text-xs text-red-600">{n.error_message}</td>
                    <td className="whitespace-nowrap text-xs text-ink-muted">
                      {n.processed_at ? new Date(n.processed_at).toLocaleString() : "—"}
                    </td>
                    <td>
                      <button onClick={() => requeue(n.id)} className="inline-flex items-center gap-1 text-xs font-medium text-ink hover:underline">
                        <RotateCcw className="h-3 w-3" /> Retry
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !items.length && (
          <p className="py-8 text-center text-sm text-ink-muted"> All clear — no failed notifications.</p>
        )}
      </div>
    </div>
  );
}
