import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import DLQ from "./pages/DLQ";
import Logs from "./pages/Logs";
import ApiKeys from "./pages/ApiKeys";
import Architecture from "./pages/Architecture";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="dlq" element={<DLQ />} />
        <Route path="logs" element={<Logs />} />
        <Route path="apikeys" element={<ApiKeys />} />
        <Route path="architecture" element={<Architecture />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
