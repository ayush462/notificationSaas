import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";
import { Mail, Lock, ArrowRight, Smartphone, Bell } from "lucide-react";

export default function Login() {
  const { login, loginWithToken, user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("password"); // password | otp
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({});

  useEffect(() => {
    api.get("/v1/config").then(r => setConfig(r.data)).catch(() => {});
  }, []);

  if (user) { navigate("/dashboard", { replace: true }); return null; }

  async function handlePassword(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  }

  async function sendOtp() {
    setError(""); setLoading(true);
    try {
      await api.post("/v1/auth/otp/send", { email });
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally { setLoading(false); }
  }

  async function verifyOtp(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await api.post("/v1/auth/otp/verify", { email, otp });
      loginWithToken(res.data.data.token, res.data.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally { setLoading(false); }
  }

  async function handleGoogleLogin(response) {
    setError(""); setLoading(true);
    try {
      const res = await api.post("/v1/auth/google", { idToken: response.credential });
      loginWithToken(res.data.data.token, res.data.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError("Google login failed");
    } finally { setLoading(false); }
  }

  // Load Google Sign-In script
  useEffect(() => {
    if (!config.googleClientId) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: config.googleClientId,
        callback: handleGoogleLogin
      });
      window.google?.accounts.id.renderButton(
        document.getElementById("google-signin-btn"),
        { theme: "outline", size: "large", width: 380, text: "signin_with" }
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
          <p className="mt-2 text-neutral-400">Sign in to your account</p>
        </div>

        <div className="card space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          {/* Google Sign In */}
          {config.googleClientId && (
            <>
              <div id="google-signin-btn" className="flex justify-center" />
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-neutral-200" />
                <span className="text-xs text-ink-muted">or</span>
                <div className="flex-1 h-px bg-neutral-200" />
              </div>
            </>
          )}

          {/* Mode toggle */}
          <div className="flex gap-1 rounded-lg border border-surface-border bg-surface-muted p-1">
            <button
              type="button"
              onClick={() => { setMode("password"); setOtpSent(false); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all ${mode === "password" ? "bg-white text-ink shadow-sm" : "text-ink-muted hover:text-ink"}`}
            >
              <Lock className="h-3.5 w-3.5" /> Password
            </button>
            <button
              type="button"
              onClick={() => { setMode("otp"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all ${mode === "otp" ? "bg-white text-ink shadow-sm" : "text-ink-muted hover:text-ink"}`}
            >
              <Smartphone className="h-3.5 w-3.5" /> OTP
            </button>
          </div>

          {mode === "password" ? (
            <form onSubmit={handlePassword} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-subtle" />
                  <input type="email" className="input pl-10" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
                </div>
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-subtle" />
                  <input type="password" className="input pl-10" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary w-full gap-2">
                {loading ? "Signing in..." : "Sign in"} {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-subtle" />
                  <input type="email" className="input pl-10" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>
              {!otpSent ? (
                <button type="button" onClick={sendOtp} disabled={loading || !email} className="btn btn-primary w-full">
                  {loading ? "Sending..." : "Send OTP Code"}
                </button>
              ) : (
                <form onSubmit={verifyOtp} className="space-y-4">
                  <div>
                    <label className="label">Enter OTP</label>
                    <input type="text" className="input text-center text-2xl tracking-[0.5em] font-mono" placeholder="000000" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))} required autoFocus />
                    <p className="mt-1.5 text-xs text-ink-muted">Check your email for the 6-digit code</p>
                  </div>
                  <button type="submit" disabled={loading || otp.length !== 6} className="btn btn-primary w-full gap-2">
                    {loading ? "Verifying..." : "Verify & Sign in"} {!loading && <ArrowRight className="h-4 w-4" />}
                  </button>
                  <button type="button" onClick={() => { setOtpSent(false); setOtp(""); }} className="text-xs text-ink-muted hover:text-ink w-full text-center">
                    Resend code
                  </button>
                </form>
              )}
            </div>
          )}

          <p className="text-center text-sm text-ink-muted">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-ink hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
