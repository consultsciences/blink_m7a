import React from 'react';
import { Zap, Code2, Eye, GitBranch, Sparkles, Terminal, ArrowRight, Check, Star } from 'lucide-react';
import { blink } from '../lib/blink';

const FEATURES = [
  {
    icon: Terminal,
    title: 'Real Sandbox Execution',
    desc: 'Every project runs in an isolated cloud environment with real Node.js, bash, and a live dev server.',
  },
  {
    icon: Eye,
    title: 'Live Preview',
    desc: 'Watch your app update in real-time as the AI writes and executes code — no manual reloads.',
  },
  {
    icon: Code2,
    title: 'Full File System Access',
    desc: 'The agent reads, writes, and refactors any file. Explore the tree, diff changes, and rollback instantly.',
  },
  {
    icon: Sparkles,
    title: 'Top AI Models',
    desc: 'Switch between Gemini 3 Flash, Claude 4.5 Sonnet, and GPT-5.2 mid-session for best-in-class results.',
  },
  {
    icon: GitBranch,
    title: 'Project History',
    desc: 'Every build is saved. Resume any session, fork projects, and pick up where you left off.',
  },
  {
    icon: Zap,
    title: 'Instant Scaffolding',
    desc: 'From zero to a working Vite + React app with Tailwind, GSAP animations, and fonts in under 60 seconds.',
  },
];

const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    desc: 'Perfect for trying out AI-powered coding.',
    features: ['5 sandbox sessions / month', '100 AI requests / month', 'Gemini 3 Flash model', 'Community support'],
    cta: 'Get Started Free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$20',
    period: '/mo',
    desc: 'For developers who ship fast.',
    features: ['Unlimited sandbox sessions', '2 000 AI requests / month', 'All AI models', 'Project history & resume', 'Priority support'],
    cta: 'Start Pro Trial',
    highlight: true,
  },
  {
    name: 'Team',
    price: '$49',
    period: '/mo',
    desc: 'For teams building together.',
    features: ['Everything in Pro', '10 000 AI requests / month', 'Shared project library', 'SSO & RBAC', 'Dedicated Slack'],
    cta: 'Contact Sales',
    highlight: false,
  },
];

const LOGOS = ['Vercel', 'Supabase', 'Stripe', 'Cloudflare', 'PlanetScale', 'Railway'];

