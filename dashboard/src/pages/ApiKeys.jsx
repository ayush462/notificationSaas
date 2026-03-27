import { useEffect, useState } from "react";
import api from "../lib/api";
import Badge from "../components/Badge";
import { Trash2, Copy, CheckCircle2 } from "lucide-react";

export default function ApiKeys() {
  const [keys, setKeys] = useState([]);
  const [appName, setAppName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [newKey, setNewKey] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  async function load() {
    try {
      const res = await api.get("/v1/apikeys?limit=100");
      setKeys(res.data.data || []);
      setMessage("");
    } catch (e) {
      setMessage(e.response?.data?.message || "Unable to load API keys (check admin secret if API uses ADMIN_SECRET)");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createKey(e) {
    e.preventDefault();
    setMessage("");
    try {
      const res = await api.post("/v1/apikeys", { appName, ownerEmail });
      const apiKey = res.data.data?.apiKey || "";
      const id = res.data.data?.id;
      setNewKey(apiKey);
      localStorage.setItem("notification_api_key", apiKey);
      setAppName("");
      setOwnerEmail("");
      await load();
      setMessage(id ? `Key #${id} created. Store it securely — it is not shown again.` : "Key created.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to create API key");
    }
  }

  async function removeKey(id) {
    if (!window.confirm("Revoke this API key? Integrations using it will stop immediately.")) return;
    try {
      await api.delete(`/v1/apikeys/${id}`);
      await load();
      setMessage("Key revoked.");
    } catch (e) {
      setMessage(e.response?.data?.message || "Delete failed");
    }
  }

  function copyNew() {
    if (!newKey) return;
    navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">API keys</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Issue keys for each app or environment. Keys are hashed at rest; only the prefix is shown after creation in this console.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <form onSubmit={createKey} className="card space-y-4">
          <h2 className="text-sm font-semibold text-ink">Create key</h2>
          <div>
            <label className="label">Application name</label>
            <input className="input" required placeholder="Production website" value={appName} onChange={(e) => setAppName(e.target.value)} />
          </div>
          <div>
            <label className="label">Owner email (optional)</label>
            <input
              className="input"
              type="email"
              placeholder="ops@company.com"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Generate key
          </button>
          {newKey && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-medium text-emerald-900">Copy now — shown once</p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 break-all font-mono text-sm text-emerald-950">{newKey}</code>
                <button type="button" className="btn btn-secondary p-2" onClick={copyNew} title="Copy">
                  {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}
          {message && <p className="text-sm text-ink-muted">{message}</p>}
        </form>

        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Active keys</h2>
            <button type="button" className="btn btn-secondary text-xs" onClick={load}>
              Refresh
            </button>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>App</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th className="w-24" />
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id}>
                    <td className="font-medium">{k.app_name}</td>
                    <td className="text-xs text-ink-muted">{k.owner_email || "—"}</td>
                    <td>
                      <Badge variant={k.active ? "success" : "danger"}>{k.active ? "active" : "revoked"}</Badge>
                    </td>
                    <td>
                      {k.active && (
                        <button
                          type="button"
                          className="btn btn-danger p-2"
                          title="Revoke"
                          onClick={() => removeKey(k.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!keys.length && <p className="py-6 text-center text-sm text-ink-muted">No keys yet.</p>}
        </div>
      </div>
    </div>
  );
}
