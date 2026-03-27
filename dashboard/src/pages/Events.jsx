import { useEffect, useState } from "react";
import { useProject } from "../contexts/ProjectContext";
import { useToast } from "../components/Toast";
import api from "../lib/api";
import Modal from "../components/Modal";
import { PageLoader } from "../components/LoadingSpinner";
import { Zap, Plus, Edit3, Trash2, Eye } from "lucide-react";

export default function Events() {
  const { current } = useProject();
  const { addToast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null);
  const [previewModal, setPreviewModal] = useState(null);
  const [form, setForm] = useState({ eventName: "", subjectTemplate: "", bodyTemplate: "" });
  const [previewData, setPreviewData] = useState("{}");
  const [previewResult, setPreviewResult] = useState(null);
  const [previewTab, setPreviewTab] = useState("html");
  const [saving, setSaving] = useState(false);

  async function load() {
    if (!current) return;
    setLoading(true);
    try {
      const res = await api.get(`/v1/projects/${current.id}/events`);
      setTemplates(res.data.data || []);
    } catch {
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [current?.id]);

  function openCreate() {
    setForm({ eventName: "", subjectTemplate: "", bodyTemplate: "" });
    setEditModal("create");
  }

  function openEdit(t) {
    setForm({ eventName: t.event_name, subjectTemplate: t.subject_template, bodyTemplate: t.body_template });
    setEditModal(t.id);
  }

  async function saveTemplate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editModal === "create") {
        await api.post(`/v1/projects/${current.id}/events`, form);
        addToast("Template created", "success");
      } else {
        await api.put(`/v1/projects/${current.id}/events/${editModal}`, form);
        addToast("Template updated", "success");
      }
      setEditModal(null);
      await load();
    } catch (err) {
      addToast(err.response?.data?.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  async function deleteTemplate(id) {
    if (!confirm("Delete this event template?")) return;
    try {
      await api.delete(`/v1/projects/${current.id}/events/${id}`);
      addToast("Template deleted", "success");
      await load();
    } catch (err) {
      addToast(err.response?.data?.message || "Delete failed", "error");
    }
  }

  async function preview(t) {
    setPreviewModal(t);
    setPreviewData(JSON.stringify({
      email: "user@example.com",
      name: "Ayush",
      time: new Date().toISOString(),
      orderId: "ORD-12345",
      total: "$99.00",
      resetLink: "https://example.com/reset/abc123"
    }, null, 2));
    setPreviewResult(null);
  }

  async function runPreview() {
    try {
      const data = JSON.parse(previewData);
      const res = await api.post(`/v1/projects/${current.id}/events/preview-html`, {
        eventName: previewModal.event_name,
        data
      });
      setPreviewResult(res.data.data);
    } catch (err) {
      addToast("Preview failed — check JSON", "error");
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Event Templates</h1>
          <p className="mt-1 text-sm text-ink-muted">Configure notification templates with <code className="rounded bg-surface-muted px-1 py-0.5 text-xs">{"{{variables}}"}</code></p>
        </div>
        <button onClick={openCreate} className="btn btn-primary gap-1">
          <Plus className="h-4 w-4" />
          New Template
        </button>
      </div>

      {loading ? <PageLoader /> : (
        <div className="grid gap-4 sm:grid-cols-2">
          {templates.map((t) => (
            <div key={t.id} className="card group hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span className="font-mono text-sm font-semibold">{t.event_name}</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => preview(t)} className="btn btn-secondary !p-1.5" title="Preview">
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => openEdit(t)} className="btn btn-secondary !p-1.5" title="Edit">
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  {!t.is_predefined && (
                    <button onClick={() => deleteTemplate(t.id)} className="btn btn-danger !p-1.5" title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-ink-muted">Subject: </span>
                  <span className="text-ink">{t.subject_template}</span>
                </div>
                <div>
                  <span className="text-ink-muted">Body: </span>
                  <span className="text-ink line-clamp-2">{t.body_template}</span>
                </div>
              </div>
              {t.is_predefined && (
                <span className="mt-3 inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                  Predefined
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      {!loading && !templates.length && (
        <div className="card text-center py-12">
          <Zap className="mx-auto h-10 w-10 text-ink-subtle mb-3" />
          <p className="text-sm text-ink-muted">No event templates yet.</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title={editModal === "create" ? "New Event Template" : "Edit Template"}>
        <form onSubmit={saveTemplate} className="space-y-4">
          <div>
            <label className="label">Event Name</label>
            <input
              className="input font-mono"
              placeholder="e.g. SUBSCRIPTION_RENEWED"
              value={form.eventName}
              onChange={(e) => setForm({ ...form, eventName: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Subject Template</label>
            <input
              className="input"
              placeholder="Order #{{orderId}} confirmed"
              value={form.subjectTemplate}
              onChange={(e) => setForm({ ...form, subjectTemplate: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Body Template</label>
            <textarea
              className="input min-h-[120px] resize-y"
              placeholder="Hello {{name}},\n\nYour order..."
              value={form.bodyTemplate}
              onChange={(e) => setForm({ ...form, bodyTemplate: e.target.value })}
              required
            />
          </div>
          <button type="submit" disabled={saving} className="btn btn-primary w-full">
            {saving ? "Saving…" : editModal === "create" ? "Create Template" : "Save Changes"}
          </button>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal open={!!previewModal} onClose={() => { setPreviewModal(null); setPreviewResult(null); setPreviewTab("html"); }} title="Preview Template" maxWidth="max-w-3xl">
        <div className="space-y-4">
          <div>
            <label className="label">Template Variables (JSON)</label>
            <textarea
              className="input min-h-[100px] font-mono text-xs resize-y"
              value={previewData}
              onChange={(e) => setPreviewData(e.target.value)}
            />
          </div>
          <button onClick={runPreview} className="btn btn-primary">Render Preview</button>
          {previewResult && (
            <div className="space-y-3">
              {/* Tabs */}
              <div className="flex gap-1 rounded-lg border border-surface-border bg-surface-muted p-1">
                {["html", "text"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setPreviewTab(tab)}
                    className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                      previewTab === tab ? "bg-white text-ink shadow-sm" : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    {tab === "html" ? "📧 Email Preview" : "📄 Plain Text"}
                  </button>
                ))}
              </div>

              {previewTab === "html" && previewResult.html ? (
                <div className="rounded-lg border border-surface-border overflow-hidden bg-neutral-100">
                  <div className="bg-neutral-200 px-3 py-2 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-[10px] text-ink-muted ml-2">Email Preview — {previewResult.subject}</span>
                  </div>
                  <iframe
                    srcDoc={previewResult.html}
                    title="Email preview"
                    className="w-full border-0"
                    style={{ height: "520px" }}
                    sandbox=""
                  />
                </div>
              ) : (
                <div className="rounded-lg border border-surface-border bg-surface-muted p-4 space-y-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Subject</p>
                    <p className="text-sm font-medium text-ink mt-1">{previewResult.subject}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Body</p>
                    <pre className="mt-1 text-sm text-ink whitespace-pre-wrap">{previewResult.body}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
