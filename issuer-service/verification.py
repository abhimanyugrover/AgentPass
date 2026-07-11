"""
AgentPass — Token verification and trust-score computation.

This module is designed to be importable by any service that needs to verify
Agent Identity Tokens offline (only the public key is required).
"""

from __future__ import annotations

import jwt
from sqlalchemy.orm import Session

from crypto import get_public_key_pem
from models import TrustEvent


# ── Custom exceptions ────────────────────────────────────────────────────────

class VerificationError(Exception):
    """Base class for all token verification errors."""


class InvalidSignature(VerificationError):
    """The token signature does not match the public key."""


class ExpiredToken(VerificationError):
    """The token has passed its ``exp`` claim."""


class MalformedToken(VerificationError):
    """The token could not be decoded at all."""


# ── Token verification ───────────────────────────────────────────────────────

def verify_token(bearer_token: str) -> dict:
    """Decode and validate a JWT signed by the AgentPass issuer.

    Parameters
    ----------
    bearer_token:
        The raw JWT string, optionally prefixed with ``Bearer ``.

    Returns
    -------
    dict
        The decoded claims payload.

    Raises
    ------
    InvalidSignature
        If the RS256 signature check fails.
    ExpiredToken
        If the ``exp`` claim is in the past.
    MalformedToken
        If the token cannot be parsed at all.
    """
    token = bearer_token.removeprefix("Bearer ").strip()

    try:
        claims: dict = jwt.decode(
            token,
            get_public_key_pem(),
            algorithms=["RS256"],
            options={"require": ["exp", "sub"]},
        )
        return claims

    except jwt.ExpiredSignatureError as exc:
        raise ExpiredToken("Token has expired") from exc
    except jwt.InvalidSignatureError as exc:
        raise InvalidSignature("Token signature is invalid") from exc
    except jwt.PyJWTError as exc:
        raise MalformedToken(f"Token could not be decoded: {exc}") from exc


# ── Scope checking ───────────────────────────────────────────────────────────

_VALID_EVENT_TYPES = {
    "good_transaction",
    "scope_violation",
    "spam_flag",
    "chargeback",
}


def check_scope(
    claims: dict,
    required_scope: str,
    amount: float | None = None,
) -> bool:
    """Return ``True`` if the token's scopes satisfy *required_scope*.

    Supports limit notation — if the token contains a scope like
    ``purchase:max_500`` and the caller passes ``required_scope='purchase'``
    with ``amount=300``, the check passes because 300 ≤ 500.
    """
    scopes: list[str] = claims.get("scopes", [])

    for scope in scopes:
        # Exact match (e.g. "read" == "read")
        if scope == required_scope:
            return True

        # Limit match (e.g. "purchase:max_500")
        if scope.startswith(f"{required_scope}:max_"):
            try:
                limit = float(scope.split(":max_")[1])
            except (IndexError, ValueError):
                continue
            if amount is not None and amount <= limit:
                return True
            elif amount is None:
                # No amount supplied — scope exists, so grant access
                return True

    return False


# ── Trust score ──────────────────────────────────────────────────────────────

_SCORE_DELTAS: dict[str, float] = {
    "good_transaction": 2.0,
    "scope_violation": -25.0,
    "spam_flag": -15.0,
    "chargeback": -40.0,
}


def get_trust_score(agent_id: str, db: Session) -> float:
    """Compute the current trust score for *agent_id* (range 0–100).

    Starts at 70 and applies weighted deltas for every recorded
    :class:`TrustEvent`.
    """
    events = (
        db.query(TrustEvent)
        .filter(TrustEvent.agent_id == agent_id)
        .order_by(TrustEvent.created_at.asc())
        .all()
    )

    score: float = 70.0
    for event in events:
        delta = _SCORE_DELTAS.get(event.event_type, 0.0)
        score += delta * event.weight

    return max(0.0, min(100.0, score))
