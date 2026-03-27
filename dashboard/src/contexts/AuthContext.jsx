import { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("ntf_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("ntf_token");
    if (token && !user) {
      api.get("/v1/auth/me")
        .then((res) => {
          const u = res.data.data;
          setUser(u);
          localStorage.setItem("ntf_user", JSON.stringify(u));
        })
        .catch(() => {
          localStorage.removeItem("ntf_token");
          localStorage.removeItem("ntf_user");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email, password) {
    const res = await api.post("/v1/auth/login", { email, password });
    const { user: u, token } = res.data.data;
    localStorage.setItem("ntf_token", token);
    localStorage.setItem("ntf_user", JSON.stringify(u));
    setUser(u);
    return u;
  }

  async function signup(name, email, password) {
    const res = await api.post("/v1/auth/signup", { name, email, password });
    const { user: u, token } = res.data.data;
    localStorage.setItem("ntf_token", token);
    localStorage.setItem("ntf_user", JSON.stringify(u));
    setUser(u);
    return u;
  }

  function loginWithToken(token, userData) {
    localStorage.setItem("ntf_token", token);
    localStorage.setItem("ntf_user", JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("ntf_token");
    localStorage.removeItem("ntf_user");
    localStorage.removeItem("ntf_project");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithToken, logout, isAdmin: user?.role === "ADMIN" }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
