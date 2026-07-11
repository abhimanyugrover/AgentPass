import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ─── HERO SECTION ─── */}
      <section className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-[#0a0a0f] to-violet-900/20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-indigo-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-8">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
              AI Agent Infrastructure
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              <span className="text-white">Identity & Trust</span>
              <br />
              <span className="gradient-text">for AI Agents</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Signed-credential infrastructure that gives every AI agent a
              <span className="text-white font-medium"> verifiable identity</span>,
              <span className="text-cyan-400 font-medium"> scoped permissions</span>, and a
              <span className="text-green-400 font-medium"> live trust score</span> — so
              services can decide what to allow in real time.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link
                href="/store"
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold hover:from-indigo-500 hover:to-violet-500 transition-all hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/25"
              >
                See the Live Demo →
              </Link>
              <Link
                href="/dashboard"
                className="px-8 py-3 rounded-xl glass-card text-gray-300 font-semibold hover:text-white hover:border-white/20 transition-all"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2006 vs 2026 COMPARISON ─── */}
      <section className="relative max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">The Web Has New Users</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            The old web wasn&apos;t designed for autonomous agents. We need a new trust layer.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {/* ── 2006: CAPTCHA ERA ── */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-gray-600" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            {/* Retro gray gradient header */}
            <div
              className="px-4 py-2 text-xs text-gray-800 flex items-center justify-between"
              style={{
                background: 'linear-gradient(180deg, #e8e8e8 0%, #c0c0c0 100%)',
                borderBottom: '2px solid #808080',
              }}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500 border border-red-700" />
                <div className="w-3 h-3 rounded-full bg-yellow-500 border border-yellow-700" />
                <div className="w-3 h-3 rounded-full bg-green-500 border border-green-700" />
              </div>
              <span style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '11px' }}>Internet Explorer 7</span>
            </div>

            <div className="bg-gray-200 p-6 min-h-[340px]">
              <div className="text-center mb-4">
                <span
                  className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                  style={{
                    background: 'linear-gradient(180deg, #f0f0f0, #d0d0d0)',
                    border: '2px outset #c0c0c0',
                    color: '#333',
                    fontFamily: 'Verdana, sans-serif',
                  }}
                >
                  🔒 Security Checkpoint
                </span>
              </div>

              <div
                className="mx-auto max-w-xs p-4 mb-4"
                style={{
                  background: '#f5f5f5',
                  border: '2px inset #999',
                }}
              >
                <p className="text-sm text-gray-700 mb-3 text-center" style={{ fontFamily: '"Times New Roman", serif' }}>
                  <b>Are you human?</b> Type the characters below:
                </p>
                <div
                  className="mx-auto w-48 h-14 flex items-center justify-center mb-3"
                  style={{
                    background: 'linear-gradient(135deg, #d4d4d4, #a0a0a0, #c0c0c0)',
                    border: '2px inset #888',
                    letterSpacing: '6px',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    fontFamily: 'Courier New, monospace',
                    color: '#2a2a2a',
                    textDecoration: 'line-through',
                    fontStyle: 'italic',
                    textShadow: '1px 1px 0px #666',
                  }}
                >
                  xK9mP2
                </div>
                <div
                  className="w-full h-8 mb-3"
                  style={{
                    background: '#fff',
                    border: '2px inset #999',
                  }}
                />
                <button
                  className="w-full py-1 text-sm font-bold"
                  style={{
                    background: 'linear-gradient(180deg, #f0f0f0, #d0d0d0)',
                    border: '2px outset #c0c0c0',
                    fontFamily: 'Tahoma, sans-serif',
                    color: '#333',
                    cursor: 'default',
                  }}
                >
                  Submit
                </button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500 italic" style={{ fontFamily: 'Verdana, sans-serif' }}>
                  &quot;Prove you&apos;re not a bot&quot;
                </p>
                <p className="text-[10px] text-gray-400 mt-1">Approach: block all automated access</p>
              </div>
            </div>

            <div className="absolute top-4 right-4 px-2 py-1 bg-gray-500 text-white text-xs font-bold rounded" style={{ fontFamily: 'Arial, sans-serif' }}>
              2006
            </div>
          </div>

          {/* ── 2026: AGENTPASS ERA ── */}
          <div className="relative rounded-2xl overflow-hidden glass-card animate-pulse-glow">
            <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-[9px] font-bold">AP</div>
                <span className="text-xs text-gray-400 font-medium">AgentPass Verified Request</span>
              </div>
              <span className="text-[10px] text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                Secure
              </span>
            </div>

            <div className="bg-[#0c0c14] p-6 min-h-[340px]">
              {/* Token verification flow */}
              <div className="space-y-3">
                {/* Step 1 */}
                <div className="flex items-start gap-3 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
                  <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-[10px] text-indigo-400 font-bold shrink-0 mt-0.5">1</div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 mb-1">Agent presents signed JWT</p>
                    <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                      <code className="text-[10px] text-cyan-400 font-mono break-all">
                        Bearer eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZ...
                      </code>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3 animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-[10px] text-blue-400 font-bold shrink-0 mt-0.5">2</div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 mb-1">Verify signature + check scopes</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 border border-green-400/20">✓ RS256 valid</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 border border-green-400/20">✓ purchase:max_500</span>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3 animate-slide-in-up" style={{ animationDelay: '0.5s' }}>
                  <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-[10px] text-violet-400 font-bold shrink-0 mt-0.5">3</div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 mb-1">Query live trust score</p>
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 flex items-center justify-center">
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 40 40">
                          <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" className="text-white/5" strokeWidth="2" />
                          <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" className="text-green-400" strokeWidth="2.5" strokeDasharray="100.5" strokeDashoffset="17.6" strokeLinecap="round" />
                        </svg>
                        <span className="text-xs font-bold text-green-400">82</span>
                      </div>
                      <span className="text-[10px] text-green-400">≥ 40 threshold — passed</span>
                    </div>
                  </div>
                </div>

                {/* Result */}
                <div className="mt-4 p-3 rounded-xl bg-green-400/5 border border-green-400/20 animate-slide-in-up" style={{ animationDelay: '0.7s' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✅</span>
                    <div>
                      <p className="text-sm font-semibold text-green-400">APPROVED</p>
                      <p className="text-[10px] text-gray-500">Agent identity verified · scopes valid · trust ≥ threshold</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-4 right-4 px-2 py-1 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-xs font-bold rounded-md shadow-lg shadow-indigo-500/25">
              2026
            </div>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-8 italic">
          The old web didn&apos;t have agents to design for. We do.
        </p>
      </section>

      {/* ─── PROBLEM STATEMENT ─── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="glass-card p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            The Problem: Agents Have No <span className="gradient-text">Identity Layer</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-red-400/5 border border-red-400/10">
              <span className="text-2xl mb-2 block">🎭</span>
              <h3 className="font-semibold text-white mb-1">No Identity</h3>
              <p className="text-sm text-gray-400">Agents use shared API keys with no proof of who sent the request or what they&apos;re authorized to do.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-400/5 border border-red-400/10">
              <span className="text-2xl mb-2 block">🔓</span>
              <h3 className="font-semibold text-white mb-1">All-or-Nothing Access</h3>
              <p className="text-sm text-gray-400">An agent that can read your calendar can also send emails. No fine-grained scopes or spending caps.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-400/5 border border-red-400/10">
              <span className="text-2xl mb-2 block">📉</span>
              <h3 className="font-semibold text-white mb-1">No Trust Tracking</h3>
              <p className="text-sm text-gray-400">If an agent misbehaves, there&apos;s no reputation system. Bad actors can&apos;t be detected or demoted.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SOLUTION ─── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
          The Solution: <span className="gradient-text">AgentPass</span>
        </h2>
        <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
          Three primitives that let any service verify, scope, and trust AI agents.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-card glow-border p-6 text-center hover:scale-[1.02] transition-transform">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🪪</span>
            </div>
            <h3 className="font-bold text-white mb-2">Signed Identity</h3>
            <p className="text-sm text-gray-400">RS256-signed JWTs with agent ID, owner ID, and verifiable claims. Any service can validate without calling the issuer.</p>
          </div>

          <div className="glass-card glow-border p-6 text-center hover:scale-[1.02] transition-transform">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="font-bold text-white mb-2">Scoped Permissions</h3>
            <p className="text-sm text-gray-400">Fine-grained scopes like <code className="text-cyan-400 text-xs">purchase:max_500</code> let owners cap what agents can do per-action.</p>
          </div>

          <div className="glass-card glow-border p-6 text-center hover:scale-[1.02] transition-transform">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-500/5 border border-violet-500/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-bold text-white mb-2">Live Trust Score</h3>
            <p className="text-sm text-gray-400">Behavior-driven trust scoring. Agents earn trust through good behavior and lose it through violations.</p>
          </div>
        </div>
      </section>

      {/* ─── ARCHITECTURE ─── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white mb-4 text-center">How It Works</h2>
        <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
          Three components, zero shared secrets between agent and service.
        </p>

        <div className="glass-card p-6 md:p-8 overflow-x-auto">
          <pre className="text-[11px] md:text-xs font-mono text-gray-300 leading-relaxed">
{`  ┌─────────────────────────────────────────────────────────────────────┐
  │                        AgentPass Flow                              │
  └─────────────────────────────────────────────────────────────────────┘

  ┌──────────────┐         ┌──────────────────┐        ┌──────────────┐
  │              │  1. Register + Get JWT      │        │              │
  │   AI Agent   │ ─────────────────────────▶  │  Issuer (FastAPI)  │  │
  │  (Client)    │ ◀─────────────────────────  │  ┌──────────────┐  │  │
  │              │    RS256 Signed Token        │  │ Trust Engine │  │  │
  └──────┬───────┘                             │  └──────────────┘  │  │
         │                                     │  ┌──────────────┐  │  │
         │  2. Bearer Token                    │  │ JWKS Endpoint│  │  │
         │     + Purchase Request              │  └──────────────┘  │  │
         ▼                                     └────────────────────┘  │
  ┌──────────────┐                                      ▲              │
  │  Storefront  │  3. Fetch JWKS ─────────────────────┘              │
  │  (Next.js)   │  4. Verify sig + scopes                            │
  │              │  5. GET /trust-score/{id} ──────────────────────────┘
  │  ┌────────┐  │  6. Allow / Deny
  │  │Checkout│  │
  │  │  API   │  │
  │  └────────┘  │
  └──────────────┘`}
          </pre>
        </div>
      </section>

      {/* ─── THREE-ACT DEMO ─── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white mb-4 text-center">The Three-Act Demo</h2>
        <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
          Watch all three security layers activate in sequence.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-card p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-500" />
            <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Act 1</span>
            <h3 className="text-lg font-bold text-white mt-2 mb-2">Happy Path ✅</h3>
            <p className="text-sm text-gray-400">
              Agent has valid token, <code className="text-cyan-400 text-xs">purchase:max_500</code> scope,
              trust score 82. Buys Earbuds ($79.99). <span className="text-green-400 font-semibold">Approved.</span>
            </p>
          </div>

          <div className="glass-card p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-red-500" />
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Act 2</span>
            <h3 className="text-lg font-bold text-white mt-2 mb-2">Scope Exceeded ❌</h3>
            <p className="text-sm text-gray-400">
              Same agent tries Gaming Laptop ($1,299.99) — exceeds $500 cap.
              <span className="text-red-400 font-semibold"> Denied: scope_exceeded.</span>
            </p>
          </div>

          <div className="glass-card p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-red-500" />
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Act 3</span>
            <h3 className="text-lg font-bold text-white mt-2 mb-2">Trust Collapse ❌</h3>
            <p className="text-sm text-gray-400">
              Negative events drop trust to 25. Even a cheap item is blocked.
              <span className="text-red-400 font-semibold"> Denied: low_trust.</span>
            </p>
          </div>
        </div>

        <div className="text-center mt-10">
          <Link
            href="/store"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold hover:from-indigo-500 hover:to-violet-500 transition-all hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/25"
          >
            Watch the Demo Live →
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-[8px] font-bold">AP</div>
            <span>AgentPass</span>
          </div>
          <span>Built for the Agentic Web</span>
        </div>
      </footer>
    </div>
  );
}
