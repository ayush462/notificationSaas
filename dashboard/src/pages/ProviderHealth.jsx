import { useState, useEffect } from "react";
import api from "../lib/api";
import { Card } from "../components/ui/card";
import Badge from "../components/Badge";
import { PageLoader } from "../components/LoadingSpinner";
import { AlertCircle, RefreshCw, Activity, ShieldAlert } from "lucide-react";
import { cn } from "../lib/utils";

export default function ProviderHealth() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async (isManual = false) => {
    if (isManual) setLoading(true);
    setError(null);
    try {
      const res = await api.get("/v1/admin/health");
      if (res.data.success) {
        setHealthData(res.data.data);
      } else {
        setError("API returned success:false");
      }
    } catch (err) {
      console.error("Failed to fetch provider health", err);
      setError("Unable to connect to worker health services. Please check if the worker is online.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(() => fetchHealth(false), 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !healthData) return <PageLoader />;

  const { circuitState = {}, stats = {} } = healthData || {};
  const providers = Array.from(new Set([...Object.keys(circuitState), ...Object.keys(stats)]));

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold mb-1">
            <Activity className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider">System Health</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Provider Status</h1>
          <p className="mt-1 text-sm text-gray-500">Real-time health and throughput of your notification infrastructure.</p>
        </div>
        <button 
          onClick={() => fetchHealth(true)} 
          disabled={loading}
          className="btn btn-secondary flex items-center gap-2 h-10 px-4 transition-all active:scale-95"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          {loading ? "Refreshing..." : "Refresh Status"}
        </button>
      </div>

      {!healthData && error ? (
        <div className="bg-white border rounded-xl p-12 text-center shadow-sm">
          <div className="mx-auto w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Health Connectivity Issue</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            The API service is running, but it cannot communicate with the Worker's health endpoint.
          </p>
          <div className="bg-neutral-50 rounded-lg p-4 border mb-8 max-w-lg mx-auto text-left flex gap-3 italic text-sm text-gray-600">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
          <p className="text-xs text-gray-400 mb-6 uppercase tracking-widest font-semibold">Troubleshooting Steps</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left text-sm mb-8">
            <div className="p-3 bg-neutral-50 rounded border">
              <p className="font-bold text-gray-700">1. Check WORKER_URL</p>
              <p className="text-gray-500 text-xs">Ensure your API has the correct environment variable.</p>
            </div>
            <div className="p-3 bg-neutral-50 rounded border">
              <p className="font-bold text-gray-700">2. Verify Worker Port</p>
              <p className="text-gray-500 text-xs">Ensure the health server is listening on the correct port.</p>
            </div>
          </div>
          <button onClick={() => fetchHealth(true)} className="btn btn-primary px-8">Retry Connection</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((name) => {
            const cState = circuitState[name] || { failures: 0, open: false };
            const cStats = stats[name] || { sent: 0, failed: 0, totalLatencyMs: 0 };
            
            const totalReqs = cStats.sent + cStats.failed;
            const avgLatency = cStats.sent > 0 ? Math.round(cStats.totalLatencyMs / cStats.sent) : 0;
            const successRate = totalReqs > 0 ? ((cStats.sent / totalReqs) * 100).toFixed(1) : 0;

            return (
              <Card key={name} className="p-6 border-none shadow-md bg-white hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-lg font-bold text-gray-900 capitalize">{name}</h3>
                  <Badge variant={cState.open ? "error" : "success"}>
                    {cState.open ? "Circuit Open" : "Healthy"}
                  </Badge>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Delivered</span>
                      <p className="font-semibold text-gray-900 text-lg">{cStats.sent}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Failed</span>
                      <p className="font-semibold text-gray-900 text-lg">{cStats.failed}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Avg Latency</span>
                      <p className="font-semibold text-gray-900 text-lg">{avgLatency}<span className="text-xs ml-0.5">ms</span></p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Success</span>
                      <p className="font-semibold text-gray-900 text-lg">{successRate}<span className="text-xs ml-0.5">%</span></p>
                    </div>
                  </div>

                  {cState.failures > 0 && !cState.open && (
                    <div className="text-xs text-orange-600 bg-orange-50 p-2.5 rounded-lg border border-orange-100 flex items-center gap-2">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>{cState.failures} recent fluctuations detected.</span>
                    </div>
                  )}
                  
                  {cState.open && (
                    <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100 flex items-center gap-2">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      <span>Traffic routed to fallback providers.</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
          
          {providers.length === 0 && !loading && (
            <div className="col-span-full bg-white border rounded-xl py-20 text-center shadow-sm">
              <Activity className="mx-auto h-12 w-12 text-gray-200 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">No active traffic</h3>
              <p className="text-sm text-gray-500">Wait for notifications to be processed to see data.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
