"""
database.py — Configuração do banco de dados

Usa SQLAlchemy async com PostgreSQL (Supabase ou local).
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite+aiosqlite:///./diario_inteligente.db"  # SQLite para desenvolvimento local
)

# Converte prefixo do PostgreSQL para o driver assíncrono asyncpg
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://") and not DATABASE_URL.startswith("postgresql+asyncpg://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Motor assíncrono
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
)

# Sessão assíncrona
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ─────────────────────────────────────────────────────────────
# BASE
# ─────────────────────────────────────────────────────────────

class Base(DeclarativeBase):
    pass


# ─────────────────────────────────────────────────────────────
# ENUMS
# ─────────────────────────────────────────────────────────────

class CompetitionStatus(str, enum.Enum):
    waiting_result = "waiting_result"
    classified_waiting = "classified_waiting"
    summoned = "summoned"
    taking_office = "taking_office"
    eliminated = "eliminated"
    closed = "closed"


class KeywordPriority(str, enum.Enum):
    high = "high"
    medium = "medium"
    low = "low"


class KeywordCategory(str, enum.Enum):
    positive = "positive"
    negative = "negative"
    neutral = "neutral"


class ExtractionMethod(str, enum.Enum):
    html = "html"
    pdf_native = "pdf_native"
    pdf_ocr = "pdf_ocr"


# ─────────────────────────────────────────────────────────────
# MODELOS
# ─────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    onboarding_done = Column(Boolean, default=False)
    telegram_bot_token = Column(String, nullable=True)
    telegram_chat_id = Column(String, nullable=True)
    telegram_notifications = Column(Boolean, default=False)
    email_notifications = Column(Boolean, default=False)
    search_time = Column(String, default="06:00")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class NameVariation(Base):
    __tablename__ = "name_variations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    variation = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_auto_generated = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Competition(Base):
    __tablename__ = "competitions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    organ_name = Column(String, nullable=False)
    position = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    status = Column(String, default="waiting_result")
    registration_number = Column(String, nullable=True)
    organizing_body = Column(String, nullable=True)
    edital_url = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Keyword(Base):
    __tablename__ = "keywords"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    word = Column(String, nullable=False)
    priority = Column(String, default="medium")
    category = Column(String, default="positive")
    is_active = Column(Boolean, default=True)
    is_system_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SearchRecord(Base):
    __tablename__ = "search_records"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    journal = Column(String, nullable=False)          # "DOU" ou "DOBA"
    edition_date = Column(DateTime, nullable=False)
    source_url = Column(String, nullable=True)
    extraction_method = Column(String, nullable=True)
    pages_searched = Column(Integer, default=0)
    total_chars = Column(Integer, default=0)
    matches_found = Column(Integer, default=0)
    duration_seconds = Column(Float, nullable=True)
    success = Column(Boolean, default=True)
    error_message = Column(Text, nullable=True)
    triggered_by = Column(String, default="scheduler")  # "scheduler" ou "manual"
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SearchMatch(Base):
    __tablename__ = "search_matches"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    search_id = Column(String, ForeignKey("search_records.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    variation_found = Column(String, nullable=False)
    page_number = Column(Integer, nullable=True)
    context_text = Column(Text, nullable=False)
    keywords_nearby = Column(Text, nullable=True)   # JSON string
    relevance_score = Column(Float, default=1.0)
    ai_summary = Column(Text, nullable=True)
    is_reviewed = Column(Boolean, default=False)
    notification_sent = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ─────────────────────────────────────────────────────────────
# DEPENDENCY — injeção de sessão nas rotas
# ─────────────────────────────────────────────────────────────

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# ─────────────────────────────────────────────────────────────
# CRIAR TABELAS (desenvolvimento)
# ─────────────────────────────────────────────────────────────

async def create_tables():
    """Cria todas as tabelas. Use apenas em desenvolvimento."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tabelas criadas com sucesso.")
