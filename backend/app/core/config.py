import os
from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel

# Automatically load .env if present
env_file = Path(__file__).resolve().parent.parent.parent / ".env"
if env_file.exists():
    with open(env_file, "r") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

class Settings(BaseModel):
    PROJECT_NAME: str = "TradeWise India"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "tradewise_super_secure_institutional_secret_key_change_in_prod_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days for educational session ease
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./tradewise.db")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Regulatory & Disclaimer
    DISCLAIMER_TEXT: str = (
        "TradeWise India is an educational and analytical platform. "
        "We are NOT a SEBI registered investment adviser (RIA) or research analyst (RA). "
        "All strategies, backtests, paper trades, and market insights are for educational purposes only. "
        "Trading financial securities involves substantial risk of loss."
    )
    
    # Angel One SmartAPI Live Credentials
    ANGEL_API_KEY: Optional[str] = os.getenv("ANGEL_API_KEY")
    ANGEL_CLIENT_CODE: Optional[str] = os.getenv("ANGEL_CLIENT_CODE")
    ANGEL_MPIN: Optional[str] = os.getenv("ANGEL_MPIN")
    ANGEL_TOTP_SECRET: Optional[str] = os.getenv("ANGEL_TOTP_SECRET")

    # Provider Mode
    MARKET_DATA_MODE: str = os.getenv("MARKET_DATA_MODE", "sample_verified")

settings = Settings()
