# Known Limitations & Honest Disclosure

In adherence to TradeWise India's core values of transparency and data integrity:

1. **Market Data Feed**:
   - The default mode uses verified sample and historical Indian market series.
   - Live real-time tick-by-tick market data requires a commercial NSE/BSE redistribution agreement.
2. **Paper Trading Fills**:
   - Simulated paper fills assume market order execution at the latest quoted price with modeled slippage. In fast-moving real markets, actual slippage and partial fills may vary.
3. **Short Selling Constraints**:
   - Paper trading and backtesting currently assume long positions and cash positions. Intraday short selling on Indian exchanges (MIS product type) subject to 3:15 PM auto-square-off will be introduced in subsequent phases.
4. **AI Tutor Knowledge Base**:
   - The AI Tutor knowledge retrieval is grounded in pre-curated official regulatory and educational publications. It does not browse the live web or ingest unverified social media commentary.
