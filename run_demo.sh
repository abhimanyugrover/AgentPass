#!/bin/bash
# ============================================================================
# AgentPass — Run Demo (starts all services + runs the 3-act agent demo)
# ============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "  🚀 Starting AgentPass Demo..."
echo ""

# ── Start Backend ────────────────────────────────────────────────────────────
echo "  🔧 Starting FastAPI issuer service on port 8000..."
cd "$SCRIPT_DIR/issuer-service"
source venv/bin/activate

# Kill any existing instance
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

python -m uvicorn main:app --port 8000 --log-level warning &
BACKEND_PID=$!
echo "  ✅ Backend PID: $BACKEND_PID"

# ── Start Frontend ───────────────────────────────────────────────────────────
echo "  🎨 Starting Next.js storefront on port 3000..."
cd "$SCRIPT_DIR/storefront"

# Kill any existing instance
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

npm run dev -- -p 3000 &
FRONTEND_PID=$!
echo "  ✅ Frontend PID: $FRONTEND_PID"

# ── Wait for services ───────────────────────────────────────────────────────
echo "  ⏳ Waiting for services to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        break
    fi
    sleep 1
done
echo "  ✅ Backend ready"

for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        break
    fi
    sleep 1
done
echo "  ✅ Frontend ready"

echo ""
echo "  🌐 Open http://localhost:3000 to see the storefront"
echo "  🌐 Open http://localhost:3000/store to see the activity log"
echo ""

# ── Run Demo Agent ───────────────────────────────────────────────────────────
echo "  🤖 Running 3-act demo agent..."
echo ""
sleep 2
cd "$SCRIPT_DIR/demo-agent"
python demo_agent.py

# ── Cleanup ──────────────────────────────────────────────────────────────────
echo ""
echo "  Press Ctrl+C to stop all services..."
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT
wait
