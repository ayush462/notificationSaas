import { useEffect, useState } from "react";
import { useProject } from "../contexts/ProjectContext";
import api from "../lib/api";
import { PageLoader } from "../components/LoadingSpinner";
import { BarChart3, TrendingUp, Activity, Zap, Clock, Mail, MessageSquare, Smartphone, AlertTriangle, CheckCircle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const CHART_COLORS = ["#0a0a0a", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

function StatCard({ icon: Icon, label, value, sub, color = "bg-neutral-100" }) {
  return (
    <div className="card group hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</p>
        <div className={`rounded-lg ${color} p-2 group-hover:scale-110 transition-transform`}>
          <Icon className="h-4 w-4 text-ink" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold tabular-nums">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-muted">{sub}</p>}
    </div>
  );
}

export default function Analytics() {
  const { current } = useProject();
  const [overview, setOverview] = useState(null);
  const [timeseries, setTimeseries] = useState([]);
  const [providers, setProviders] = useState([]);
  const [channels, setChannels] = useState([]);
  const [topEvents, setTopEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30");

  async function load() {
    if (!current) return;
    setLoading(true);
    const from = new Date(Date.now() - Number(range) * 86400000).toISOString();
    const pid = current.id;
    try {
      const [ovRes, tsRes, provRes, chRes, evRes] = await Promise.all([
        api.get(`/v1/analytics/overview?projectId=${pid}&from=${from}`),
        api.get(`/v1/analytics/timeseries?projectId=${pid}&from=${from}&granularity=day`),
        api.get(`/v1/analytics/providers?projectId=${pid}&from=${from}`),
        api.get(`/v1/analytics/channels?projectId=${pid}&from=${from}`),
        api.get(`/v1/analytics/events?projectId=${pid}&from=${from}&limit=8`)
      ]);
      setOverview(ovRes.data.data);
      setTimeseries(tsRes.data.data.map(d => ({ ...d, date: new Date(d.date).toLocaleDateString("en", { month: "short", day: "numeric" }) })));
      setProviders(provRes.data.data);
      setChannels(chRes.data.data);
      setTopEvents(evRes.data.data);
    } catch { }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [current?.id, range]);

  if (loading) return <PageLoader />;

  const channelIcons = { email: Mail, sms: MessageSquare, push: Smartphone };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Analytics</h1>
          <p className="mt-1 text-sm text-ink-muted">Notification delivery performance and insights.</p>
        </div>
        <select className="input w-40" value={range} onChange={e => setRange(e.target.value)}>
          <option value="7">Last 7 days</option>
          <option value="14">Last 14 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Stat cards */}
      {overview && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={BarChart3} label="Total Sent" value={overview.total.toLocaleString()} sub={`${overview.channelsUsed} channel(s) used`} color="bg-blue-50" />
          <StatCard icon={CheckCircle} label="Success Rate" value={`${overview.successRate}%`} sub={`${overview.sent.toLocaleString()} delivered`} color="bg-emerald-50" />
          <StatCard icon={AlertTriangle} label="Failure Rate" value={`${overview.failureRate}%`} sub={`${overview.failed.toLocaleString()} failed`} color="bg-red-50" />
          <StatCard icon={Clock} label="Avg Latency" value={`${overview.avgSuccessLatencyMs}ms`} sub={`${overview.providersUsed} provider(s)`} color="bg-amber-50" />
        </div>
      )}

      {/* Timeseries chart */}
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-ink-muted" />
          <h2 className="text-base font-semibold">Notification Volume</h2>
        </div>
        {timeseries.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={timeseries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#737373" }} />
              <YAxis tick={{ fontSize: 11, fill: "#737373" }} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "12px" }}
              />
              <Line type="monotone" dataKey="sent" stroke="#0a0a0a" strokeWidth={2} dot={{ r: 3 }} name="Sent" />
              <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Failed" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="py-12 text-center text-sm text-ink-muted">No data for this period.</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Provider performance */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-ink-muted" />
            <h2 className="text-base font-semibold">Provider Performance</h2>
          </div>
          {providers.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={providers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#737373" }} />
                <YAxis type="category" dataKey="provider" tick={{ fontSize: 11, fill: "#737373" }} width={80} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "12px" }} />
                <Bar dataKey="sent" fill="#0a0a0a" radius={[0, 4, 4, 0]} name="Sent" />
                <Bar dataKey="failed" fill="#ef4444" radius={[0, 4, 4, 0]} name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-12 text-center text-sm text-ink-muted">No provider data yet.</p>
          )}
        </div>

        {/* Channel breakdown */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-ink-muted" />
            <h2 className="text-base font-semibold">Channel Breakdown</h2>
          </div>
          {channels.length > 0 ? (
            <div className="flex items-center gap-8">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={channels} dataKey="total" nameKey="channel" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                    {channels.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 flex-1">
                {channels.map((ch, i) => {
                  const ChIcon = channelIcons[ch.channel] || Mail;
                  return (
                    <div key={ch.channel} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                      <ChIcon className="h-4 w-4 text-ink-muted" />
                      <span className="text-sm font-medium capitalize flex-1">{ch.channel}</span>
                      <span className="text-sm tabular-nums font-semibold">{ch.total.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-ink-muted">No channel data yet.</p>
          )}
        </div>
      </div>

      {/* Top events */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-amber-500" />
          <h2 className="text-base font-semibold">Top Events</h2>
        </div>
        {topEvents.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Total</th>
                  <th>Sent</th>
                  <th>Failed</th>
                  <th>Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {topEvents.map(e => {
                  const rate = e.total > 0 ? ((e.sent / e.total) * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={e.eventName}>
                      <td className="font-mono text-xs font-semibold">{e.eventName}</td>
                      <td className="tabular-nums">{e.total.toLocaleString()}</td>
                      <td className="tabular-nums text-emerald-700">{e.sent.toLocaleString()}</td>
                      <td className="tabular-nums text-red-600">{e.failed.toLocaleString()}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden max-w-[80px]">
                            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${rate}%` }} />
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
        ) : (
          <p className="py-8 text-center text-sm text-ink-muted">No events tracked yet.</p>
        )}
      </div>
    </div>
  );
}
