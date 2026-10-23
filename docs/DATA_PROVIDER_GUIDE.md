# Market Data Provider Guide & Integration Adapter

## 1. Provider-Independent Architecture
TradeWise India enforces an **Adapter Pattern** through the `BaseMarketDataProvider` abstract base class located in `backend/app/services/market_data/provider.py`.

 analytical components (Charting, Strategy Lab, Paper Trading, Overview) consume data exclusively through the provider interface, decoupling business logic from any specific vendor API.

---

## 2. Modes of Operation

### Mode A: `sample_verified` (Default Development & Evaluation)
- Built-in deterministic historical price series for major Indian securities:
  - `NIFTY50` (National Benchmark)
  - `BANKNIFTY` (Banking Benchmark)
  - `RELIANCE` (Energy / Petrochemicals)
  - `TCS` & `INFY` (Information Technology)
  - `HDFCBANK` & `ICICIBANK` & `SBIN` (Financial Services)
  - `LT` (Infrastructure)
  - `BHARTIARTL` (Telecom)
- Every displayed quote carries explicit metadata:
  ```json
  {
    "data_mode": "sample_historical",
    "is_delayed": true,
    "disclaimer": "Sample historical fixtures for educational simulation. Not real-time execution feed."
  }
  ```

### Mode B: `live_adapter` (Commercial Production Integration)
- Designed to integrate with licensed market data vendors or authorized exchange data feeds (e.g. NSE Data Feed / authorized SEBI-registered intermediaries).
- Requires commercial exchange distribution agreements and compliance with NSE/BSE redistribution policies.

---

## 3. Data Integrity & Disclosure Rules
1. **Never Misrepresent Sample Data**: Sample or historical data is never labeled as "live" or "real-time".
2. **Display Market Status**: Clearly show trading session hours (IST 09:15 - 15:30) and settlement cycles (T+1 Rolling).
3. **Handle Stale Feeds**: If feed timestamps exceed latency thresholds, prominent warning badges are displayed.
