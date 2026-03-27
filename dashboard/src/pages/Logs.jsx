import { useEffect, useState, Fragment } from "react";
import api from "../lib/api";
import Badge from "../components/Badge";
import { ChevronDown, ChevronRight, RotateCcw } from "lucide-react";

function parseContext(raw) {
  if (raw == null) return null;
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return { _raw: String(raw) };
  }
}

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState("");
  const [level, setLevel] = useState("");
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState(() => new Set());
  const [requeueBusy, setRequeueBusy] = useState(null);

  async function load() {
    try {
      const params = new URLSearchParams({ limit: "200" });
      if (level) params.set("level", level);
      if (q.trim()) params.set("q", q.trim());
      const res = await api.get(`/v1/logs?${params.toString()}`);
      setLogs(res.data.data || []);
    } catch (e) {
      setMessage(e.response?.data?.message || "Failed to load logs");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function exportLogs(format) {
    const base = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const apiKey = localStorage.getItem("notification_api_key") || "";
    const admin = localStorage.getItem("notification_admin_secret") || import.meta.env.VITE_ADMIN_SECRET || "";
    const params = new URLSearchParams({ format, limit: "2000" });
    if (level) params.set("level", level);
    if (q.trim()) params.set("q", q.trim());
    const res = await fetch(`${base}/v1/logs/export?${params}`, {
      headers: { "x-api-key": apiKey, ...(admin ? { "x-admin-secret": admin } : {}) }
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function requeueFromLog(notificationId) {
    if (!notificationId) return;
    setRequeueBusy(notificationId);
    try {
      await api.post(`/v1/notifications/dlq/${notificationId}/requeue`);
      setMessage(`Requeued ${notificationId}`);
      await load();
    } catch (e) {
      setMessage(e.response?.data?.message || "Requeue failed (may not be in DLQ for this tenant)");
    } finally {
      setRequeueBusy(null);
    }
  }

  function toggleRow(id) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Activity log</h1>
        <p className="mt-1 text-sm text-ink-muted">Structured audit trail: HTTP requests, queue events, and errors.</p>
      </div>

      <div className="card space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="label">Level</label>
            <select className="input w-40" value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="">All</option>
              <option value="info">info</option>
              <option value="warn">warn</option>
              <option value="error">error</option>
            </select>
          </div>
          <div className="min-w-[200px] flex-1">
            <label className="label">Search message</label>
            <input className="input" placeholder="e.g. notification" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <button type="button" className="btn btn-primary" onClick={load}>
            Apply
          </button>
          <div className="ml-auto flex gap-2">
            <button type="button" className="btn btn-secondary text-sm" onClick={() => exportLogs("json")}>
              Export JSON
            </button>
            <button type="button" className="btn btn-secondary text-sm" onClick={() => exportLogs("csv")}>
              Export CSV
            </button>
          </div>
        </div>
        {message && <p className="text-sm text-ink-muted">{message}</p>}
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-8" />
                <th>Time</th>
                <th>Level</th>
                <th>Message</th>
                <th className="w-28">Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => {
                const ctx = parseContext(l.context);
                const nid = ctx?.notificationId || ctx?.notification_id;
                const open = expanded.has(l.id);
                return (
                  <Fragment key={l.id}>
                    <tr>
                      <td>
                        <button type="button" className="p-1 text-ink-muted hover:text-ink" onClick={() => toggleRow(l.id)}>
                          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                      </td>
                      <td className="whitespace-nowrap text-xs text-ink-muted">
                        {new Date(l.created_at).toLocaleString()}
                      </td>
                      <td>
                        <Badge
                          variant={
                            l.level === "error" ? "danger" : l.level === "warn" ? "warning" : "default"
                          }
                        >
                          {l.level}
                        </Badge>
                      </td>
                      <td className="max-w-md truncate font-mono text-xs">{l.message}</td>
                      <td>
                        {nid ? (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-xs font-medium text-ink hover:underline"
                            disabled={requeueBusy === nid}
                            onClick={() => requeueFromLog(nid)}
                          >
                            <RotateCcw className="h-3 w-3" />
                            Resend
                          </button>
                        ) : (
                          <span className="text-xs text-ink-subtle">—</span>
                        )}
                      </td>
                    </tr>
                    {open && (
                      <tr className="bg-surface-muted/80">
                        <td colSpan={5} className="p-4">
                          <pre className="max-h-48 overflow-auto rounded border border-surface-border bg-white p-3 text-xs text-ink">
                            {JSON.stringify(ctx, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        {!logs.length && <p className="py-8 text-center text-sm text-ink-muted">No log entries.</p>}
      </div>
    </div>
  );
}
