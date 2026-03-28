import { useState, useEffect } from "react";
import { useProject } from "../contexts/ProjectContext";
import api from "../lib/api";
import { Card } from "../components/ui/Card";
import Badge from "../components/Badge";
import { PageLoader } from "../components/LoadingSpinner";

export default function Webhooks() {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState("");
  const { current } = useProject();

  const fetchWebhooks = async () => {
    if (!current) return;
    try {
      setLoading(true);
      const res = await api.get(`/v1/projects/${current.id}/webhooks`);
      setWebhooks(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, [current?.id]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newUrl || !current) return;
    try {
      await api.post(`/v1/projects/${current.id}/webhooks`, { 
        url: newUrl, 
        events: ["*"] 
      });
      setNewUrl("");
      fetchWebhooks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this webhook?") || !current) return;
    try {
      await api.delete(`/v1/projects/${current.id}/webhooks/${id}`);
      fetchWebhooks();
    } catch (err) {
      console.error(err);
    }
  };

  if (!current) return <div className="p-8 text-center text-ink-muted">Please select a project first.</div>;
  if (loading && !webhooks.length) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Webhooks</h1>
          <p className="mt-1 text-sm text-gray-500">Receive real-time updates when notifications are sent or fail.</p>
        </div>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Webhook Endpoint</h3>
        <form onSubmit={handleCreate} className="flex gap-4">
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://your-domain.com/webhook"
            required
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
          />
          <button type="submit" className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800">
            Create Webhook
          </button>
        </form>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div>Loading webhooks...</div>
        ) : webhooks.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
            No webhooks configured. Add one above.
          </div>
        ) : (
          webhooks.map((hook) => (
            <Card key={hook.id} className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{hook.url}</h3>
                  <div className="mt-2 text-sm text-gray-500 space-y-1">
                    <p>Status: <Badge variant={hook.active ? "success" : "default"}>{hook.active ? "Active" : "Disabled"}</Badge></p>
                    <p>Subscribed Events: {hook.events.join(", ")}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(hook.id)}
                  className="text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
