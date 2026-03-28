import { useEffect, useState } from "react";
import api from "../lib/api";
import { PageLoader } from "../components/LoadingSpinner";
import { useToast } from "../components/Toast";
import Badge from "../components/Badge";
import { CreditCard, Zap, TrendingUp, FileText, ExternalLink, Check, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

export default function Billing() {
  const { addToast } = useToast();
  const [plan, setPlan] = useState(null);
  const [usage, setUsage] = useState(null);
  const [plans, setPlans] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [planRes, usageRes, plansRes, invRes] = await Promise.all([
        api.get("/v1/billing/plan"),
        api.get("/v1/billing/usage"),
        api.get("/v1/billing/plans"),
        api.get("/v1/billing/invoices").catch(() => ({ data: { data: [] } }))
      ]);
      setPlan(planRes.data.data);
      setUsage(usageRes.data.data);
      setPlans(plansRes.data.data || []);
      setInvoices(invRes.data.data || []);
    } catch { }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleUpgrade(planId) {
    try {
      if (!window.Razorpay) {
        addToast("Razorpay SDK not loaded", "error");
        return;
      }

      const configRes = await api.get("/v1/config");
      const rzpKeyId = configRes.data.razorpayKeyId;

      if (!rzpKeyId) {
        addToast("Razorpay not configured. Set RAZORPAY_KEY_ID in .env", "warning");
        return;
      }

      const res = await api.post("/v1/billing/checkout", { planId });
      const { subscriptionId } = res.data.data;

      if (!subscriptionId) throw new Error("Could not create subscription");

      const options = {
        key: rzpKeyId,
        subscription_id: subscriptionId,
        name: "NotifyStack",
        description: "SaaS Subscription",
        handler: async function (response) {
          addToast("Payment successful! Verifying subscription...", "success");
          try {
            await api.post("/v1/billing/verify-subscription", {
              subscriptionId: response.razorpay_subscription_id || subscriptionId
            });
            addToast("Subscription verified and activated!", "success");
            load();
          } catch (err) {
            addToast("Payment succeeded, but verification failed. Please contact support.", "error");
            load();
          }
        },
        theme: { color: "#0a0a0a" }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        addToast(response.error?.description || "Payment failed", "error");
      });
      rzp.open();

    } catch (e) {
      addToast(e.response?.data?.message || e.message || "Checkout failed", "error");
    }
  }

  async function cancelSubscription() {
    if (!window.confirm("Are you sure you want to cancel your subscription immediately? You will be downgraded to the FREE plan.")) return;
    try {
      await api.post("/v1/billing/cancel");
      addToast("Subscription cancelled successfully", "success");
      load();
    } catch (e) {
      addToast(e.response?.data?.message || "Cancellation failed", "error");
    }
  }

  if (loading) return <PageLoader />;

  const usagePct = usage ? parseFloat(usage.percentUsed) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Billing & Usage</h1>
        <p className="mt-1 text-sm text-ink-muted">Manage your subscription and track notification usage.</p>
      </div>

      {/* Current plan + usage */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-ink-muted" />
            <h2 className="text-base font-semibold">Current Plan</h2>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-3xl font-bold">{plan?.plan || "FREE"}</p>
              <p className="text-sm text-ink-muted mt-1">{plan?.plan_name || "Free"} plan</p>
            </div>
            <Badge variant={plan?.status === "active" ? "success" : "default"}>
              {plan?.status || "active"}
            </Badge>
          </div>
          {plan?.current_period_end && (
            <p className="text-xs text-ink-muted">Renews {new Date(plan.current_period_end).toLocaleDateString()}</p>
          )}
          {plan?.razorpay_subscription_id && (
            <button onClick={cancelSubscription} className="btn border border-red-200 text-red-600 hover:bg-red-50 mt-4 gap-1 text-xs px-3 py-1.5 rounded-lg font-medium">
              Cancel Subscription
            </button>
          )}
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-ink-muted" />
            <h2 className="text-base font-semibold">Monthly Usage</h2>
          </div>
          {usage && (
            <>
              <div className="flex items-baseline justify-between mb-3">
                <p className="text-3xl font-bold tabular-nums">{usage.used.toLocaleString()}</p>
                <p className="text-sm text-ink-muted">/ {usage.limit.toLocaleString()}</p>
              </div>
              <div className="h-3 rounded-full bg-neutral-100 overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${usagePct > 90 ? "bg-red-500" : usagePct > 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                  style={{ width: `${Math.min(100, usagePct)}%` }}
                />
              </div>
              <p className="text-xs text-ink-muted">{usage.remaining.toLocaleString()} remaining this month</p>

              {usage.byChannel && Object.keys(usage.byChannel).length > 0 && (
                <div className="mt-4 flex gap-3">
                  {Object.entries(usage.byChannel).map(([ch, cnt]) => (
                    <div key={ch} className="rounded-lg border border-surface-border px-3 py-2 text-center">
                      <p className="text-xs text-ink-muted capitalize">{ch}</p>
                      <p className="text-sm font-semibold tabular-nums">{cnt.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Usage chart */}
      {usage?.history?.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-ink-muted" />
            <h2 className="text-base font-semibold">Daily Usage (30 days)</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={usage.history.reduce((acc, d) => {
              const key = new Date(d.date).toLocaleDateString("en", { month: "short", day: "numeric" });
              const existing = acc.find(a => a.date === key);
              if (existing) existing.count += d.count;
              else acc.push({ date: key, count: d.count });
              return acc;
            }, [])}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#737373" }} />
              <YAxis tick={{ fontSize: 10, fill: "#737373" }} />
              <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px" }} />
              <Bar dataKey="count" fill="#0a0a0a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Plans */}
      <div className="card">
        <h2 className="text-base font-semibold mb-6">Available Plans</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {plans.map(p => {
            const isCurrent = p.id === (plan?.plan || "FREE");
            const features = typeof p.features === "string" ? JSON.parse(p.features) : (p.features || []);
            return (
              <div key={p.id} className={`rounded-xl border-2 p-6 transition-all ${isCurrent ? "border-ink bg-ink/[0.02]" : "border-surface-border"}`}>
                <h3 className="text-lg font-bold">{p.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold">${(p.price_cents / 100).toFixed(0)}</span>
                  <span className="text-xs text-ink-muted">/mo</span>
                </div>
                <ul className="mt-4 space-y-2">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-ink-muted">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <div className="mt-4 rounded-lg bg-ink text-white text-center py-2 text-xs font-semibold">Current Plan</div>
                ) : (
                  <button onClick={() => handleUpgrade(p.id)} className="btn btn-secondary w-full mt-4 text-xs gap-1">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    {p.price_cents > (plan?.price_cents || 0) ? "Upgrade" : "Switch"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoices */}
      {invoices.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-ink-muted" />
            <h2 className="text-base font-semibold">Invoice History</h2>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id}>
                    <td className="text-sm">{new Date(inv.created).toLocaleDateString()}</td>
                    <td className="font-semibold">${(inv.amount / 100).toFixed(2)}</td>
                    <td><Badge variant={inv.status === "paid" ? "success" : "warning"}>{inv.status}</Badge></td>
                    <td>
                      {inv.invoiceUrl && <a href={inv.invoiceUrl} target="_blank" className="text-xs text-ink hover:underline">View</a>}
                      {inv.pdfUrl && <a href={inv.pdfUrl} target="_blank" className="text-xs text-ink-muted hover:underline ml-3">PDF</a>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
