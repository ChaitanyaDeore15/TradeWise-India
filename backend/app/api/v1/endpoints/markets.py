from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from app.services.market_data.provider import market_data_provider
from app.schemas.schemas import InstrumentResponse, MarketBarResponse

router = APIRouter()

@router.get("/instruments", response_model=List[InstrumentResponse])
def get_instruments():
    """Retrieve supported Indian securities with freshness status and exchange tags."""
    return market_data_provider.get_instruments()

@router.get("/quote/{symbol}", response_model=InstrumentResponse)
def get_quote(symbol: str):
    """Retrieve quote for a specific Indian symbol."""
    quote = market_data_provider.get_quote(symbol)
    if not quote:
        raise HTTPException(status_code=404, detail=f"Instrument '{symbol}' not found.")
    return quote

@router.get("/bars/{symbol}", response_model=List[MarketBarResponse])
def get_bars(symbol: str, interval: str = "1d", limit: int = 120):
    """Retrieve historical OHLCV candle bars."""
    bars = market_data_provider.get_bars(symbol, interval=interval, limit=limit)
    return bars

@router.get("/market-overview")
def get_market_overview():
    """Returns aggregated Indian market breadth, top gainers, and benchmark metrics."""
    instruments = market_data_provider.get_instruments()
    gainers = sorted(instruments, key=lambda x: x["change_pct"], reverse=True)[:3]
    losers = sorted(instruments, key=lambda x: x["change_pct"])[:3]
    advances = sum(1 for i in instruments if i["change"] > 0)
    declines = sum(1 for i in instruments if i["change"] < 0)

    nifty = market_data_provider.get_quote("NIFTY50")
    bank_nifty = market_data_provider.get_quote("BANKNIFTY")

    return {
        "status": "HISTORICAL_SAMPLE_FEED",
        "market_session": "Regular (IST 09:15 - 15:30)",
        "settlement_cycle": "T+1 Rolling",
        "benchmarks": {
            "nifty50": nifty,
            "banknifty": bank_nifty
        },
        "breadth": {
            "advances": advances,
            "declines": declines,
            "ratio": round(advances / max(1, declines), 2)
        },
        "top_gainers": gainers,
        "top_losers": losers,
        "disclaimer": "Market metrics are simulated and historical for education. Not real-time exchange data."
    }
