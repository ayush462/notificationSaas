import { useEffect, useState, Fragment } from "react";
import { useProject } from "../contexts/ProjectContext";
import api from "../lib/api";
import Badge from "../components/Badge";
import Pagination from "../components/Pagination";
import { PageLoader } from "../components/LoadingSpinner";
import { ChevronDown, ChevronRight, Download, Search, Filter, RefreshCw, AlertCircle, AlertTriangle, Info, XCircle } from "lucide-react";

export default function Logs() {
  const { current } = useProject();
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState("");
  const [service, setService] = useState("");
  const [q, setQ] = useState("");
  const [offset, setOffset] = useState(0);
  const [expanded, setExpanded] = useState(() => new Set());
  const [autoRefresh, setAutoRefresh] = useState(false);
  const limit = 30;

  async function load(overrideOffset, overrideLevel, overrideService, overrideQ) {
    if (!current) return;
    setLoading(true);
    try {
      const o = overrideOffset !== undefined ? overrideOffset : offset;
      const lv = overrideLevel !== undefined ? overrideLevel : level;
      const sv = overrideService !== undefined ? overrideService : service;
      const sq = overrideQ !== undefined ? overrideQ : q;
      const params = new URLSearchParams({
        projectId: current.id,
        limit: String(limit),
        offset: String(o)
      });
      if (lv) params.set("level", lv);
      if (sv) params.set("service", sv);
      if (sq.trim()) params.set("q", sq.trim());
      const res = await api.get(`/v1/dashboard/logs?${params}`);
      setData(res.data.data || { items: [], total: 0 });
    } catch {
      setData({ items: [], total: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [current?.id, offset]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => load(), 5000);
    return () => clearInterval(id);
  }, [autoRefresh, current?.id, level, service, q, offset]);

  function applyFilters() {
    setOffset(0);
    load(0, level, service, q);
  }

  function handleQuickFilter(newLevel, newService, newQ) {
    setLevel(newLevel || "");
    setService(newService || "");
    setQ(newQ || "");
    setOffset(0);
    load(0, newLevel || "", newService || "", newQ || "");
  }

  function clearAll() {
    setLevel(""); setService(""); setQ(""); setOffset(0);
    load(0, "", "", "");
  }

  async function exportLogs(format) {
    const base = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const token = localStorage.getItem("ntf_token");
    const params = new URLSearchParams({ format, limit: "2000", projectId: current.id });
    if (level) params.set("level", level);
    if (q.trim()) params.set("q", q.trim());
    const res = await fetch(`${base}/v1/dashboard/logs/export?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-${current.name}-${new Date().toISOString().slice(0, 10)}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function toggleRow(id) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function parseMetadata(raw) {
    if (raw == null) return null;
    if (typeof raw === "object") return raw;
    try { return JSON.parse(raw); } catch { return { _raw: String(raw) }; }
  }

  const levelColors = { info: "default", warn: "warning", error: "danger" };
  const LevelIcon = ({ level: lv }) => {
    if (lv === "error") return <XCircle className="h-3.5 w-3.5 text-red-500" />;
    if (lv === "warn") return <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />;
    return <Info className="h-3.5 w-3.5 text-neutral-400" />;
  };

  const serviceColors = {
    api: "bg-blue-50 text-blue-700 border-blue-200",
    worker: "bg-purple-50 text-purple-700 border-purple-200"
  };

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil((data.total || 0) / limit);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Activity Logs</h1>
          <p className="mt-1 text-sm text-ink-muted">Notification events, errors, and DLQ activity.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`btn text-xs gap-1.5 ${autoRefresh ? "btn-primary" : "btn-secondary"}`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${autoRefresh ? "animate-spin" : ""}`} />
            {autoRefresh ? "Live" : "Auto-refresh"}
          </button>
        </div>
      </div>

      <div className="card">
        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3 mb-5 pb-5 border-b border-surface-border">
          <div>
            <label className="label">Level</label>
            <select className="input w-32" value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="">All levels</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div>
            <label className="label">Service</label>
            <select className="input w-32" value={service} onChange={(e) => setService(e.target.value)}>
              <option value="">All</option>
              <option value="api">API</option>
              <option value="worker">Worker</option>
            </select>
          </div>
          <div className="min-w-[200px] flex-1">
            <label className="label">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-subtle" />
              <input
                className="input pl-10"
                placeholder="Search events, errors, notification IDs..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              />
            </div>
          </div>
          <button className="btn btn-primary gap-1" onClick={applyFilters}>
            <Filter className="h-4 w-4" />
            Apply
          </button>
          {(level || service || q) && (
            <button className="btn btn-secondary text-xs" onClick={clearAll}>
              Clear filters
            </button>
          )}
          <div className="ml-auto flex gap-2">
            <button className="btn btn-secondary text-xs gap-1" onClick={() => exportLogs("json")}>
              <Download className="h-3.5 w-3.5" /> JSON
            </button>
            <button className="btn btn-secondary text-xs gap-1" onClick={() => exportLogs("csv")}>
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
          </div>
        </div>

        {/* Quick filter pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { label: "Errors only", fn: () => handleQuickFilter("error", "", "") },
            { label: "DLQ events", fn: () => handleQuickFilter("", "", "dlq") },
            { label: "Failed notifications", fn: () => handleQuickFilter("", "", "failed") },
            { label: "Retries", fn: () => handleQuickFilter("", "", "retry") },
            { label: "Worker events", fn: () => handleQuickFilter("", "worker", "") }
          ].map((pill) => (
            <button
              key={pill.label}
              className="rounded-full border border-surface-border bg-white px-3 py-1 text-xs font-medium text-ink-muted hover:border-neutral-400 hover:text-ink transition-colors"
              onClick={pill.fn}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {loading ? <PageLoader /> : (
          <>
            {/* Stats bar */}
            {data.total > 0 && (
              <div className="flex items-center gap-4 mb-4 text-xs">
                <span className="text-ink-muted">
                  <strong className="text-ink">{data.total}</strong> entries
                </span>
                {level && <Badge variant={levelColors[level]}>{level}</Badge>}
                {service && <span className="text-ink-muted">service: <strong>{service}</strong></span>}
                <span className="text-ink-muted ml-auto">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
            )}

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="w-8" />
                    <th>Timestamp</th>
                    <th>Level</th>
                    <th>Service</th>
                    <th>Event</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((l) => {
                    const meta = parseMetadata(l.metadata);
                    const open = expanded.has(l.id);
                    return (
                      <Fragment key={l.id}>
                        <tr className="cursor-pointer hover:bg-neutral-50/50" onClick={() => toggleRow(l.id)}>
                          <td>
                            <button type="button" className="p-0.5 text-ink-muted hover:text-ink">
                              {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                          </td>
                          <td className="whitespace-nowrap text-xs text-ink-muted tabular-nums">
                            {new Date(l.created_at).toLocaleString()}
                          </td>
                          <td>
                            <div className="flex items-center gap-1.5">
                              <LevelIcon level={l.level} />
                              <Badge variant={levelColors[l.level] || "default"}>
                                {l.level}
                              </Badge>
                            </div>
                          </td>
                          <td>
                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${serviceColors[l.service] || "bg-neutral-50 text-neutral-600 border-neutral-200"}`}>
                              {l.service}
                            </span>
                          </td>
                          <td className="font-mono text-xs max-w-[260px] truncate">{l.event}</td>
                          <td className="text-xs text-ink-muted max-w-[200px] truncate">
                            {meta?.error || meta?.notificationId || meta?.message || (l.request_id ? `req:${l.request_id.slice(0, 8)}` : "—")}
                          </td>
                        </tr>
                        {open && (
                          <tr className="bg-neutral-50/80">
                            <td colSpan={6} className="p-4">
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted mb-2">Log Details</p>
                                  <div className="space-y-1.5 text-xs">
                                    <p><span className="text-ink-muted w-24 inline-block">Log ID:</span> <span className="font-mono">{l.id}</span></p>
                                    <p><span className="text-ink-muted w-24 inline-block">Event:</span> <span className="font-mono font-semibold">{l.event}</span></p>
                                    <p><span className="text-ink-muted w-24 inline-block">Request ID:</span> <span className="font-mono">{l.request_id || "N/A"}</span></p>
                                    <p><span className="text-ink-muted w-24 inline-block">User ID:</span> <span className="font-mono">{l.user_id || "System"}</span></p>
                                    {l.api_key_hash && <p><span className="text-ink-muted w-24 inline-block">API Key:</span> <span className="font-mono">{l.api_key_hash.slice(0, 12)}...</span></p>}
                                    {meta?.error && (
                                      <div className="mt-2 rounded-lg bg-red-50 border border-red-200 p-3">
                                        <p className="text-[10px] font-semibold uppercase text-red-600 mb-1">Error</p>
                                        <p className="text-red-700 font-mono break-all">{meta.error}</p>
                                      </div>
                                    )}
                                    {meta?.providerErrors && (
                                      <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
                                        <p className="text-[10px] font-semibold uppercase text-amber-600 mb-1">Provider Errors</p>
                                        {meta.providerErrors.map((pe, i) => (
                                          <p key={i} className="text-amber-700 text-xs font-mono">{pe.provider}: {pe.error}</p>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted mb-2">Metadata</p>
                                  <pre className="max-h-48 overflow-auto rounded-lg border border-surface-border bg-white p-3 text-xs text-ink font-mono leading-relaxed">
                                    {JSON.stringify(meta, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {!data.items.length && (
              <div className="py-12 text-center">
                <AlertCircle className="mx-auto h-10 w-10 text-ink-subtle mb-3" />
                <p className="text-sm text-ink-muted">No log entries found.</p>
                {(level || service || q) && (
                  <button className="btn btn-secondary mt-3 text-sm" onClick={clearAll}>
                    Clear filters
                  </button>
                )}
              </div>
            )}
            <Pagination total={data.total} limit={limit} offset={offset} onChange={setOffset} />
          </>
        )}
      </div>
    </div>
  );
}