export function LandingPage() {
  const handleLogin = () => blink.auth.login();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground font-sans selection:bg-primary/30 overflow-x-hidden">
      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/cursor_logo.png" alt="Logo" className="w-7 h-7" />
            <span className="font-bold text-[17px] tracking-tight">Cursor Studio</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#demo" className="hover:text-foreground transition-colors">Demo</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleLogin} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Sign In
            </button>
            <button
              onClick={handleLogin}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-white text-black hover:bg-white/90 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.25)]"
            >
              Get Started →
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative pt-40 pb-28 overflow-hidden">
        {/* Radial glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
          <div className="w-[900px] h-[500px] bg-white/[0.04] rounded-full blur-[120px]" />
        </div>
        {/* Noise grid */}
        <div className="absolute inset-0 opacity-[0.015] -z-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-white/70 mb-8">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Now powered by Gemini 3 Flash · Claude 4.5 · GPT-5.2</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-[80px] font-bold tracking-tight leading-[1.05] mb-6 bg-gradient-to-b from-white via-white to-white/50 bg-clip-text text-transparent">
            Build software<br />at the speed of thought.
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-white/50 mb-12 leading-relaxed">
            Describe your idea. Watch an AI agent scaffold, code, and preview a fully working app — 
            running in a real cloud sandbox — in under a minute.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleLogin}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-white/92 text-black font-semibold text-base transition-all shadow-[0_0_50px_-10px_rgba(255,255,255,0.4)] hover:scale-[1.03] active:scale-[0.98]"
            >
              Start Building — It's Free
            </button>
            <button
              onClick={handleLogin}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-base border border-white/10 transition-all"
            >
              <Eye size={16} /> Watch Demo
            </button>
          </div>

          {/* Social proof */}
          <p className="mt-8 text-xs text-white/30 font-medium tracking-wide uppercase">
            Trusted by builders at
          </p>
          <div className="mt-3 flex items-center justify-center gap-6 flex-wrap">
            {LOGOS.map(logo => (
              <span key={logo} className="text-sm font-semibold text-white/20 hover:text-white/40 transition-colors cursor-default">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── App Screenshot ─────────────────────────────────────────── */}
      <section id="demo" className="relative max-w-6xl mx-auto px-6 pb-20">
        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]">
          {/* Fake editor chrome */}
          <div className="h-10 bg-[#0d0d0d] border-b border-white/5 flex items-center gap-2 px-4">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            <div className="flex-1 mx-4 h-5 bg-white/5 rounded text-[11px] text-white/30 flex items-center px-3">
              cursor-studio.app
            </div>
          </div>
          <div className="grid grid-cols-[280px_1fr] h-[440px]">
            {/* Chat pane */}
            <div className="border-r border-white/5 bg-[#111] p-4 space-y-3 overflow-hidden">
              <div className="space-y-2">
                <div className="ml-auto w-3/4 bg-[#2d2d2d] rounded-xl px-3 py-2 text-[11px] text-white/70">
                  Build a SaaS landing page with dark theme
                </div>
                <div className="w-4/5 bg-white/5 rounded-xl px-3 py-2 text-[11px] text-white/50 leading-relaxed">
                  Creating project structure…
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  npm install complete
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Dev server running on :5173
                </div>
                <div className="w-full bg-white/5 rounded-xl px-3 py-2 text-[11px] text-white/50">
                  ✅ Landing page built! Preview is ready →
                </div>
              </div>
            </div>
            {/* Preview pane */}
            <div className="bg-[#1a1a1a] flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-white/30" />
                </div>
                <p className="text-sm text-white/30">Live preview renders here</p>
                <button
                  onClick={handleLogin}
                  className="text-xs text-white/50 hover:text-white transition-colors underline underline-offset-2"
                >
                  Try it now →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Everything you need to ship</h2>
          <p className="text-white/50 max-w-xl mx-auto">A complete AI development environment — from idea to deployed app — without leaving the browser.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors">
                <f.icon size={20} className="text-white/60" />
              </div>
              <h3 className="font-semibold text-sm mb-2">{f.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────── */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Simple, transparent pricing</h2>
          <p className="text-white/50">Start free, scale when you're ready.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-6 rounded-2xl border flex flex-col transition-all duration-300 ${
                plan.highlight
                  ? 'bg-white/[0.06] border-white/20 shadow-[0_0_60px_-20px_rgba(255,255,255,0.15)]'
                  : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-black text-[11px] font-bold rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-1">{plan.name}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-white/40 text-sm">{plan.period}</span>}
                </div>
                <p className="text-sm text-white/40 mt-2">{plan.desc}</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleLogin}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                  plan.highlight
                    ? 'bg-white text-black hover:bg-white/90 active:scale-[0.98]'
                    : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
          Ready to build at the speed of thought?
        </h2>
        <p className="text-white/40 mb-10 text-lg">No setup. No credit card. Just describe your idea.</p>
        <button
          onClick={handleLogin}
          className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-white text-black font-bold text-base hover:bg-white/92 transition-all shadow-[0_0_60px_-10px_rgba(255,255,255,0.3)] hover:scale-[1.03] active:scale-[0.98]"
        >
          Start Building Free <ArrowRight size={18} />
        </button>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/30">
          <div className="flex items-center gap-2">
            <img src="/cursor_logo.png" alt="Logo" className="w-5 h-5 opacity-50" />
            <span className="font-semibold">Cursor Studio</span>
          </div>
          <p>© {new Date().getFullYear()} Cursor Studio. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/60 transition-colors">Blog</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
