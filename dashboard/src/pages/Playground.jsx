import { useState, useEffect } from "react";
import { useProject } from "../contexts/ProjectContext";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";
import { NotificationBell } from "../components/NotificationBell";
import { Card } from "../components/ui/Card";
import { Terminal, Send, Play, Sparkles } from "lucide-react";
import { cn } from "../lib/utils";

export default function Playground() {
  const { current } = useProject();
  const [apiKey, setApiKey] = useState("");
  const [externalUserId, setExternalUserId] = useState("user_123");
  const [sending, setSending] = useState(false);
  const [lastStep, setLastStep] = useState(null);
  const [errMessage, setErrMessage] = useState("");
  const [errDetails, setErrDetails] = useState(null);

  // Load first active API key for this project automatically
  useEffect(() => {
    if (!current) return;
    api.get(`/v1/projects/${current.id}/keys`)
      .then(res => {
        const activeKey = res.data.data.find(k => k.active);
        if (activeKey) {
          // Note: In real app, we would only have the prefix unless sensitive view is triggered.
          // For playground demo purposes, we will ask the user to provide their key or assume it is available.
          // Since we hash keys, we can't retrieve the raw key.
          // We'll show a placeholder and ask the user to paste it.
        }
      });
  }, [current?.id]);

  const testTrigger = async () => {
    if (!apiKey) {
      alert("Please enter your API Key first (from the API Keys tab)");
      return;
    }
    setSending(true);
    setLastStep("sending");
    try {
      await api.post("/v1/notifications", {
        externalUserId,
        subject: "Bell Widget Test 🔔",
        body: `Testing the in-app notification center at ${new Date().toLocaleTimeString()}. This message was delivered via the SDK.`,
        channel: "inapp"
      }, {
        headers: { "x-api-key": apiKey }
      });
      setLastStep("sent");
    } catch (err) {
      console.error(err);
      setLastStep("error");
      setErrMessage(err.response?.data?.message || "Internal Server Error");
      setErrDetails(err.response?.data?.debug || null);
    } finally {
      setSending(false);
    }
  };

  if (!current) return <div className="p-8 text-center">Select a project first.</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink flex items-center gap-2">
            In-App Playground <Sparkles className="h-5 w-5 text-amber-500" />
          </h1>
          <p className="mt-1 text-sm text-ink-muted">Test the premium Notification Bell widget in real-time.</p>
        </div>
        
        {/* THE BELL - LIVE DEMO */}
        <div className="bg-white p-2 rounded-xl shadow-sm border border-neutral-100 flex items-center gap-3 pr-4">
          <span className="text-xs font-semibold text-neutral-400 pl-2">LIVE DEMO:</span>
          <NotificationBell 
            externalUserId={externalUserId} 
            projectId={current.id} 
            apiKey={apiKey} 
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:gap-10">
        {/* Configuration */}
        <div className="space-y-6">
          <Card className="p-4 sm:p-6 shadow-md border-0 bg-white/80 backdrop-blur">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-ink">
              <Terminal className="h-5 w-5 text-blue-500" /> 1. Configuration
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="label text-xs uppercase tracking-tight text-ink-subtle">Your Live API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="ntf_live_..."
                  className="input font-mono text-sm bg-neutral-50/50"
                />
                <p className="mt-2 text-[11px] leading-relaxed text-ink-subtle">
                  Get this from the <a href="/dashboard/apikeys" className="text-blue-600 font-semibold hover:underline">API Keys</a> tab. 
                  <span className="block mt-1 italic text-amber-600 font-medium">Never share your secret key in frontend code! (Use for testing only)</span>
                </p>
              </div>

              <div>
                <label className="label text-xs uppercase tracking-tight text-ink-subtle">External User ID</label>
                <input
                  type="text"
                  value={externalUserId}
                  onChange={(e) => setExternalUserId(e.target.value)}
                  className="input font-mono text-sm bg-neutral-50/50"
                />
                <p className="mt-1.5 text-[11px] text-ink-subtle italic">
                  The unique ID from your own database (e.g. `user_123`).
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 shadow-lg border-0 bg-blue-50/30">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-ink">
              <Play className="h-5 w-5 text-indigo-500" /> 2. Trigger Test Event
            </h3>
            <p className="text-sm text-ink-muted mb-6 leading-relaxed">
              Click the button below to send a real-time notification. 
              The bell in the top right will update automatically using our polling logic!
            </p>
            
            <button
              onClick={testTrigger}
              disabled={sending || !apiKey}
              className={cn(
                "btn btn-primary w-full py-3.5 gap-2 text-sm font-bold shadow-lg shadow-blue-500/20",
                sending && "opacity-70 cursor-not-allowed"
              )}
            >
              {sending ? "Processing..." : "Trigger In-App Feed Update"}
              <Send className="h-4 w-4" />
            </button>

            {lastStep === "sent" && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2 text-emerald-700 animate-in fade-in slide-in-from-top-2">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Success! Notification delivered to feed.</span>
              </div>
            )}
            {lastStep === "error" && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-700">
                <p className="text-sm font-bold">Delivery Failed</p>
                <p className="text-[11px] mt-1 opacity-80 font-medium">
                  {errMessage || "Check your API key and project settings."}
                </p>
                {errDetails && (
                  <pre className="mt-2 text-[9px] bg-red-100 p-2 rounded overflow-x-auto max-w-full">
                    {JSON.stringify(errDetails, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Integration Guide */}
        <div className="space-y-6 text-sm">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative card bg-neutral-900 border-0 p-4 sm:p-6">
              <h3 className="text-blue-400 font-bold uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2">
                React Snippet <div className="h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
              </h3>
              <pre className="overflow-x-auto text-[12px] sm:text-[13px] leading-relaxed text-blue-100/90 scrollbar-thin scrollbar-thumb-neutral-700">
{`import { NotificationBell } from "@notifystack/react";

function Navbar() {
  return (
    <nav className="flex justify-between items-center">
      <Logo />
      
      {/* 
        This Bell widget handles state, 
        polling, and 'Mark as Read' out-of-the-box.
       */}
      <NotificationBell 
        apiKey="ntf_live_xxxx"
        externalUserId="user_uuid_here" 
      />
    </nav>
  );
}`}
              </pre>
            </div>
          </div>

          <div className="card p-4 sm:p-6 border-dashed border-2 border-neutral-200 bg-neutral-50/30">
            <h4 className="font-bold text-ink mb-3 text-base">Platform Architecture</h4>
            <ul className="space-y-4 text-ink-muted">
              <li className="flex gap-3">
                <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                <p className="text-[13px] leading-snug">Trigger events via our REST API using <code>channel: "inapp"</code>.</p>
              </li>
              <li className="flex gap-3">
                <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                <p className="text-[13px] leading-snug">Specify an <code>externalUserId</code> to map content to your app's specific user.</p>
              </li>
              <li className="flex gap-3">
                <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                <p className="text-[13px] leading-snug">Users get immediate updates without you building a custom backend feed.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
