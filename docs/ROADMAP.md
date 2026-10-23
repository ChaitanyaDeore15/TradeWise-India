# Product Roadmap

## Phase 1 — Foundation & Core Experience (Completed ✅)
- [x] Brand identity & institutional design tokens (`#0B1220`, `#111C2E`, `#2DD4BF`).
- [x] Responsive navigation shell (Overview, Markets, Academy, Strategy Lab, Paper Trading, Risk Studio, AI Tutor, Saved Research).
- [x] FastAPI modular monolith with SQLite/PostgreSQL support.
- [x] PBKDF2 salted password hashing & JWT token security with Guest/Demo mode.
- [x] Automated test suite (17 passing tests covering financial math, backtesting, security, and endpoints).
- [x] 13 mandatory engineering and compliance documents.

## Phase 2 — Advanced Backtesting & Multi-Asset Expansion
- [ ] Walk-forward optimization and out-of-sample data splitting in the Strategy Lab.
- [ ] Commodity (MCX Gold, Silver, Crude Oil) and Currency (USDINR) historical paper trading.
- [ ] Advanced option Greeks visualizer (Delta, Gamma, Theta, Vega) with hypothetical payoff diagrams.

## Phase 3 — Brokerage Sandbox & Integration
- [ ] Sandbox adapter for SEBI-registered broker APIs (Zerodha Kite Connect, Upstox API, AngelOne SmartAPI).
- [ ] Multi-factor authentication (TOTP / SMS OTP) for enhanced security.
- [ ] Webhook alerts for custom user-defined educational criteria.
