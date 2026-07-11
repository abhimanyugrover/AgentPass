# 🛡️ AgentPass — Identity & Trust Infrastructure for AI Agents

> *AI agents are the new users of the internet. AgentPass is the infrastructure that lets them prove who they are, what they're allowed to do, and whether they should be trusted.*

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green.svg)]()
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)]()
[![JWT](https://img.shields.io/badge/JWT-RS256-orange.svg)]()

---

## 🎯 What Is This?

AgentPass is a **signed-credential system** — new protocol-level infrastructure, not a wrapper around an existing API. It solves three problems at once:

1. **Identity** — Who does this AI agent belong to?
2. **Scoped Permissions** — What is it allowed to do? (e.g., "purchase up to $500")
3. **Live Trust Scoring** — Should we trust it right now? (reputation that updates in real-time)

No existing standard combines scoped permissions with live trust scoring for AI agents. OAuth gives you identity but not trust. API keys give you access but not scoped enforcement. AgentPass does both.

---

## 🏗️ Architecture

```
┌──────────────────┐     ┌──────────────────────────────────────────┐
│  Demo AI Agent   │     │          Next.js Storefront               │
│  (Python script) │     │  ┌─────────┐ ┌──────────┐ ┌───────────┐ │
│                  │────▶│  │ Catalog  │ │Dashboard │ │  Landing  │ │
│  3-Act Scenario  │     │  │  Page    │ │  Page    │ │   Page    │ │
│  + LLM narration │     │  └────┬────┘ └──────────┘ └───────────┘ │
└───────┬──────────┘     │       │                                  │
        │                │  /api/checkout ──▶ verify token (jose)   │
        │                │       │            check scope            │
        │                │       │            check trust score      │
        │                │       ▼                                   │
        │                │  /api/activity ──▶ polling (1.5s)         │
        │                └──────────────────────────────────────────┘
        │                              │
        ▼                              ▼
┌──────────────────────────────────────────────────────┐
│        FastAPI Issuer Service (port 8000)              │
│  ┌──────────────┐  ┌─────────────────────────────┐   │
│  │ Issuer Router │  │ Trust & Reputation Engine   │   │
│  │               │  │                             │   │
│  │ POST /owners  │  │ POST /events                │   │
│  │ POST /agents  │  │ GET /trust-score/{id}       │   │
│  │ POST /issue   │  │ GET /activity-stream        │   │
│  │ GET /jwks     │  │                             │   │
│  └──────────────┘  │ Score: 0-100 (start: 70)    │   │
│                     │ Threshold: <40 = DENY       │   │
│  RS256 Key Pair     └─────────────────────────────┘   │
│  SQLite Database                                       │
└──────────────────────────────────────────────────────┘
```

### Agent Identity Token (AIT) — JWT Claims

```json
{
  "sub": "<agent_id>",
  "owner_id": "<owner_id>",
  "agent_name": "ShopBot-v1",
  "scopes": ["browse", "purchase:max_500"],
  "iat": 1720000000,
  "exp": 1720001800
}
```

### Trust Scoring Formula

| Event Type        | Score Delta |
|-------------------|-------------|
| `good_transaction` | +2          |
| `scope_violation`  | -25         |
| `spam_flag`        | -15         |
| `chargeback`       | -40         |

- New agents start at **70/100**
- Score is clamped to **0–100**
- Any agent below **40** is denied regardless of token validity

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- (Optional) `LLM_API_KEY` env var for AI narration (Google Gemini or Anthropic Claude)

### Setup (one command)

**Windows (PowerShell):**
```powershell
.\setup.ps1
```

**Linux/Mac:**
```bash
chmod +x setup.sh run_demo.sh
./setup.sh
```

### Run the Demo (one command)

**Windows:**
```powershell
.\run_demo.ps1
```

**Linux/Mac:**
```bash
./run_demo.sh
```

### Manual Start (if you prefer)

```bash
# Terminal 1: Backend
cd issuer-service
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac
pip install -r requirements.txt
python -m uvicorn main:app --port 8000 --reload

# Terminal 2: Frontend
cd storefront
npm install
npm run dev

# Terminal 3: Demo Agent
cd demo-agent
pip install -r requirements.txt
python demo_agent.py
```

Then open:
- **Landing Page:** http://localhost:3000
- **Store + Activity Log:** http://localhost:3000/store
- **Dashboard:** http://localhost:3000/dashboard
- **API Docs:** http://localhost:8000/docs

---

## 🎬 The 3-Act Demo

The demo agent runs a scripted scenario that showcases all three enforcement layers:

| Act | What Happens | Result | Enforcement |
|-----|-------------|--------|-------------|
| **1** | Agent buys earbuds ($79.99) — valid token, in-budget, good trust | ✅ **ALLOW** | Token ✓ Scope ✓ Trust ✓ |
| **2** | Agent tries to buy a laptop ($1,299.99) — over $500 cap | ❌ **DENY** | `scope_exceeded` |
| **3** | After trust violations, agent retries a cheap item ($45.99) | ❌ **DENY** | `low_trust` (score < 40) |

**Act 3 is the key insight:** The system catches bad actors *even when their token is technically valid*. This is trust infrastructure, not just auth.

---

## 📁 Project Structure

```
agentpass/
├── issuer-service/          # FastAPI backend
│   ├── main.py              # App entry point
│   ├── issuer_router.py     # Registration + token issuance
│   ├── trust_router.py      # Trust events + scoring + activity
│   ├── crypto.py            # RS256 key management + JWT signing
│   ├── verification.py      # Token verification + scope checking
│   ├── models.py            # SQLAlchemy ORM models
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── database.py          # SQLite setup
│   └── requirements.txt
├── storefront/              # Next.js 14 frontend
│   ├── app/
│   │   ├── page.tsx         # Landing page ("2006 vs 2026")
│   │   ├── store/page.tsx   # Product catalog + Activity Log
│   │   ├── dashboard/page.tsx # Issuer dashboard
│   │   ├── api/
│   │   │   ├── checkout/route.ts   # Checkout enforcement
│   │   │   ├── activity/route.ts   # Activity stream proxy
│   │   │   ├── products/route.ts   # Product catalog
│   │   │   └── agents/route.ts     # Agent list for dashboard
│   │   ├── components/
│   │   │   ├── ActivityLog.tsx      # Real-time activity feed
│   │   │   ├── ProductCard.tsx      # Product display card
│   │   │   └── TrustBadge.tsx       # Circular trust gauge
│   │   └── lib/
│   │       ├── verify.ts    # Token verification (jose)
│   │       └── products.ts  # Product data
│   └── package.json
├── demo-agent/
│   ├── demo_agent.py        # 3-act demo with LLM narration
│   └── requirements.txt
├── setup.ps1 / setup.sh     # One-command setup
├── run_demo.ps1 / run_demo.sh # One-command demo
└── README.md
```

---

## 🏆 Judging Criteria

| Criterion | How AgentPass Addresses It |
|-----------|--------------------------|
| **Creativity & Originality** | New protocol-level infrastructure — no existing standard combines scoped permissions + live trust scoring for AI agents |
| **UI/UX Authenticity** | "2006 vs 2026" homage panel — a creative bridge between retro internet and agent-native infrastructure |
| **Functionality & Usability** | Full end-to-end demo runs with one command. Three enforcement layers demonstrated live. |
| **Technical Execution** | Typed Python + TypeScript, RS256 JWT with JWKS, SQLAlchemy ORM, proper error handling, clean separation of concerns |
| **Presentation & Demo** | Live Activity Log is the visual centerpiece — ALLOW, then DENY (scope), then DENY (trust), narrated in real-time |
| **AI Integration** | Demo agent decisions and narration are generated by a real LLM call (Gemini/Claude), not hardcoded strings |

---

## 🎤 60-Second Pitch Script

> *"AI agents are about to become the new users of the internet — browsing, buying, negotiating — but there's no infrastructure built for them to do it safely.*
>
> *AgentPass fixes this. It's a signed-credential system with three layers:*
>
> *First, **identity** — every agent gets an RS256-signed token that proves who it belongs to.*
>
> *Second, **scoped permissions** — the token itself encodes what the agent can do. 'Purchase up to $500.' It's enforced at the protocol level, not by the app.*
>
> *Third — and this is what makes it trust infrastructure, not just auth — a **live reputation score**. Every transaction updates it. Drop below 40? You're denied, period. Even if your token is technically valid.*
>
> *Watch the demo: our AI agent buys something — allowed. Tries to exceed its budget — denied by scope. Gets flagged — and now even a perfectly valid, in-budget purchase is blocked. Three enforcement layers, all working together.*
>
> *This is the infrastructure the agent-native internet needs. We built it in a weekend."*

---

## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_API_KEY` | *(none)* | API key for LLM narration (Gemini or Claude) |
| `LLM_PROVIDER` | `gemini` | LLM provider: `gemini` or `anthropic` |
| `ISSUER_URL` | `http://localhost:8000` | Backend service URL |
| `STORE_URL` | `http://localhost:3000` | Storefront URL |

---

## 📜 License

Built for a hackathon. MIT License.
