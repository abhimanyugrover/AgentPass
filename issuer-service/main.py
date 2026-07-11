"""
AgentPass Issuer Service — FastAPI entry point.

Run with:
    uvicorn main:app --reload --port 8000
"""

import logging
import sys
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure the issuer-service directory is on sys.path so sibling modules
# resolve correctly regardless of CWD.
_SERVICE_DIR = str(Path(__file__).resolve().parent)
if _SERVICE_DIR not in sys.path:
    sys.path.insert(0, _SERVICE_DIR)

from database import init_db  # noqa: E402
from issuer_router import router as issuer_router  # noqa: E402
from trust_router import router as trust_router  # noqa: E402

logger = logging.getLogger("agentpass")
logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(message)s")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Startup / shutdown lifecycle."""
    init_db()
    logger.info("✅  AgentPass Issuer Service started — http://localhost:8000")
    logger.info("📄  Docs available at          http://localhost:8000/docs")
    yield
    logger.info("🛑  AgentPass Issuer Service shutting down")


app = FastAPI(
    title="AgentPass Issuer Service",
    description="AI agent identity, token issuance, and trust scoring infrastructure.",
    version="0.1.0",
    lifespan=lifespan,
)

# ── CORS (permissive for local dev) ──────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────────────
app.include_router(issuer_router)
app.include_router(trust_router)


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok", "service": "agentpass-issuer"}
