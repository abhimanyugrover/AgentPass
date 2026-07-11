"""
AgentPass — Pydantic request / response schemas.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ── Owner ────────────────────────────────────────────────────────────────────

class OwnerRegister(BaseModel):
    name: str
    email: str


class OwnerResponse(BaseModel):
    owner_id: str


# ── Agent ────────────────────────────────────────────────────────────────────

class AgentRegister(BaseModel):
    owner_id: str
    agent_name: str


class AgentResponse(BaseModel):
    agent_id: str


# ── Token ────────────────────────────────────────────────────────────────────

class TokenRequest(BaseModel):
    scopes: list[str]
    expiry_minutes: int = 30


class TokenResponse(BaseModel):
    token: str


# ── Trust ────────────────────────────────────────────────────────────────────

class TrustEventCreate(BaseModel):
    agent_id: str
    event_type: str
    weight: float = 1.0


class TrustScoreResponse(BaseModel):
    agent_id: str
    score: float
    event_count: int
    last_updated: Optional[datetime] = None


# ── Activity stream ─────────────────────────────────────────────────────────

class ActivityEntry(BaseModel):
    timestamp: datetime
    agent_id: str
    agent_name: str
    action: str
    result: str
    reason: str = ""
    trust_score: float = Field(default=0.0)
