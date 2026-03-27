import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";
import { Mail, Lock, User, ArrowRight, Bell } from "lucide-react";

export default function Signup() {
  const { signup, loginWithToken, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({});

  useEffect(() => {
    api.get("/v1/config").then(r => setConfig(r.data)).catch(() => {});
  }, []);

  if (user) { navigate("/dashboard", { replace: true }); return null; }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await signup(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Signup failed");
    } finally { setLoading(false); }
  }

  async function handleGoogleSignup(response) {
    setError(""); setLoading(true);
    try {
      const res = await api.post("/v1/auth/google", { idToken: response.credential });
      loginWithToken(res.data.data.token, res.data.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError("Google signup failed");
    } finally { setLoading(false); }
  }

  useEffect(() => {
    if (!config.googleClientId) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: config.googleClientId,
        callback: handleGoogleSignup
      });
      window.google?.accounts.id.renderButton(
        document.getElementById("google-signup-btn"),
        { theme: "outline", size: "large", width: 380, text: "signup_with" }
      );
    };
    document.head.appendChild(script);
    return () => script.remove();
  }, [config.googleClientId]);

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white mb-4">
            <Bell className="h-6 w-6 text-ink" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">NotifyStack</h1>
          <p className="mt-2 text-neutral-400">Create your free account</p>
        </div>

        <div className="card space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          {config.googleClientId && (
            <>
              <div id="google-signup-btn" className="flex justify-center" />
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-neutral-200" />
                <span className="text-xs text-ink-muted">or sign up with email</span>
                <div className="flex-1 h-px bg-neutral-200" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-subtle" />
                <input type="text" className="input pl-10" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required autoFocus />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-subtle" />
                <input type="email" className="input pl-10" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-subtle" />
                <input type="password" className="input pl-10" placeholder="Min 8 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full gap-2">
              {loading ? "Creating account..." : "Create Account"} {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="text-center text-sm text-ink-muted">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-ink hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
