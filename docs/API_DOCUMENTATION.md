# API Documentation (v1)

Base URL: `/api/v1`

---

## 1. Authentication (`/api/v1/auth`)

### `POST /api/v1/auth/register`
- Registers a new user account.
- **Request Body**: `{ "email": "trader@example.com", "password": "securepassword", "full_name": "Arjun Sharma" }`
- **Response**: JWT access token + user details.

### `POST /api/v1/auth/login`
- Authenticates existing credentials and returns Bearer token.

### `POST /api/v1/auth/guest-login`
- Instant one-click guest demo login for educational evaluation.

### `GET /api/v1/auth/me`
- Requires `Authorization: Bearer <token>`. Returns current user profile.

---

## 2. Market Intelligence (`/api/v1/markets`)

### `GET /api/v1/markets/instruments`
- Returns all supported Indian securities with freshness status, sector, last price, change, and lot size.

### `GET /api/v1/markets/quote/{symbol}`
- Returns quote details for an individual symbol.

### `GET /api/v1/markets/bars/{symbol}`
- Query params: `interval` (default `1d`), `limit` (default 120).
- Returns historical OHLCV candlestick bars.

### `GET /api/v1/markets/market-overview`
- Returns national benchmark quotes (NIFTY 50, NIFTY Bank), market breadth ratio, advances/declines, and top movers.

---

## 3. Trading Academy (`/api/v1/academy`)

### `GET /api/v1/academy/courses`
- Returns full course catalog with lesson outlines, difficulty ratings, and durations.

### `GET /api/v1/academy/lessons/{slug}`
- Returns full lesson markdown, learning objectives, and interactive quizzes.

### `POST /api/v1/academy/quizzes/submit`
- **Request Body**: `{ "quiz_id": 1, "selected_option_index": 1 }`
- **Response**: `{ "quiz_id": 1, "is_correct": true, "correct_option_index": 1, "explanation": "..." }`

---

## 4. Quantitative Strategy Lab (`/api/v1/backtests`)

### `POST /api/v1/backtests/run`
- **Request Body**:
  ```json
  {
    "strategy_type": "sma_crossover",
    "parameters": { "fast_period": 10, "slow_period": 30 },
    "symbol": "NIFTY50",
    "initial_capital": 1000000.0,
    "brokerage_rate": 0.0003,
    "slippage_rate": 0.0005
  }
  ```
- **Response**: Full backtest performance summary, net returns after STT/GST, CAGR, Max Drawdown, Sharpe/Sortino ratios, equity curve, trade execution log, and disclaimer.

---

## 5. Paper Trading Simulator (`/api/v1/paper-trading`)

### `GET /api/v1/paper-trading/account`
- Returns current virtual portfolio equity, cash balance, unrealized/realized PnL, holdings, and order history.

### `POST /api/v1/paper-trading/order`
- **Request Body**: `{ "symbol": "RELIANCE", "side": "BUY", "quantity": 10, "order_type": "MARKET" }`
- Executes simulated trade with Indian transaction costs.

### `POST /api/v1/paper-trading/reset`
- Resets virtual account back to initial ₹10,00,000 cash balance.

---

## 6. Risk Studio (`/api/v1/risk`)

### `POST /api/v1/risk/position-size`
- **Request Body**: `{ "account_capital": 500000, "risk_percentage": 1.5, "entry_price": 2500, "stop_loss_price": 2450 }`
- **Response**: Recommended shares, monetary risk, capital allocation %, and concentration warnings.

### `GET /api/v1/risk/drawdown-recovery/{loss_pct}`
- Computes required break-even recovery percentage.

### `POST /api/v1/risk/stress-test`
- Simulates hypothetical portfolio impact during historical crashes (COVID 2020, Lehman 2008, Demonetization 2016, Election Day 2024).

---

## 7. AI Finance Tutor (`/api/v1/ai-tutor`)

### `POST /api/v1/ai-tutor/query`
- **Request Body**: `{ "query": "Explain T+1 rolling settlement and Demat accounts" }`
- **Response**: Sourced educational response, exact SEBI/NSE document citations, and recommended curriculum modules.
