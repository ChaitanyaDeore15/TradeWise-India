# TradeWise India 🇮🇳

> **Learn Markets. Test Strategies. Understand Risk.**  
> Institutional-grade educational FinTech platform for Indian capital markets (NSE & BSE), quantitative strategy research, simulated paper trading, financial risk modeling, and a citation-backed AI finance tutor.

---

## 🏛️ Regulatory & Compliance Notice

> **SEBI Educational Disclaimer:**  
> TradeWise India is an educational, analytical, and simulated testing technology platform.  
> We are **NOT** a SEBI-registered Investment Adviser (RIA) or Research Analyst (RA).  
> All strategies, backtests, paper trades, indicators, and AI tutor explanations are strictly hypothetical, backward-looking, and designed for educational evaluation.  
> Nothing on this platform constitutes personalized investment advice or actionable buy/sell recommendations.

---

## 🚀 Key Modules & Capabilities

1. **Indian Market Intelligence**
   - Historical OHLCV candle streams for NIFTY 50, BANK NIFTY, Reliance, TCS, HDFC Bank, Infosys, ICICI Bank, L&T, SBI, and Airtel.
   - Transparent data freshness status (`HISTORICAL_SAMPLE_FEED`, T+1 rolling settlement badge).
   - Market breadth monitoring (Advances / Declines) and technical indicators (SMA 20, SMA 50).

2. **Trading Academy (3-Tier Indian Curriculum)**
   - **Beginner**: Indian exchange architecture (NSE/BSE), Demat vs Trading accounts, order types (Market, Limit, SL, SL-M), clearing corporations (NSDL/CDSL), T+1 settlement.
   - **Intermediate**: Candlestick price auction, support/resistance zones, moving averages, momentum oscillators (RSI, MACD, ATR).
   - **Advanced**: Quantitative backtesting methodology, look-ahead bias elimination, derivatives mechanics (Futures & Options), Greeks, and the landmark SEBI retail F&O loss study.
   - Interactive concept verification quizzes with instant rationale explanations.

3. **Quantitative Strategy Lab**
   - Deterministic backtester enforcing zero look-ahead bias (signals generated at candle close, executed chronologically on subsequent bar).
   - Indian regulatory friction modeled: Brokerage (min ₹20 or 0.03%), Securities Transaction Tax (STT @ 0.1%), Exchange turnover charges (0.00345%), GST (18%), and Stamp duty (0.015%).
   - Metrics: Net Return %, CAGR %, Maximum Drawdown %, Sharpe Ratio, Sortino Ratio, Win Rate %, Profit Factor, Trade Count.

4. **Realistic Paper Trading Simulator**
   - Virtual accounts preloaded with ₹10,00,000 virtual capital.
   - Simulated order ticket executing against live quotes with realistic transaction cost deductions.
   - Real-time mark-to-market position tracking, unrealized and realized P&L, transaction journal, and 1-click portfolio reset.

5. **Financial Risk Studio**
   - **Position Sizing Calculator**: Enforcing the 1–2% institutional risk rule ($Shares = \frac{\text{Capital} \times \text{Risk\%}}{|Entry - StopLoss|}$).
   - **Asymmetric Drawdown Law**: Explaining why a 50% loss requires a 100% gain just to break even ($Gain = \frac{Loss}{1-Loss}$).
   - **Historical Indian Shock Stress Testing**: March 2020 COVID crash (-38.4%), 2008 Lehman crisis (-59.9%), 2016 Demonetization (-7.3%), and June 4, 2024 Election Volatility (-5.9%).

6. **AI Finance Tutor (SEBI Grounded RAG)**
   - Grounded strictly in official SEBI investor education circulars, NSE master circulars, and RBI publications.
   - Provides verbatim citations, recommended curriculum modules, and strict avoidance of price predictions or financial recommendations.

7. **Saved Research & Trading Journal**
   - Document hypotheses, track trade psychology reviews, organize notes with tags, and export research.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas/SVG Financial Charting Engine.
- **Backend**: Python 3.13, FastAPI, Pydantic v2, SQLAlchemy 2.0, SQLite (Dev) / PostgreSQL (Prod).
- **Quantitative Engine**: NumPy, SciPy, Pandas, Scikit-Learn.
- **Security**: PBKDF2-HMAC-SHA256 / Argon2 password hashing, tamper-evident HMAC-SHA256 JWT, OWASP-compliant parameterization.
- **Containerization**: Docker, Docker Compose, Multi-stage Nginx container.

---

## ⚡ Quickstart Guide (Local Development)

### 1. Backend Setup
```bash
cd backend
# Create virtual environment if desired: python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
pytest -v          # Runs all 17 automated tests
python run.py      # Starts FastAPI server on http://localhost:8000 (or: python app/main.py)
```
Swagger UI documentation is available at `http://localhost:8000/docs`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run build      # Verifies TypeScript compilation
npm run dev        # Starts Vite dev server on http://localhost:5173
```

### 3. Docker Compose (Full Stack)
```bash
docker-compose up --build
```
Access the application at `http://localhost:5173` and backend APIs at `http://localhost:8000`.

---

## 📚 Documentation Index

Detailed engineering and compliance documents in `docs/`:
- [ARCHITECTURE.md](file:///c:/Users/deore/Desktop/Tradewise%20AI/docs/ARCHITECTURE.md)
- [DATABASE_SCHEMA.md](file:///c:/Users/deore/Desktop/Tradewise%20AI/docs/DATABASE_SCHEMA.md)
- [API_DOCUMENTATION.md](file:///c:/Users/deore/Desktop/Tradewise%20AI/docs/API_DOCUMENTATION.md)
- [SECURITY.md](file:///c:/Users/deore/Desktop/Tradewise%20AI/docs/SECURITY.md)
- [DATA_PROVIDER_GUIDE.md](file:///c:/Users/deore/Desktop/Tradewise%20AI/docs/DATA_PROVIDER_GUIDE.md)
- [BACKTESTING_METHODOLOGY.md](file:///c:/Users/deore/Desktop/Tradewise%20AI/docs/BACKTESTING_METHODOLOGY.md)
- [FINANCIAL_CALCULATIONS.md](file:///c:/Users/deore/Desktop/Tradewise%20AI/docs/FINANCIAL_CALCULATIONS.md)
- [COMPLIANCE_REVIEW.md](file:///c:/Users/deore/Desktop/Tradewise%20AI/docs/COMPLIANCE_REVIEW.md)
- [TESTING.md](file:///c:/Users/deore/Desktop/Tradewise%20AI/docs/TESTING.md)
- [DEPLOYMENT.md](file:///c:/Users/deore/Desktop/Tradewise%20AI/docs/DEPLOYMENT.md)
- [KNOWN_LIMITATIONS.md](file:///c:/Users/deore/Desktop/Tradewise%20AI/docs/KNOWN_LIMITATIONS.md)
- [ROADMAP.md](file:///c:/Users/deore/Desktop/Tradewise%20AI/docs/ROADMAP.md)
