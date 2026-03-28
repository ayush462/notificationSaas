import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Bell, Zap, Shield, BarChart3, Code, Globe, Mail, MessageSquare, Smartphone, ArrowRight, Check, ChevronRight, Star, LogOut } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Mail, title: "Multi-Channel", desc: "Email, SMS, and Push notifications from one API." },
  { icon: Zap, title: "Event-Driven Templates", desc: "Create templates with {{variables}} — trigger by event name." },
  { icon: Shield, title: "Enterprise Security", desc: "API keys, JWT auth, rate limiting, RBAC, DKIM signing." },
  { icon: BarChart3, title: "Real-Time Analytics", desc: "Track delivery rates, provider performance, and usage." },
  { icon: Code, title: "Developer-First SDK", desc: "Node.js SDK with auto-retry, idempotency, and TypeScript." },
  { icon: Globe, title: "Multi-Provider Failover", desc: "SMTP, SendGrid, Mailgun — auto-switch on failure." }
];

const plans = [
  { id: "FREE", name: "Free", price: "$0", period: "/forever", features: ["1,000 notifications/mo", "1 project", "Email only", "Community support"], cta: "Get Started", popular: false },
  { id: "PRO", name: "Pro", price: "$29", period: "/month", features: ["50,000 notifications/mo", "5 projects", "Email + SMS + Push", "Priority support", "Custom templates", "Analytics dashboard"], cta: "Start Free Trial", popular: true },
  { id: "SCALE", name: "Scale", price: "$99", period: "/month", features: ["Unlimited notifications", "Unlimited projects", "All channels", "Dedicated support", "Custom domain", "SLA 99.9%", "Webhook events"], cta: "Contact Sales", popular: false }
];

const steps = [
  { num: "01", title: "Create a Project", desc: "Sign up and create your first project in seconds." },
  { num: "02", title: "Get Your API Key", desc: "Generate a Stripe-style API key for your backend." },
  { num: "03", title: "Send Notifications", desc: "Use our SDK or REST API to send email, SMS, or push." }
];

export default function Landing() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-white text-ink overflow-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-neutral-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink">
              <Bell className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">NotifyStack</span>
          </div>
          <div className="hidden sm:flex items-center gap-8 text-sm font-medium text-ink-muted">
            <a href="#features" className="hover:text-ink transition-colors">Features</a>
            <a href="#pricing" className="hover:text-ink transition-colors">Pricing</a>
            <a href="#how-it-works" className="hover:text-ink transition-colors">How it works</a>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button onClick={handleLogout} className="text-sm font-medium text-ink-muted hover:text-ink transition-colors hidden sm:flex items-center gap-1.5">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
                <Link to="/dashboard" className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition-all active:scale-[0.98]">
                  Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-ink-muted hover:text-ink transition-colors hidden sm:block">Sign in</Link>
                <Link to="/signup" className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition-all active:scale-[0.98]">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-gradient-to-br from-neutral-100 via-neutral-50 to-white blur-3xl" />
        </div>
        <motion.div 
          className="mx-auto max-w-4xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-1.5 text-xs font-medium text-ink-muted mb-8">
            <Star className="h-3.5 w-3.5 text-amber-500" />
            <span>Production-grade notification infrastructure</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.1] bg-gradient-to-br from-ink via-neutral-700 to-neutral-500 bg-clip-text text-transparent">
            Notifications<br />that just work.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-ink-muted max-w-2xl mx-auto leading-relaxed">
            Send email, SMS, and push notifications from a single API.
            Built for developers who need reliability, not complexity.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-ink px-8 py-3.5 text-base font-semibold text-white hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-200 active:scale-[0.98]">
                Go to Dashboard <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <Link to="/signup" className="inline-flex items-center gap-2 rounded-xl bg-ink px-8 py-3.5 text-base font-semibold text-white hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-200 active:scale-[0.98]">
                Start for Free <ArrowRight className="h-5 w-5" />
              </Link>
            )}
            <a href="#how-it-works" className="inline-flex items-center gap-2 rounded-xl border-2 border-neutral-200 px-8 py-3.5 text-base font-semibold text-ink hover:border-neutral-400 transition-all">
              See how it works
            </a>
          </div>
          <div className="mt-12 flex items-center justify-center gap-6 text-xs text-ink-muted">
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-500" /> No credit card</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-500" /> 1,000 free/mo</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-500" /> Setup in 5 min</span>
          </div>
        </motion.div>

        {/* Code snippets */}
        <motion.div 
          className="mt-16 mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          {/* Snippet 1: Email */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl blur opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            <div className="relative rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs text-neutral-500 font-mono">email_sender.js</span>
              </div>
              <pre className="text-sm font-mono leading-relaxed overflow-x-auto text-neutral-300 flex-1">
