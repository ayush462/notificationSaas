import { Link, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useProject } from "../contexts/ProjectContext";
import {
  LayoutDashboard, Bell, AlertTriangle, ScrollText, Key, Zap,
  FolderOpen, BookOpen, Users, LogOut, ChevronDown, Plus,
  BarChart3, ShieldAlert, TrendingUp, CreditCard, Menu, X,
  Ban, Webhook, Activity, Sparkles
} from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
    { to: `${base}/playground`, label: "In-App Playground", icon: Sparkles },
    { to: `${base}/webhooks`, label: "Webhooks", icon: Webhook },
    { to: `${base}/suppressions`, label: "Suppressions", icon: Ban },
    { to: `${base}/analytics`, label: "Analytics", icon: TrendingUp },
    { to: `${base}/projects`, label: "Projects", icon: FolderOpen },
    { to: `${base}/billing`, label: "Billing", icon: CreditCard },
    { to: `${base}/docs`, label: "Documentation", icon: BookOpen }
  ];

  const adminNav = [
    { to: `${base}/admin/overview`, label: "System Overview", icon: BarChart3 },
    { to: `${base}/admin/health`, label: "Provider Health", icon: Activity },
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
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-neutral-100/80 text-ink" : "text-ink-muted hover:bg-neutral-50 hover:text-ink"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="my-4 border-t border-surface-border" />
            <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-ink-subtle">Admin</p>
            {adminNav.map(({ to, label, icon: Icon }) => {
              const active = location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-amber-50 text-amber-900" : "text-ink-muted hover:bg-neutral-50 hover:text-ink"
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

  const ProjectSelectDropdown = () => (
    <div className="relative w-full">
      <button
        onClick={() => setProjectOpen(!projectOpen)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-surface-border bg-white px-3 py-2 text-sm text-ink hover:bg-neutral-50 transition-colors shadow-sm"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="bg-ink text-white p-1 rounded">
            <FolderOpen className="h-3.5 w-3.5" />
          </div>
          <span className="truncate font-medium">{current?.name || "Select project"}</span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-ink-subtle shrink-0" />
      </button>

      {projectOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setProjectOpen(false)} />
          <div className="absolute left-0 top-full mt-1.5 z-50 w-full rounded-lg border border-surface-border bg-white p-1.5 shadow-xl animate-fade-in">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => { selectProject(p); setProjectOpen(false); }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-left transition-colors",
                  p.id === current?.id ? "bg-neutral-100 text-ink font-medium" : "text-ink-muted hover:bg-neutral-50 hover:text-ink"
                )}
              >
                <FolderOpen className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{p.name}</span>
              </button>
            ))}
            <div className="my-1 border-t border-surface-border" />
            {!creating ? (
              <button
                onClick={() => setCreating(true)}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-ink hover:bg-neutral-50 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                New project
              </button>
            ) : (
              <form onSubmit={handleCreateProject} className="flex gap-2 p-1">
                <input
                  autoFocus
                  className="input text-xs !py-1.5"
                  placeholder="Project name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <button type="submit" className="btn btn-primary text-xs !px-3 !py-1.5">Add</button>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-surface-muted overflow-hidden">
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex w-[260px] flex-col border-r border-surface-border bg-white z-20 shrink-0">
        
        {/* Top brand */}
        <div className="h-[60px] flex items-center px-5 border-b border-surface-border shrink-0">
          <Link to="/" title="Go to Landing Page" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-ink shadow-sm">
              <Bell className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-ink">NotifyStack</span>
          </Link>
        </div>

        {/* Project Switcher */}
        {!isAdminPage && (
          <div className="px-3 pt-4 pb-2 shrink-0">
            <ProjectSelectDropdown />
          </div>
        )}
        {isAdminPage && (
          <div className="px-3 py-4 shrink-0">
            <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-50 px-3 py-2 text-sm text-amber-800 font-medium">
              <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Admin Panel</span>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          <NavItems />
        </nav>

        {/* User profile bottom */}
        <div className="mt-auto p-4 border-t border-surface-border shrink-0">
          <div className="flex items-center justify-between">
            <div className="truncate pr-2">
              <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
              <p className="text-xs text-ink-muted truncate">{user?.plan || "FREE"} · {user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-ink-muted hover:text-ink hover:bg-neutral-100 rounded-md transition-colors shrink-0"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        
        {/* Mobile Header */}
        <header className="lg:hidden h-14 shrink-0 border-b border-surface-border bg-white flex items-center justify-between px-4 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 -ml-1 text-ink-muted hover:text-ink">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex h-7 w-7 items-center justify-center rounded bg-ink shadow-sm">
              <Bell className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
          <button onClick={logout} className="text-xs font-medium text-ink-muted border rounded px-2 py-1">
            Logout
          </button>
        </header>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ ease: "easeOut", duration: 0.2 }}
              className="relative w-[280px] bg-white h-full flex flex-col shadow-2xl"
            >
              <div className="h-14 flex items-center justify-between border-b border-surface-border px-4 shrink-0">
                <span className="font-semibold text-ink">NotifyStack</span>
                <button onClick={() => setSidebarOpen(false)} className="p-1 text-ink-muted">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {!isAdminPage && <div className="p-3 border-b border-surface-border"><ProjectSelectDropdown /></div>}
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" onClick={() => setSidebarOpen(false)}>
                <NavItems />
              </nav>
            </motion.div>
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto w-full relative">
          <div className="mx-auto max-w-[1200px] p-4 sm:p-6 lg:p-8 w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="space-y-6"
              >
                {needsProject && !current ? (
                  <div className="card text-center py-16">
                    <FolderOpen className="mx-auto h-12 w-12 text-ink-subtle mb-4" />
                    <h2 className="text-lg font-semibold text-ink">No project selected</h2>
                    <p className="mt-2 text-sm text-ink-muted">Create or select a project to get started.</p>
                    <button onClick={() => setProjectOpen(true)} className="btn btn-primary mt-6 gap-2">
                      <Plus className="h-4 w-4" />
                      Select a Project
                    </button>
                  </div>
                ) : (
                  <Outlet />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
