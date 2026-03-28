import { useState, useEffect } from "react";
import api from "../lib/api";
import { Card } from "../components/ui/Card";
import Badge from "../components/Badge";
import { PageLoader } from "../components/LoadingSpinner";

export default function ProviderHealth() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      const res = await api.get("/v1/admin/health");
      if (res.data.success) setHealthData(res.data.data);
    } catch (err) {
      console.error("Failed to fetch provider health", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !healthData) return <PageLoader />;
  if (!healthData) return <div>Failed to load health data. Is the worker running?</div>;

  const { circuitState = {}, stats = {} } = healthData;

  // Gather all unique providers from state and stats
  const providers = Array.from(new Set([...Object.keys(circuitState), ...Object.keys(stats)]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Provider Health</h1>
          <p className="mt-1 text-sm text-gray-500">Real-time status of configured notification providers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((name) => {
          const cState = circuitState[name] || { failures: 0, open: false };
          const cStats = stats[name] || { sent: 0, failed: 0, totalLatencyMs: 0 };
          
          const totalReqs = cStats.sent + cStats.failed;
          const avgLatency = cStats.sent > 0 ? Math.round(cStats.totalLatencyMs / cStats.sent) : 0;
          const successRate = totalReqs > 0 ? ((cStats.sent / totalReqs) * 100).toFixed(1) : 0;

          return (
            <Card key={name} className="p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 capitalize">{name}</h3>
                <Badge variant={cState.open ? "error" : "success"}>
                  {cState.open ? "Circuit Open" : "Healthy"}
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Sent</span>
                    <p className="font-medium text-gray-900">{cStats.sent}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Failed</span>
                    <p className="font-medium text-gray-900">{cStats.failed}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Avg Latency</span>
                    <p className="font-medium text-gray-900">{avgLatency}ms</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Success Rate</span>
                    <p className="font-medium text-gray-900">{successRate}%</p>
                  </div>
                </div>

                {cState.failures > 0 && !cState.open && (
                  <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded-md border border-orange-100">
                    <span className="font-medium">Warning:</span> {cState.failures} recent failures
                  </div>
                )}
                
                {cState.open && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-100">
                    <span className="font-medium">Circuit Breaker Open:</span> Traffic is being routed to fallback providers.
                  </div>
                )}
              </div>
            </Card>
          );
        })}
        {providers.length === 0 && (
          <div className="col-span-3 text-center py-10 text-gray-500">
            No providers are active. Check worker logs.
          </div>
        )}
      </div>
    </div>
  );
}
