import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.config import settings

DATABASE_URL = settings.DATABASE_URL
if DATABASE_URL:
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
    elif DATABASE_URL.startswith("postgresql://") and "+psycopg2" not in DATABASE_URL:
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

# Exclusively connect to Supabase PostgreSQL - zero SQLite usage
if not DATABASE_URL or not (DATABASE_URL.startswith("postgresql") or DATABASE_URL.startswith("postgres")):
    raise RuntimeError(
        "DATABASE_URL is not configured for PostgreSQL! Please check your .env file and set DATABASE_URL to your Supabase PostgreSQL connection string."
    )

try:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        connect_args={"connect_timeout": 10}
    )
    # Test connection immediately
    with engine.connect() as conn:
        pass
    print(f"[Krishisetu DB] Connected to PostgreSQL / Supabase successfully!")
except Exception as e:
    raise RuntimeError(f"[Krishisetu DB] Failed to connect to Supabase PostgreSQL: {e}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

