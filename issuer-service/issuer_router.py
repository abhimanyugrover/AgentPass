"""
AgentPass — Issuer endpoints (owner/agent registration, token issuance, JWKS).
"""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from crypto import get_public_key_jwk, sign_token
from database import get_db
from models import Agent, Owner
from schemas import (
    AgentRegister,
    AgentResponse,
    OwnerRegister,
    OwnerResponse,
    TokenRequest,
    TokenResponse,
)

router = APIRouter()


# ── Owner registration ───────────────────────────────────────────────────────

@router.post("/owners/register", response_model=OwnerResponse)
def register_owner(body: OwnerRegister, db: Session = Depends(get_db)) -> OwnerResponse:
    """Register a new human/org owner."""
    existing = db.query(Owner).filter(Owner.email == body.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Owner with this email already exists")

    owner = Owner(name=body.name, email=body.email)
    db.add(owner)
    db.commit()
    db.refresh(owner)
    return OwnerResponse(owner_id=owner.id)


# ── Agent registration ───────────────────────────────────────────────────────

@router.post("/agents/register", response_model=AgentResponse)
def register_agent(body: AgentRegister, db: Session = Depends(get_db)) -> AgentResponse:
    """Register an AI agent under an existing owner."""
    owner = db.query(Owner).filter(Owner.id == body.owner_id).first()
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")

    agent = Agent(owner_id=body.owner_id, agent_name=body.agent_name)
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return AgentResponse(agent_id=agent.id)


# ── Token issuance ───────────────────────────────────────────────────────────

@router.post("/agents/{agent_id}/issue-token", response_model=TokenResponse)
def issue_token(
    agent_id: str,
    body: TokenRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Issue a signed Agent Identity Token (AIT) for *agent_id*."""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    if agent.owner_id != body.owner_id:
        raise HTTPException(status_code=403, detail="Owner unauthorized for this agent")

    now = datetime.now(timezone.utc)
    claims: dict = {
        "sub": agent.id,
        "owner_id": agent.owner_id,
        "agent_name": agent.agent_name,
        "scopes": body.scopes,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=body.expiry_minutes)).timestamp()),
    }

    token = sign_token(claims)
    return TokenResponse(token=token)


# ── JWKS endpoint ────────────────────────────────────────────────────────────

@router.get("/.well-known/jwks.json")
def jwks() -> dict:
    """Public JSON Web Key Set so third-party services can verify AITs."""
    return {"keys": [get_public_key_jwk()]}
