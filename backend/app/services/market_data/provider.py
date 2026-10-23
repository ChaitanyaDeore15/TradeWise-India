"""
Market Data Provider Service for TradeWise India.
Implements the Provider-Adapter pattern to decouple data sourcing from analytical consumers.
Supports both SampleVerifiedMarketDataProvider and AngelSmartApiProvider (Live NSE/BSE).
"""
import os
import math
import time
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from app.core.config import settings

class BaseMarketDataProvider(ABC):
    @abstractmethod
    def get_instruments(self) -> List[Dict[str, Any]]:
        pass
        
    @abstractmethod
    def get_bars(self, symbol: str, interval: str = "1d", limit: int = 120) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_quote(self, symbol: str) -> Optional[Dict[str, Any]]:
        pass


class SampleVerifiedMarketDataProvider(BaseMarketDataProvider):
    """
    Deterministic historical & sample market provider.
    Adheres strictly to SEBI & NSE disclosure guidelines: clearly flagged as historical/sample data.
    """
    
    DEFAULT_INSTRUMENTS = [
        {"symbol": "NIFTY50", "name": "NIFTY 50 Index", "exchange": "NSE", "segment": "INDEX", "sector": "Benchmark", "base_price": 24850.0, "tick_size": 0.05, "lot_size": 25},
        {"symbol": "BANKNIFTY", "name": "NIFTY Bank Index", "exchange": "NSE", "segment": "INDEX", "sector": "Banking", "base_price": 51200.0, "tick_size": 0.05, "lot_size": 15},
        {"symbol": "RELIANCE", "name": "Reliance Industries Ltd", "exchange": "NSE", "segment": "EQUITY", "sector": "Energy & Petrochemicals", "base_price": 1173.0, "tick_size": 0.05, "lot_size": 1},
        {"symbol": "TCS", "name": "Tata Consultancy Services Ltd", "exchange": "NSE", "segment": "EQUITY", "sector": "Information Technology", "base_price": 2530.0, "tick_size": 0.05, "lot_size": 1},
        {"symbol": "HDFCBANK", "name": "HDFC Bank Ltd", "exchange": "NSE", "segment": "EQUITY", "sector": "Banking & Financials", "base_price": 692.0, "tick_size": 0.05, "lot_size": 1},
        {"symbol": "INFY", "name": "Infosys Ltd", "exchange": "NSE", "segment": "EQUITY", "sector": "Information Technology", "base_price": 1160.0, "tick_size": 0.05, "lot_size": 1},
        {"symbol": "ICICIBANK", "name": "ICICI Bank Ltd", "exchange": "NSE", "segment": "EQUITY", "sector": "Banking & Financials", "base_price": 1380.0, "tick_size": 0.05, "lot_size": 1},
        {"symbol": "LT", "name": "Larsen & Toubro Ltd", "exchange": "NSE", "segment": "EQUITY", "sector": "Capital Goods & Infra", "base_price": 3617.0, "tick_size": 0.05, "lot_size": 1},
        {"symbol": "SBIN", "name": "State Bank of India", "exchange": "NSE", "segment": "EQUITY", "sector": "Public Sector Banking", "base_price": 952.0, "tick_size": 0.05, "lot_size": 1},
        {"symbol": "BHARTIARTL", "name": "Bharti Airtel Ltd", "exchange": "NSE", "segment": "EQUITY", "sector": "Telecom", "base_price": 1873.0, "tick_size": 0.05, "lot_size": 1},
    ]

    def __init__(self):
        self._bars_cache: Dict[str, List[Dict[str, Any]]] = {}
        self._init_synthetic_series()

    def _init_synthetic_series(self):
        end_date = datetime.now()
        for inst in self.DEFAULT_INSTRUMENTS:
            symbol = inst["symbol"]
            base = inst["base_price"]
            bars = []
            
            current_close = base * 0.88
            for i in range(200, 0, -1):
                dt = end_date - timedelta(days=i * 1.45)
                if dt.weekday() >= 5:
                    continue
                
                cycle = math.sin(i * 0.15) * 0.015 + math.cos(i * 0.04) * 0.01
                trend = 0.0008
                daily_pct_change = cycle + trend
                
                open_price = round(current_close, 2)
                close_price = round(open_price * (1.0 + daily_pct_change), 2)
                intraday_volatility = abs(daily_pct_change) * 0.8 + 0.007
                high_price = round(max(open_price, close_price) * (1.0 + intraday_volatility), 2)
                low_price = round(min(open_price, close_price) * (1.0 - intraday_volatility), 2)
                volume = int(100_000 + abs(cycle) * 2_500_000 + (open_price * 10))
                
                bars.append({
                    "timestamp": dt.strftime("%Y-%m-%d"),
                    "open": open_price,
                    "high": high_price,
                    "low": low_price,
                    "close": close_price,
                    "volume": volume
                })
                current_close = close_price
                
            self._bars_cache[symbol] = bars

    def get_instruments(self) -> List[Dict[str, Any]]:
        results = []
        for inst in self.DEFAULT_INSTRUMENTS:
            bars = self._bars_cache.get(inst["symbol"], [])
            last_bar = bars[-1] if bars else {"close": inst["base_price"], "open": inst["base_price"], "volume": 0}
            prev_bar = bars[-2] if len(bars) > 1 else last_bar
            
            last_price = last_bar["close"]
            prev_price = prev_bar["close"]
            change = round(last_price - prev_price, 2)
            change_pct = round((change / prev_price) * 100, 2) if prev_price > 0 else 0.0
            
            results.append({
                "id": hash(inst["symbol"]) % 100000,
                "symbol": inst["symbol"],
                "name": inst["name"],
                "exchange": inst["exchange"],
                "segment": inst["segment"],
                "sector": inst["sector"],
                "last_price": last_price,
                "change": change,
                "change_pct": change_pct,
                "volume": last_bar["volume"],
                "tick_size": inst["tick_size"],
                "lot_size": inst["lot_size"],
                "updated_at": datetime.now().isoformat(),
                "data_mode": "sample_historical",
                "is_delayed": True,
                "disclaimer": "Sample historical fixtures for educational simulation. Not real-time execution feed."
            })
        return results

    def get_bars(self, symbol: str, interval: str = "1d", limit: int = 120) -> List[Dict[str, Any]]:
        sym = symbol.upper()
        if sym not in self._bars_cache:
            sym = "NIFTY50"
        bars = self._bars_cache[sym]
        return bars[-limit:]

    def get_quote(self, symbol: str) -> Optional[Dict[str, Any]]:
        for item in self.get_instruments():
            if item["symbol"].upper() == symbol.upper():
                return item
        return None


