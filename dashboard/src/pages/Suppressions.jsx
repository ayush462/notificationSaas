import { useState, useEffect } from "react";
import { useProject } from "../contexts/ProjectContext";
import api from "../lib/api";
import { Card } from "../components/ui/Card";
import Badge from "../components/Badge";
import { PageLoader } from "../components/LoadingSpinner";

export default function Suppressions() {
  const [suppressions, setSuppressions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const { current } = useProject();

  const fetchSuppressions = async () => {
    if (!current) return;
    try {
      setLoading(true);
      const res = await api.get(`/v1/projects/${current.id}/suppressions`);
      setSuppressions(res.data.data?.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppressions();
  }, [current?.id]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newEmail || !current) return;
    try {
      await api.post(`/v1/projects/${current.id}/suppressions`, { 
        email: newEmail, 
        reason: "manual" 
      });
      setNewEmail("");
      fetchSuppressions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (email) => {
    if (!confirm(`Remove ${email} from suppression list?`) || !current) return;
    try {
      await api.delete(`/v1/projects/${current.id}/suppressions`, {
        data: { email }
      });
      fetchSuppressions();
    } catch (err) {
      console.error(err);
    }
  };

  if (!current) return <div className="p-8 text-center text-ink-muted">Please select a project first.</div>;
  if (loading && !suppressions.length) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Suppressions</h1>
          <p className="mt-1 text-sm text-gray-500">Manage bounced and unsubscribed email addresses.</p>
        </div>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add to Suppression List</h3>
        <form onSubmit={handleAdd} className="flex gap-4">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="user@example.com"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
          />
          <button type="submit" className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800">
            Add Block
          </button>
        </form>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added At</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-4 text-center">Loading...</td></tr>
              ) : suppressions.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">No suppressions found.</td></tr>
              ) : (
                suppressions.map((s) => (
                  <tr key={s.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Badge variant={s.reason === 'bounced' ? 'error' : s.reason === 'unsubscribed' ? 'warning' : 'default'}>
                        {s.reason}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(s.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button onClick={() => handleRemove(s.email)} className="text-red-600 hover:text-red-900 font-medium">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
