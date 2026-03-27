import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000" });

api.interceptors.request.use((config) => {
  const apiKey = localStorage.getItem("notification_api_key");
  if (apiKey) {
    config.headers["x-api-key"] = apiKey;
  }
  const admin =
    localStorage.getItem("notification_admin_secret") ||
    import.meta.env.VITE_ADMIN_SECRET ||
    "";
  if (admin) {
    config.headers["x-admin-secret"] = admin;
  }
  return config;
});

export default api;
