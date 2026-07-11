#!/bin/bash
# ============================================================================
# AgentPass — One-Command Setup
# ============================================================================
set -e

echo "╔══════════════════════════════════════════════════╗"
echo "║          AgentPass Setup                         ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ── Python Backend ───────────────────────────────────────────────────────────
echo "📦 Setting up Python backend..."
cd "$SCRIPT_DIR/issuer-service"

if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt --quiet
echo "✅ Backend dependencies installed"

# ── Demo Agent ───────────────────────────────────────────────────────────────
echo "📦 Setting up demo agent..."
cd "$SCRIPT_DIR/demo-agent"
pip install -r requirements.txt --quiet
echo "✅ Demo agent dependencies installed"

# ── Node.js Frontend ────────────────────────────────────────────────────────
echo "📦 Setting up Next.js storefront..."
cd "$SCRIPT_DIR/storefront"
npm install --silent
echo "✅ Storefront dependencies installed"

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  ✅ Setup complete!                              ║"
echo "║                                                  ║"
echo "║  Optional: set LLM_API_KEY env var for AI        ║"
echo "║  narration in the demo agent.                    ║"
echo "║                                                  ║"
echo "║  Run:  ./run_demo.sh                             ║"
echo "╚══════════════════════════════════════════════════╝"
