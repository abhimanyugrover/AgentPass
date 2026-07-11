"""
AgentPass — Issuer endpoints (owner/agent registration, token issuance, JWKS).
"""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from crypto import get_public_key_jwk, sign_token
from database import get_db
from models import Agent, Owner, IssuedPass
from schemas import (
    AgentRegister,
    AgentResponse,
    OwnerRegister,
    OwnerResponse,
    TokenRequest,
    TokenResponse,
    OwnerListEntry,
    AgentListEntry,
    IssuedPassEntry,
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
    expiry_dt = now + timedelta(minutes=body.expiry_minutes)
    claims: dict = {
        "sub": agent.id,
        "owner_id": agent.owner_id,
        "agent_name": agent.agent_name,
        "scopes": body.scopes,
        "iat": int(now.timestamp()),
        "exp": int(expiry_dt.timestamp()),
    }

    token = sign_token(claims)

    # Save Issued Pass to DB
    issued_pass = IssuedPass(
        agent_id=agent.id,
        token=token,
        scopes=",".join(body.scopes),
        expiry=expiry_dt,
    )
    db.add(issued_pass)
    db.commit()

    return TokenResponse(token=token)


# ── Query endpoints ──────────────────────────────────────────────────────────

@router.get("/owners", response_model=list[OwnerListEntry])
def list_owners(db: Session = Depends(get_db)):
    """List all registered owners."""
    return db.query(Owner).all()


@router.get("/agents", response_model=list[AgentListEntry])
def list_agents(db: Session = Depends(get_db)):
    """List all registered agents."""
    return db.query(Agent).all()


@router.get("/passes", response_model=list[IssuedPassEntry])
def list_passes(db: Session = Depends(get_db)):
    """List all previously issued passes."""
    results = db.query(
        IssuedPass.id,
        IssuedPass.agent_id,
        Agent.agent_name,
        IssuedPass.token,
        IssuedPass.scopes,
        IssuedPass.expiry,
        IssuedPass.created_at
    ).join(Agent, IssuedPass.agent_id == Agent.id).order_by(IssuedPass.created_at.desc()).all()
    
    return [
        IssuedPassEntry(
            id=r.id,
            agent_id=r.agent_id,
            agent_name=r.agent_name,
            token=r.token,
            scopes=r.scopes,
            expiry=r.expiry,
            created_at=r.created_at
        ) for r in results
    ]


# ── JWKS endpoint ────────────────────────────────────────────────────────────

@router.get("/.well-known/jwks.json")
def jwks() -> dict:
    """Public JSON Web Key Set so third-party services can verify AITs."""
    return {"keys": [get_public_key_jwk()]}
