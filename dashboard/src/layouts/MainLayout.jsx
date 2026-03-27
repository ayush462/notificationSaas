import { Link, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useProject } from "../contexts/ProjectContext";
import {
  LayoutDashboard, Bell, AlertTriangle, ScrollText, Key, Zap,
  FolderOpen, BookOpen, Users, LogOut, ChevronDown, Plus,
  BarChart3, ShieldAlert, TrendingUp, CreditCard, Menu, X
} from "lucide-react";
import { cn } from "../lib/utils";

export default function MainLayout() {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const { projects, current, selectProject, loadProjects, createProject } = useProject();
  const [projectOpen, setProjectOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { loadProjects(); }, []);
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const base = "/dashboard";

  const nav = [
    { to: base, label: "Overview", icon: LayoutDashboard, exact: true },
    { to: `${base}/notifications`, label: "Notifications", icon: Bell },
    { to: `${base}/dlq`, label: "Dead Letter Queue", icon: AlertTriangle },
    { to: `${base}/logs`, label: "Activity Logs", icon: ScrollText },
    { to: `${base}/apikeys`, label: "API Keys", icon: Key },
    { to: `${base}/events`, label: "Event Templates", icon: Zap },
    { to: `${base}/analytics`, label: "Analytics", icon: TrendingUp },
    { to: `${base}/projects`, label: "Projects", icon: FolderOpen },
    { to: `${base}/billing`, label: "Billing", icon: CreditCard },
    { to: `${base}/docs`, label: "Documentation", icon: BookOpen }
  ];

  const adminNav = [
    { to: `${base}/admin/overview`, label: "System Overview", icon: BarChart3 },
    { to: `${base}/admin/users`, label: "All Users", icon: Users },
    { to: `${base}/admin/dlq`, label: "System DLQ", icon: ShieldAlert }
  ];

  const isAdminPage = location.pathname.includes("/admin");
  const noProjectPages = ["/projects", "/billing", "/docs", "/analytics"];
  const needsProject = !isAdminPage && !noProjectPages.some(p => location.pathname.endsWith(p)) && location.pathname !== base;

  async function handleCreateProject(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    await createProject(newName.trim());
    setNewName("");
    setCreating(false);
  }

  function NavItems() {
    return (
      <>
        {nav.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? location.pathname === to : location.pathname.startsWith(to) && to !== base;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active ? "bg-ink text-white shadow-sm" : "text-ink-muted hover:bg-surface-muted hover:text-ink"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="my-2 border-t border-surface-border" />
            <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-ink-subtle">Admin</p>
            {adminNav.map(({ to, label, icon: Icon }) => {
              const active = location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active ? "bg-amber-50 text-amber-800 border border-amber-200" : "text-ink-muted hover:bg-surface-muted hover:text-ink"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-surface-muted">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-surface-border bg-ink text-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Mobile menu */}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1">
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                <Bell className="h-4 w-4 text-ink" />
              </div>
              <span className="text-lg font-semibold tracking-tight hidden sm:block">NotifyStack</span>
            </Link>

            {/* Project selector */}
            {!isAdminPage && (
              <div className="relative">
                <button
                  onClick={() => setProjectOpen(!projectOpen)}
                  className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/50 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-700/50 transition-colors"
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  <span className="max-w-[120px] sm:max-w-[160px] truncate">{current?.name || "Select project"}</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>

                {projectOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProjectOpen(false)} />
                    <div className="absolute left-0 top-full mt-2 z-20 w-64 rounded-xl border border-surface-border bg-white p-2 shadow-xl animate-fade-in">
                      {projects.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => { selectProject(p); setProjectOpen(false); }}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-left transition-colors",
                            p.id === current?.id ? "bg-ink text-white" : "text-ink hover:bg-surface-muted"
                          )}
                        >
                          <FolderOpen className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{p.name}</span>
                        </button>
                      ))}
                      {!creating ? (
                        <button
                          onClick={() => setCreating(true)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-muted hover:bg-surface-muted transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          New project
                        </button>
                      ) : (
                        <form onSubmit={handleCreateProject} className="flex gap-2 p-2">
                          <input
                            autoFocus
                            className="input text-xs"
                            placeholder="Project name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                          />
                          <button type="submit" className="btn btn-primary text-xs !px-3">Add</button>
                        </form>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {isAdminPage && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-600/30 bg-amber-900/20 px-3 py-1.5 text-sm text-amber-300">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Admin Panel</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-neutral-400">{user?.plan || "FREE"} · {user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white p-4 shadow-xl overflow-y-auto" onClick={e => e.stopPropagation()}>
            <nav className="space-y-1 mt-2">
              <NavItems />
            </nav>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="mx-auto grid max-w-[1400px] gap-6 lg:gap-8 px-4 py-6 lg:grid-cols-[240px_1fr] lg:px-6 lg:py-8">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block h-fit space-y-2 lg:sticky lg:top-24">
          <nav className="card space-y-1 p-2">
            <NavItems />
          </nav>
        </aside>

        {/* Main */}
        <main className="min-w-0 space-y-6 animate-fade-in">
          {needsProject && !current ? (
            <div className="card text-center py-16">
              <FolderOpen className="mx-auto h-12 w-12 text-ink-subtle mb-4" />
              <h2 className="text-lg font-semibold text-ink">No project selected</h2>
              <p className="mt-2 text-sm text-ink-muted">Create or select a project to get started.</p>
              <Link to="/dashboard/projects" className="btn btn-primary mt-6 gap-2">
                <Plus className="h-4 w-4" />
                Go to Projects
              </Link>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}