<span className="text-violet-400">const</span> notify = <span className="text-violet-400">new</span> <span className="text-blue-400">NotifySDK</span>(<span className="text-green-400">"ntf_live_key"</span>);{"\n\n"}
<span className="text-neutral-500">{"// Send Email Event"}</span>{"\n"}
<span className="text-violet-400">await</span> notify.<span className="text-blue-400">track</span>(<span className="text-green-400">"USER_SIGNUP"</span>, {"{"}{"\n"}
  <span className="text-neutral-400">email:</span> <span className="text-green-400">"user@example.com"</span>,{"\n"}
  <span className="text-neutral-400">name:</span>  <span className="text-green-400">"Ayush"</span>{"\n"}
{"}"});{"\n\n"}
<span className="text-neutral-500">{"// ✓ Dynamically routed to SendGrid"}</span>{"\n"}
<span className="text-neutral-500">{"// ✓ Fails over to Mailgun if needed"}</span>
              </pre>
            </div>
          </div>

          {/* Snippet 2: SMS */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl blur opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse delay-150"></div>
            <div className="relative rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs text-neutral-500 font-mono">sms_sender.js</span>
              </div>
              <pre className="text-sm font-mono leading-relaxed overflow-x-auto text-neutral-300 flex-1">
<span className="text-violet-400">const</span> notify = <span className="text-violet-400">new</span> <span className="text-blue-400">NotifySDK</span>(<span className="text-green-400">"ntf_live_key"</span>);{"\n\n"}
<span className="text-neutral-500">{"// Send Direct SMS"}</span>{"\n"}
<span className="text-violet-400">await</span> notify.<span className="text-blue-400">sendSms</span>({"{"}{"\n"}
  <span className="text-neutral-400">to:</span> <span className="text-green-400">"+1234567890"</span>,{"\n"}
  <span className="text-neutral-400">body:</span> <span className="text-green-400">"Your code is 123456"</span>{"\n"}
{"}"});{"\n\n"}
<span className="text-neutral-500">{"// ✓ Routed to Twilio natively"}</span>{"\n"}
<span className="text-neutral-500">{"// ✓ Formatting & limits handled!"}</span>
              </pre>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Channel badges */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-4xl flex flex-wrap justify-center gap-4">
          {[
            { icon: Mail, label: "Email", desc: "SMTP, SendGrid, Mailgun" },
            { icon: MessageSquare, label: "SMS", desc: "Twilio" },
            { icon: Smartphone, label: "Push", desc: "FCM, Web Push" }
          ].map(ch => (
            <div key={ch.label} className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-6 py-4 hover:shadow-lg transition-all duration-300">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100">
                <ch.icon className="h-5 w-5 text-ink" />
              </div>
              <div>
                <p className="font-semibold text-sm">{ch.label}</p>
                <p className="text-xs text-ink-muted">{ch.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20 bg-neutral-50 overflow-hidden">
        <motion.div 
          className="mx-auto max-w-6xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Everything you need</h2>
            <p className="mt-4 text-ink-muted max-w-lg mx-auto">Built for scale from day one. No vendor lock-in.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div 
                key={f.title} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-2xl border border-neutral-200 bg-white p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 mb-5">
                  <f.icon className="h-6 w-6 text-ink" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-6 py-20 overflow-hidden">
        <motion.div 
          className="mx-auto max-w-4xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Up and running in minutes</h2>
            <p className="mt-4 text-ink-muted">Three steps to your first notification.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map(s => (
              <div key={s.num} className="text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-ink text-white text-2xl font-bold mb-5">
                  {s.num}
                </div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-20 bg-neutral-50 overflow-hidden">
        <motion.div 
          className="mx-auto max-w-5xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Simple, transparent pricing</h2>
            <p className="mt-4 text-ink-muted">Start free. Scale as you grow.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {plans.map((p, i) => (
              <motion.div 
                key={p.id} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`relative rounded-2xl border-2 p-8 transition-all duration-300 hover:shadow-xl ${
                  p.popular ? "border-ink bg-white shadow-lg scale-[1.02]" : "border-neutral-200 bg-white"
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-ink px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold">{p.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">{p.price}</span>
                  <span className="text-ink-muted text-sm">{p.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-ink-muted">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className={`mt-8 flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all active:scale-[0.98] ${
                    p.popular
                      ? "bg-ink text-white hover:bg-neutral-800"
                      : "border-2 border-neutral-200 text-ink hover:border-neutral-400"
                  }`}
                >
                  {p.cta} <ChevronRight className="h-4 w-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Ready to get started?</h2>
          <p className="mt-4 text-ink-muted text-lg">Join developers who trust NotifyStack for their notifications.</p>
          <Link to="/signup" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-ink px-10 py-4 text-base font-semibold text-white hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-200 active:scale-[0.98]">
            Create Free Account <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 px-6 py-12 bg-neutral-50">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink">
              <Bell className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold">NotifyStack</span>
          </div>
          <p className="text-xs text-ink-muted">&copy; {new Date().getFullYear()} NotifyStack. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-ink-muted">
            <Link to="/docs" className="hover:text-ink transition-colors">Docs</Link>
            <a href="mailto:support@notifystack.dev" className="hover:text-ink transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
