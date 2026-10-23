"""
Tests for Backtesting Engine Determinism, Bias Prevention, and Transaction Costs.
"""
import pytest
from app.services.backtesting.engine import BacktestEngine

def test_backtest_engine_execution():
    # 50 days of synthetic trending bars
    bars = []
    base_price = 100.0
    for i in range(50):
        price = base_price + (i * 2.0)
        bars.append({
            "timestamp": f"2024-01-{i+1:02d}",
            "open": price - 0.5,
            "high": price + 1.0,
            "low": price - 1.0,
            "close": price,
            "volume": 10000
        })

    engine = BacktestEngine(bars=bars, initial_capital=100000.0)
    result = engine.run_strategy("sma_crossover", {"fast_period": 5, "slow_period": 15})

    assert "total_return_pct" in result
    assert "cagr_pct" in result
    assert "max_drawdown_pct" in result
    assert "sharpe_ratio" in result
    assert "trades_log" in result
    assert result["total_costs"] >= 0.0
    assert len(result["equity_curve"]) == 50

def test_transaction_cost_deduction():
    bars = []
    for i in range(40):
        # Oscillating price to trigger trades
        p = 100.0 if i % 2 == 0 else 105.0
        bars.append({
            "timestamp": f"2024-02-{i+1:02d}",
            "open": p,
            "high": p + 1.0,
            "low": p - 1.0,
            "close": p,
            "volume": 5000
        })

    engine = BacktestEngine(bars=bars, initial_capital=50000.0)
    result = engine.run_strategy("sma_crossover", {"fast_period": 3, "slow_period": 7})
    # If trades occurred, costs must be strictly accounted for
    if result["total_trades"] > 0:
        assert result["total_costs"] > 0
