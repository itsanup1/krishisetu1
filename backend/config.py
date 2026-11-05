from typing import List
import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Automatically locate and load .env file from root or backend directory
root_env = Path(__file__).resolve().parent.parent / ".env"
backend_env = Path(__file__).resolve().parent / ".env"
if root_env.exists():
    load_dotenv(root_env)
elif backend_env.exists():
    load_dotenv(backend_env)

class Settings(BaseSettings):
    PROJECT_NAME: str = "Krishisetu - Smart Agricultural Marketplace & Equipment Rental"
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres.iogtwvmfqmlwthyarjps:anup%40patil1@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres?sslmode=require"
    )
    SECRET_KEY: str = os.getenv("SECRET_KEY", "btech_krishisetu_super_secret_jwt_key_2026_safe")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24 * 7)))  # 7 days
    
    # CORS Allowed Origins (comma-separated in env or "*" for local dev)
    ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173,*")

    # Razorpay Test Credentials
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "rzp_test_KRISHISETU12345")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "test_secret_krishisetu98765")
    
    # FCFS Rental Window Rules
    BOOKING_CONFIRMATION_HOURS: int = int(os.getenv("BOOKING_CONFIRMATION_HOURS", "24"))

    @property
    def sqlalchemy_database_url(self) -> str:
        url = self.DATABASE_URL
        if url and url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql://", 1)
        return url

    @property
    def cors_origins(self) -> List[str]:
        origins = [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]
        return origins if origins else ["*"]

    class Config:
        case_sensitive = True

        extra = "ignore"

settings = Settings()

