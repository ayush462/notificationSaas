import { Link, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Send,
  AlertTriangle,
  ScrollText,
  Key,
  BookOpen,
  Shield
} from "lucide-react";
import { cn } from "../lib/utils";

const nav = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/notifications", label: "Send", icon: Send },
  { to: "/dlq", label: "Dead letter", icon: AlertTriangle },
  { to: "/logs", label: "Activity log", icon: ScrollText },
  { to: "/apikeys", label: "API keys", icon: Key },
  { to: "/architecture", label: "How it scales", icon: BookOpen }
];

export default function MainLayout() {
  const location = useLocation();
  const [apiKey, setApiKey] = useState(localStorage.getItem("notification_api_key") || "");
  const [adminSecret, setAdminSecret] = useState(
    localStorage.getItem("notification_admin_secret") || import.meta.env.VITE_ADMIN_SECRET || ""
  );

  function saveCredentials() {
    localStorage.setItem("notification_api_key", apiKey.trim());
    localStorage.setItem("notification_admin_secret", adminSecret.trim());
  }

  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="border-b border-surface-border bg-ink text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-lg font-semibold tracking-tight">NotifyStack</p>
            <p className="text-xs text-neutral-400">Email notifications API · SaaS-ready</p>
          </div>
          <div className="hidden items-center gap-2 text-xs text-neutral-400 md:flex">
            <Shield className="h-4 w-4" />
            <span>Kafka · Redis · PostgreSQL</span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-6">
        <aside className="h-fit space-y-6">
          <div className="card space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Credentials</p>
            <div>
              <label className="label">API key (x-api-key)</label>
              <input
                className="input font-mono text-xs"
                placeholder="nk_…"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Admin secret (optional)</label>
              <input
                className="input font-mono text-xs"
                type="password"
                placeholder="Matches API ADMIN_SECRET"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
              />
              <p className="mt-1 text-xs text-ink-subtle">Required to create/list/revoke keys if server sets ADMIN_SECRET.</p>
            </div>
            <button type="button" className="btn btn-primary w-full" onClick={saveCredentials}>
              Save credentials
            </button>
          </div>

          <nav className="card space-y-1 p-2">
            {nav.map(({ to, label, icon: Icon }) => {
              const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "bg-ink text-white" : "text-ink-muted hover:bg-surface-muted hover:text-ink"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
