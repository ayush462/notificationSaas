import { useEffect, useState } from "react";
import { useProject } from "../contexts/ProjectContext";
import api from "../lib/api";
import Badge from "../components/Badge";
import Pagination from "../components/Pagination";
import { PageLoader } from "../components/LoadingSpinner";
import CustomSelect from "../components/CustomSelect";

export default function Notifications() {
  const { current } = useProject();
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 20;

  async function load() {
    if (!current) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ projectId: current.id, limit: String(limit), offset: String(offset) });
      if (status) params.set("status", status);
      const res = await api.get(`/v1/dashboard/notifications?${params}`);
      setData(res.data.data || { items: [], total: 0 });
    } catch {
      setData({ items: [], total: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [current?.id, offset, status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Notifications</h1>
        <p className="mt-1 text-sm text-ink-muted">All notifications for this project.</p>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-end gap-4 mb-4">
          <div>
            <label className="label">Status</label>
            <CustomSelect
              className="w-40"
              value={status}
              onChange={(val) => { setStatus(val); setOffset(0); }}
              options={[
                { label: "All statuses", value: "" },
                { label: "Scheduled", value: "scheduled" },
                { label: "Queued", value: "queued" },
                { label: "Sent", value: "sent" },
                { label: "Failed", value: "failed" },
                { label: "Retrying", value: "retrying" }
              ]}
            />
          </div>
          <button className="btn btn-primary" onClick={load}>Refresh</button>
        </div>

        {loading ? <PageLoader /> : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Recipient</th>
                    <th>Event</th>
                    <th>Status</th>
                    <th>{status === "scheduled" ? "Scheduled For" : "Attempts"}</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((n) => (
                    <tr key={n.id}>
                      <td className="font-mono text-xs">{n.id?.slice(0, 16)}…</td>
                      <td className="max-w-[180px] truncate">{n.recipient_email}</td>
                      <td className="text-xs text-ink-muted">{n.event_name || "—"}</td>
                      <td>
                        <Badge variant={
                          n.status === "sent" ? "success" : 
                          n.status === "failed" ? "danger" : 
                          n.status === "retrying" ? "warning" : 
                          (n.scheduled_at && new Date(n.scheduled_at) > new Date()) ? "default" : "default"
                        }>
                          {n.status === "queued" && n.scheduled_at && new Date(n.scheduled_at) > new Date() ? "scheduled" : n.status}
                        </Badge>
                      </td>
                      <td className="tabular-nums text-xs">
                        {status === "scheduled" || (n.scheduled_at && new Date(n.scheduled_at) > new Date()) 
                          ? new Date(n.scheduled_at).toLocaleString() 
                          : n.attempts}
                      </td>
                      <td className="whitespace-nowrap text-xs text-ink-muted">{new Date(n.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!data.items.length && <p className="py-8 text-center text-sm text-ink-muted">No notifications found.</p>}
            <Pagination total={data.total} limit={limit} offset={offset} onChange={setOffset} />
          </>
        )}
      </div>
    </div>
  );
}