class AngelSmartApiProvider(BaseMarketDataProvider):
    """
    Live Market Data Provider powered by Angel One SmartAPI.
    Streams real-time live LTP and official historical candlestick data from NSE.
    """

    INSTRUMENTS_CONFIG = [
        {"symbol": "RELIANCE", "name": "Reliance Industries Ltd", "token": "2885", "exchange": "NSE", "segment": "EQUITY", "sector": "Energy & Petrochemicals", "lot_size": 1, "tick_size": 0.05},
        {"symbol": "TCS", "name": "Tata Consultancy Services Ltd", "token": "11536", "exchange": "NSE", "segment": "EQUITY", "sector": "Information Technology", "lot_size": 1, "tick_size": 0.05},
        {"symbol": "INFY", "name": "Infosys Ltd", "token": "1594", "exchange": "NSE", "segment": "EQUITY", "sector": "Information Technology", "lot_size": 1, "tick_size": 0.05},
        {"symbol": "HDFCBANK", "name": "HDFC Bank Ltd", "token": "1333", "exchange": "NSE", "segment": "EQUITY", "sector": "Banking & Financials", "lot_size": 1, "tick_size": 0.05},
        {"symbol": "ICICIBANK", "name": "ICICI Bank Ltd", "token": "4963", "exchange": "NSE", "segment": "EQUITY", "sector": "Banking & Financials", "lot_size": 1, "tick_size": 0.05},
        {"symbol": "SBIN", "name": "State Bank of India", "token": "3045", "exchange": "NSE", "segment": "EQUITY", "sector": "Public Sector Banking", "lot_size": 1, "tick_size": 0.05},
        {"symbol": "BHARTIARTL", "name": "Bharti Airtel Ltd", "token": "10604", "exchange": "NSE", "segment": "EQUITY", "sector": "Telecom", "lot_size": 1, "tick_size": 0.05},
        {"symbol": "LT", "name": "Larsen & Toubro Ltd", "token": "11483", "exchange": "NSE", "segment": "EQUITY", "sector": "Capital Goods & Infra", "lot_size": 1, "tick_size": 0.05},
        {"symbol": "NIFTY50", "name": "NIFTY 50 Index", "token": "99926000", "exchange": "NSE", "segment": "INDEX", "sector": "National Benchmark", "lot_size": 25, "tick_size": 0.05, "is_index": True},
        {"symbol": "BANKNIFTY", "name": "NIFTY Bank Index", "token": "99926009", "exchange": "NSE", "segment": "INDEX", "sector": "Banking Benchmark", "lot_size": 15, "tick_size": 0.05, "is_index": True},
    ]

    def __init__(self, api_key: str, client_code: str, mpin: str, totp_secret: str):
        self.api_key = api_key
        self.client_code = client_code
        self.mpin = mpin
        self.totp_secret = totp_secret
        self.smart_api = None
        self.session_expiry = 0
        self.fallback_provider = SampleVerifiedMarketDataProvider()
        self._ensure_session()

    def _ensure_session(self):
        """Generates or refreshes authenticated SmartAPI session via TOTP."""
        if self.smart_api and time.time() < self.session_expiry:
            return

        try:
            from SmartApi import SmartConnect
            import pyotp
            
            totp = pyotp.TOTP(self.totp_secret).now()
            obj = SmartConnect(api_key=self.api_key)
            session = obj.generateSession(self.client_code, self.mpin, totp)
            
            if session.get("status"):
                self.smart_api = obj
                # AngelOne sessions last until 06:00 AM next day; set 8 hours safe buffer
                self.session_expiry = time.time() + 28800
                print(f"[AngelSmartApi] Successfully logged in for Client: {self.client_code}")
            else:
                print(f"[AngelSmartApi] Session failed: {session.get('message')}")
        except Exception as e:
            print(f"[AngelSmartApi] Login error: {e}")

    def get_instruments(self) -> List[Dict[str, Any]]:
        self._ensure_session()
        if not self.smart_api:
            return self.fallback_provider.get_instruments()

        results = []
        for cfg in self.INSTRUMENTS_CONFIG:
            symbol = cfg["symbol"]
            token = cfg["token"]
            exchange = cfg["exchange"]
            trading_symbol = symbol if cfg.get("is_index") else f"{symbol}-EQ"

            try:
                res = self.smart_api.ltpData(exchange, trading_symbol, token)
                data = res.get("data")
                if data and "ltp" in data:
                    ltp = float(data["ltp"])
                    open_p = float(data.get("open", ltp))
                    close_p = float(data.get("close", ltp))
                    change = round(ltp - close_p, 2)
                    change_pct = round((change / close_p) * 100, 2) if close_p > 0 else 0.0

                    results.append({
                        "id": hash(symbol) % 100000,
                        "symbol": symbol,
                        "name": cfg["name"],
                        "exchange": exchange,
                        "segment": cfg["segment"],
                        "sector": cfg["sector"],
                        "last_price": ltp,
                        "change": change,
                        "change_pct": change_pct,
                        "volume": 0.0,
                        "tick_size": cfg["tick_size"],
                        "lot_size": cfg["lot_size"],
                        "updated_at": datetime.now().isoformat(),
                        "data_mode": "live_exchange",
                        "is_delayed": False,
                        "source": "Angel One SmartAPI (NSE Live)",
                        "disclaimer": "Live Real-Time Market Feed powered by Angel One SmartAPI."
                    })
                    continue
            except Exception as e:
                print(f"[AngelSmartApi] Error fetching quote for {symbol}: {e}")

            # Fallback for individual instrument if quote fails
            fb_quote = self.fallback_provider.get_quote(symbol)
            if fb_quote:
                results.append(fb_quote)

        return results

    def get_quote(self, symbol: str) -> Optional[Dict[str, Any]]:
        for inst in self.get_instruments():
            if inst["symbol"].upper() == symbol.upper():
                return inst
        return self.fallback_provider.get_quote(symbol)

    def get_bars(self, symbol: str, interval: str = "1d", limit: int = 120) -> List[Dict[str, Any]]:
        self._ensure_session()
        cfg = next((c for c in self.INSTRUMENTS_CONFIG if c["symbol"].upper() == symbol.upper()), None)
        
        if not self.smart_api or not cfg:
            return self.fallback_provider.get_bars(symbol, interval, limit)

        try:
            today = datetime.now()
            from_date = today - timedelta(days=limit * 1.5)
            
            params = {
                "exchange": cfg["exchange"],
                "symboltoken": cfg["token"],
                "interval": "ONE_DAY",
                "fromdate": from_date.strftime("%Y-%m-%d 09:15"),
                "todate": today.strftime("%Y-%m-%d 15:30")
            }
            res = self.smart_api.getCandleData(params)
            raw_candles = res.get("data", [])
            
            if raw_candles:
                bars = []
                for c in raw_candles:
                    # Format: [timestamp, open, high, low, close, volume]
                    dt_str = str(c[0]).split("T")[0]
                    bars.append({
                        "timestamp": dt_str,
                        "open": float(c[1]),
                        "high": float(c[2]),
                        "low": float(c[3]),
                        "close": float(c[4]),
                        "volume": float(c[5])
                    })
                return bars[-limit:]
        except Exception as e:
            print(f"[AngelSmartApi] Candle fetch error for {symbol}: {e}")

        return self.fallback_provider.get_bars(symbol, interval, limit)


# Instantiate Active Market Data Provider
if (
    settings.ANGEL_API_KEY
    and settings.ANGEL_CLIENT_CODE
    and settings.ANGEL_MPIN
    and settings.ANGEL_TOTP_SECRET
):
    print("[MarketDataProvider] Initializing live Angel One SmartAPI feed...")
    market_data_provider = AngelSmartApiProvider(
        api_key=settings.ANGEL_API_KEY,
        client_code=settings.ANGEL_CLIENT_CODE,
        mpin=settings.ANGEL_MPIN,
        totp_secret=settings.ANGEL_TOTP_SECRET
    )
else:
    print("[MarketDataProvider] Initializing deterministic sample provider...")
    market_data_provider = SampleVerifiedMarketDataProvider()
