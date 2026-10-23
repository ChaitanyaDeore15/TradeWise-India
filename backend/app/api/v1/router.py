from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, markets, academy, backtests, paper_trading, risk, ai_tutor, research
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(markets.router, prefix="/markets", tags=["Indian Market Intelligence"])
api_router.include_router(academy.router, prefix="/academy", tags=["Trading Academy"])
api_router.include_router(backtests.router, prefix="/backtests", tags=["Strategy Lab & Backtesting"])
api_router.include_router(paper_trading.router, prefix="/paper-trading", tags=["Paper Trading Simulator"])
api_router.include_router(risk.router, prefix="/risk", tags=["Risk Studio"])
api_router.include_router(ai_tutor.router, prefix="/ai-tutor", tags=["AI Finance Tutor"])
api_router.include_router(research.router, prefix="/research", tags=["Saved Research"])
