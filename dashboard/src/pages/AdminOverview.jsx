import { useEffect, useState } from "react";
import api from "../lib/api";
import { PageLoader } from "../components/LoadingSpinner";
import Badge from "../components/Badge";
import {
  Users, FolderOpen, Key, Bell, AlertTriangle, BarChart3,
  TrendingUp, Activity, Database
} from "lucide-react";

function MiniBarChart({ data, maxHeight = 80 }) {
  if (!data.length) return <p className="text-xs text-ink-muted py-4 text-center">No data yet</p>;
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-[3px] h-20" style={{ height: maxHeight }}>
      {data.map((d, i) => {
        const total = d.count;
        const sentH = Math.max(2, (d.sent / max) * maxHeight);
        const failedH = Math.max(0, (d.failed / max) * maxHeight);
        return (
          <div key={i} className="flex-1 flex flex-col items-stretch justify-end gap-[1px] group relative">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
              <div className="rounded-lg bg-ink text-white text-[10px] px-2 py-1 whitespace-nowrap shadow-lg">
                {new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}: {total} total
              </div>
            </div>
            {failedH > 0 && (
              <div className="rounded-t-sm bg-red-400 transition-all duration-300" style={{ height: failedH }} />
            )}
            <div
              className="rounded-t-sm bg-neutral-800 group-hover:bg-neutral-700 transition-all duration-300"
              style={{ height: sentH }}
            />
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ data }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
  const colors = {
    sent: "#059669",
    queued: "#0a0a0a",
    failed: "#dc2626",
    retrying: "#d97706"
  };
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  let cumulative = 0;

  if (!entries.length) return <p className="text-xs text-ink-muted text-center py-8">No data</p>;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-32 h-32 shrink-0">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          {entries.map(([status, count]) => {
            const pct = (count / total) * 100;
            const offset = cumulative;
            cumulative += pct;
            return (
              <circle
                key={status}
                cx="18" cy="18" r="14"
                fill="none"
                stroke={colors[status] || "#d4d4d4"}
                strokeWidth="4"
                strokeDasharray={`${pct} ${100 - pct}`}
                strokeDashoffset={-offset}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-bold tabular-nums">{total}</p>
            <p className="text-[9px] text-ink-muted uppercase">Total</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {entries.map(([status, count]) => (
          <div key={status} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[status] || "#d4d4d4" }} />
            <span className="text-xs text-ink-muted capitalize">{status}</span>
            <span className="text-xs font-semibold tabular-nums ml-auto">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [errors, setErrors] = useState([]);
  const [dlqSummary, setDlqSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/v1/admin/stats"),
      api.get("/v1/admin/errors?limit=10"),
      api.get("/v1/admin/dlq-summary")
    ])
      .then(([statsRes, errRes, dlqRes]) => {
        setStats(statsRes.data.data);
        setErrors(errRes.data.data || []);
        setDlqSummary(dlqRes.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (!stats) return <p className="text-ink-muted py-8 text-center">Failed to load admin stats.</p>;

  const statCards = [
    { label: "Total Users", value: stats.users, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Projects", value: stats.projects, icon: FolderOpen, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Active API Keys", value: stats.activeKeys, icon: Key, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Notifications", value: stats.totalNotifications, icon: Bell, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "DLQ (Failed)", value: stats.statusBreakdown.failed || 0, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
    { label: "Log Entries", value: stats.totalLogs, icon: Database, color: "text-neutral-600", bg: "bg-neutral-100" }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">System Overview</h1>
        <p className="mt-1 text-sm text-ink-muted">Platform-wide metrics and analytics.</p>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.label} className="card group hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{card.label}</p>
              <div className={`rounded-lg ${card.bg} p-2 group-hover:scale-110 transition-transform`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold tabular-nums">{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily volume */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-ink-muted" />
            <h2 className="text-base font-semibold">Daily Volume (14 days)</h2>
          </div>
          <MiniBarChart data={stats.dailyVolume} maxHeight={100} />
          <div className="flex items-center gap-4 mt-3 text-xs text-ink-muted">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-neutral-800" />
              Sent
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-red-400" />
              Failed
            </div>
          </div>
        </div>

        {/* Status donut */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-ink-muted" />
            <h2 className="text-base font-semibold">Notification Status</h2>
          </div>
          <DonutChart data={stats.statusBreakdown} />
        </div>
      </div>

      {/* Top projects */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-ink-muted" />
          <h2 className="text-base font-semibold">Top Projects by Volume</h2>
        </div>
        {stats.topProjects.length ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Owner</th>
                  <th>Total</th>
                  <th>Sent</th>
                  <th>Failed</th>
                  <th>Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProjects.map((p) => {
                  const rate = p.total > 0 ? ((p.sent / p.total) * 100).toFixed(1) : "—";
                  return (
                    <tr key={p.id}>
                      <td className="font-medium">{p.name}</td>
                      <td className="text-sm text-ink-muted">{p.ownerEmail}</td>
                      <td className="tabular-nums font-medium">{p.total.toLocaleString()}</td>
                      <td className="tabular-nums text-emerald-700">{p.sent.toLocaleString()}</td>
                      <td className="tabular-nums text-red-600">{p.failed.toLocaleString()}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden max-w-[80px]">
                            <div
                              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                              style={{ width: `${rate === "—" ? 0 : rate}%` }}
                            />
                          </div>
                          <span className="text-xs tabular-nums text-ink-muted">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : <p className="text-sm text-ink-muted py-4 text-center">No projects yet.</p>}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* DLQ Summary */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h2 className="text-base font-semibold">DLQ per Project</h2>
          </div>
          {dlqSummary.length ? (
            <div className="space-y-3">
              {dlqSummary.map((d) => (
                <div key={d.project_id} className="flex items-center justify-between rounded-lg border border-surface-border p-3">
                  <div>
                    <p className="text-sm font-medium">{d.project_name}</p>
                    <p className="text-xs text-ink-muted">Last failure: {d.last_failure ? new Date(d.last_failure).toLocaleString() : "—"}</p>
                  </div>
                  <Badge variant="danger">{d.count} failed</Badge>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-ink-muted py-4 text-center">🎉 No DLQ items across platform.</p>}
        </div>

        {/* Recent errors */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h2 className="text-base font-semibold">Recent Errors</h2>
          </div>
          {errors.length ? (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {errors.map((e) => {
                const meta = typeof e.metadata === "string" ? JSON.parse(e.metadata) : e.metadata;
                return (
                  <div key={e.id} className="rounded-lg border border-red-100 bg-red-50/50 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-medium text-red-700">{e.event}</span>
                      <span className="text-[10px] text-ink-muted">{new Date(e.created_at).toLocaleString()}</span>
                    </div>
                    {meta?.error && <p className="text-xs text-red-600 line-clamp-2">{meta.error}</p>}
                    {meta?.message && <p className="text-xs text-red-600 line-clamp-2">{meta.message}</p>}
                    {e.project_name && <p className="text-[10px] text-ink-muted mt-1">Project: {e.project_name}</p>}
                  </div>
                );
              })}
            </div>
          ) : <p className="text-sm text-ink-muted py-4 text-center">No errors recorded.</p>}
        </div>
      </div>
    </div>
  );
}
