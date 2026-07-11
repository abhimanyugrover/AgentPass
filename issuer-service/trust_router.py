"""
AgentPass — Trust-score and activity-stream endpoints.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Agent, TrustEvent
from schemas import ActivityEntry, TrustEventCreate, TrustScoreResponse
from verification import get_trust_score

router = APIRouter()

# ── In-memory activity log (FIFO, max 100 entries) ──────────────────────────

_MAX_ACTIVITY_LOG: int = 100
activity_log: list[dict[str, Any]] = []


def _append_activity(entry: dict[str, Any]) -> None:
    """Append an entry and evict the oldest if the log is full."""
    activity_log.append(entry)
    if len(activity_log) > _MAX_ACTIVITY_LOG:
        del activity_log[: len(activity_log) - _MAX_ACTIVITY_LOG]


# ── Trust events ─────────────────────────────────────────────────────────────

_VALID_EVENT_TYPES = {
    "good_transaction",
    "scope_violation",
    "spam_flag",
    "chargeback",
}


@router.post("/events", status_code=201)
def create_trust_event(
    body: TrustEventCreate,
    db: Session = Depends(get_db),
) -> dict:
    """Record a trust event and mirror it to the activity stream."""
    if body.event_type not in _VALID_EVENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid event_type. Must be one of {sorted(_VALID_EVENT_TYPES)}",
        )

    agent = db.query(Agent).filter(Agent.id == body.agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    event = TrustEvent(
        agent_id=body.agent_id,
        event_type=body.event_type,
        weight=body.weight,
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    # Compute updated trust score
    score = get_trust_score(body.agent_id, db)

    # Mirror to activity log
    _append_activity(
        {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "agent_id": body.agent_id,
            "agent_name": agent.agent_name,
            "action": body.event_type,
            "result": "recorded",
            "reason": f"weight={body.weight}",
            "trust_score": round(score, 2),
        }
    )

    return {"id": event.id, "trust_score": round(score, 2)}


# ── Trust score query ────────────────────────────────────────────────────────

@router.get("/trust-score/{agent_id}", response_model=TrustScoreResponse)
def trust_score(agent_id: str, db: Session = Depends(get_db)) -> TrustScoreResponse:
    """Return the current trust score for an agent."""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    score = get_trust_score(agent_id, db)

    # Count events and find the latest timestamp
    events = (
        db.query(TrustEvent)
        .filter(TrustEvent.agent_id == agent_id)
        .order_by(TrustEvent.created_at.desc())
        .all()
    )

    last_updated = events[0].created_at if events else None

    return TrustScoreResponse(
        agent_id=agent_id,
        score=round(score, 2),
        event_count=len(events),
        last_updated=last_updated,
    )


# ── Activity stream ─────────────────────────────────────────────────────────

@router.get("/activity-stream")
def get_activity_stream() -> list[dict[str, Any]]:
    """Return the last 50 activity entries (most recent first)."""
    return list(reversed(activity_log[-50:]))


@router.post("/activity", status_code=201)
def post_activity(entry: ActivityEntry) -> dict:
    """Accept an activity entry from external services (e.g. storefront)."""
    _append_activity(entry.model_dump(mode="json"))
    return {"status": "recorded"}
