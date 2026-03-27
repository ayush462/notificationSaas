import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { ProjectProvider } from "./contexts/ProjectContext";
import { PageLoader } from "./components/LoadingSpinner";
import MainLayout from "./layouts/MainLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import DLQ from "./pages/DLQ";
import Logs from "./pages/Logs";
import ApiKeys from "./pages/ApiKeys";
import Events from "./pages/Events";
import Projects from "./pages/Projects";
import Analytics from "./pages/Analytics";
import Billing from "./pages/Billing";
import AdminUsers from "./pages/AdminUsers";
import AdminOverview from "./pages/AdminOverview";
import AdminDLQ from "./pages/AdminDLQ";
import Docs from "./pages/Docs";
import NotFound from "./pages/NotFound";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicOnly><Landing /></PublicOnly>} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ProjectProvider>
              <MainLayout />
            </ProjectProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="dlq" element={<DLQ />} />
        <Route path="logs" element={<Logs />} />
        <Route path="apikeys" element={<ApiKeys />} />
        <Route path="events" element={<Events />} />
        <Route path="projects" element={<Projects />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="billing" element={<Billing />} />
        <Route path="docs" element={<Docs />} />
        <Route path="admin/overview" element={<AdminRoute><AdminOverview /></AdminRoute>} />
        <Route path="admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="admin/dlq" element={<AdminRoute><AdminDLQ /></AdminRoute>} />
      </Route>

      {/* Backward compat */}
      <Route path="/billing" element={<Navigate to="/dashboard/billing" replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
