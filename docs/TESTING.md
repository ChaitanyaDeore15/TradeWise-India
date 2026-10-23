# Automated Testing & Verification Suite

## 1. Test Architecture Overview
TradeWise India maintains automated tests across:
1. **Mathematical & Quantitative Indicators**: Verifies SMA, EMA, RSI, and ATR against hand-calculated mathematical constants.
2. **Backtesting Engine**: Verifies chronological ordering, zero look-ahead bias, trade state machines, and Indian regulatory cost deductions.
3. **Security & Cryptography**: Verifies salted password hashing, JWT creation/verification, expiration handling, and signature tampering detection.
4. **API Integration**: Verifies FastAPI endpoint responses, health checks, market instruments, educational curriculum, and risk calculations.

---

## 2. Test Execution Commands

```bash
cd backend
pytest -v
```

### Verified Test Suite Results (17 Tests Passing):
- `tests/test_api_endpoints.py::test_health_check` **PASSED**
- `tests/test_api_endpoints.py::test_root_disclaimer` **PASSED**
- `tests/test_api_endpoints.py::test_guest_login` **PASSED**
- `tests/test_api_endpoints.py::test_market_instruments_feed` **PASSED**
- `tests/test_api_endpoints.py::test_academy_curriculum` **PASSED**
- `tests/test_api_endpoints.py::test_ai_tutor_grounded_answer` **PASSED**
- `tests/test_api_endpoints.py::test_risk_position_sizing_endpoint` **PASSED**
- `tests/test_backtester.py::test_backtest_engine_execution` **PASSED**
- `tests/test_backtester.py::test_transaction_cost_deduction` **PASSED**
- `tests/test_financial_math.py::test_sma_calculation` **PASSED**
- `tests/test_financial_math.py::test_ema_calculation` **PASSED**
- `tests/test_financial_math.py::test_rsi_bounds` **PASSED**
- `tests/test_financial_math.py::test_position_sizing_math` **PASSED**
- `tests/test_financial_math.py::test_drawdown_recovery_asymmetry` **PASSED**
- `tests/test_security.py::test_password_hashing` **PASSED**
- `tests/test_security.py::test_jwt_tamper_detection` **PASSED**
- `tests/test_security.py::test_jwt_expiration` **PASSED**

---

## 3. Frontend Compilation & Type Verification

```bash
cd frontend
npm run build
```
- Fully type-checked with TypeScript (`tsc`).
- Bundles cleanly with Vite into `dist/`.
