import os

from dotenv import load_dotenv

from sqlalchemy import create_engine
from sqlalchemy.orm import (
    Session,
    declarative_base,
    sessionmaker,
)

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()


# ============================================================
# BASE
# ============================================================

Base = declarative_base()


# ============================================================
# DATABASE URL
# ============================================================

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not configured. "
        "Make sure backend/.env exists and contains DATABASE_URL."
    )


# ============================================================
# SYNCHRONOUS DATABASE
#
# Used by normal FastAPI routes such as auth.py.
# ============================================================

SYNC_DATABASE_URL = DATABASE_URL


# SQLite already uses sqlite:///...
# PostgreSQL can be:
# postgresql://...
# postgresql+psycopg2://...

if SYNC_DATABASE_URL.startswith("postgres://"):
    SYNC_DATABASE_URL = SYNC_DATABASE_URL.replace(
        "postgres://",
        "postgresql://",
        1,
    )


engine = create_engine(
    SYNC_DATABASE_URL,
    pool_pre_ping=True,
)


SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)


# ============================================================
# SYNCHRONOUS DB DEPENDENCY
#
# Used by:
#     db: Session = Depends(get_db)
# ============================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ============================================================
# ASYNCHRONOUS DATABASE
#
# Used by WebSocket / async code if needed.
# ============================================================

if DATABASE_URL.startswith("sqlite:///"):
    ASYNC_DATABASE_URL = DATABASE_URL.replace(
        "sqlite:///",
        "sqlite+aiosqlite:///",
        1,
    )

elif DATABASE_URL.startswith("postgresql+psycopg2://"):
    ASYNC_DATABASE_URL = DATABASE_URL.replace(
        "postgresql+psycopg2://",
        "postgresql+asyncpg://",
        1,
    )

elif DATABASE_URL.startswith("postgresql://"):
    ASYNC_DATABASE_URL = DATABASE_URL.replace(
        "postgresql://",
        "postgresql+asyncpg://",
        1,
    )

elif DATABASE_URL.startswith("postgres://"):
    ASYNC_DATABASE_URL = DATABASE_URL.replace(
        "postgres://",
        "postgresql+asyncpg://",
        1,
    )

else:
    ASYNC_DATABASE_URL = DATABASE_URL


async_engine = create_async_engine(
    ASYNC_DATABASE_URL,
    pool_pre_ping=True,
)


AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ============================================================
# ASYNC DB DEPENDENCY
# ============================================================

async def get_async_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()