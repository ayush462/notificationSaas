import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import Badge from "../components/Badge";
import { ArrowRight, Mail } from "lucide-react";

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/v1/notifications?limit=500")
      .then((res) => setItems(res.data.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const metrics = useMemo(() => {
    const queued = items.filter((x) => x.status === "queued" || x.status === "retrying").length;
    const sent = items.filter((x) => x.status === "sent").length;
    const dlq = items.filter((x) => x.status === "failed").length;
    return { queued, sent, dlq, total: items.length };
  }, [items]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Overview</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Usage for the tenant tied to your API key. Integrate from any backend with{' '}
          <code className="rounded bg-surface-muted px-1 py-0.5 text-xs">POST /v1/notifications</code>.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Queued / retrying</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{loading ? "—" : metrics.queued}</p>
        </div>
        <div className="card">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Delivered</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-emerald-700">{loading ? "—" : metrics.sent}</p>
        </div>
        <div className="card">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Failed (DLQ)</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-red-700">{loading ? "—" : metrics.dlq}</p>
        </div>
      </div>

      <div className="card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-ink-muted" />
            <h2 className="text-lg font-semibold">Recent notifications</h2>
          </div>
          <Link to="/notifications" className="btn btn-secondary gap-1 text-sm">
            Send email <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>To</th>
                <th>Status</th>
                <th>Attempts</th>
              </tr>
            </thead>
            <tbody>
              {items.slice(0, 8).map((n) => (
                <tr key={n.id}>
                  <td className="font-mono text-xs">{n.id}</td>
                  <td className="max-w-[200px] truncate">{n.recipient_email}</td>
                  <td>
                    <Badge
                      variant={
                        n.status === "sent"
                          ? "success"
                          : n.status === "failed"
                            ? "danger"
                            : n.status === "retrying"
                              ? "warning"
                              : "default"
                      }
                    >
                      {n.status}
                    </Badge>
                  </td>
                  <td className="tabular-nums">{n.attempts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && !items.length && (
          <p className="py-8 text-center text-sm text-ink-muted">No notifications yet. Send your first from the Send page.</p>
        )}
      </div>
    </div>
  );
}
