"""
AgentPass — SQLite database setup with SQLAlchemy.
"""

from pathlib import Path
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

_DB_PATH: Path = Path(__file__).resolve().parent / "agents.db"
_DATABASE_URL: str = f"sqlite:///{_DB_PATH}"

engine = create_engine(
    _DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False,
)

SessionLocal: sessionmaker[Session] = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""
    pass


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a DB session and closes it after use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create all tables that don't already exist."""
    # Import models so they are registered on Base.metadata before create_all.
    import models as _models  # noqa: F401

    Base.metadata.create_all(bind=engine)
