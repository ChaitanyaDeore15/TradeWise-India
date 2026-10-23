"""
Unit Tests for Quantitative Technical Indicators and Risk Math.
Validates hand-calculated mathematical constants and bounds.
"""
import pytest
import math
from app.services.quantitative.indicators import (
    calculate_sma, calculate_ema, calculate_rsi, calculate_atr
)
from app.services.risk.calculator import (
    calculate_position_size, calculate_drawdown_recovery
)

def test_sma_calculation():
    prices = [10.0, 20.0, 30.0, 40.0, 50.0]
    # 3-period SMA
    sma = calculate_sma(prices, 3)
    assert math.isnan(sma[0])
    assert math.isnan(sma[1])
    assert sma[2] == 20.0 # (10 + 20 + 30) / 3
    assert sma[3] == 30.0 # (20 + 30 + 40) / 3
    assert sma[4] == 40.0 # (30 + 40 + 50) / 3

def test_ema_calculation():
    prices = [10.0, 10.0, 10.0, 10.0, 20.0]
    # 3-period EMA: multiplier k = 2 / (3 + 1) = 0.5
    ema = calculate_ema(prices, 3)
    assert ema[2] == 10.0 # Initial SMA
    assert ema[3] == 10.0 # (10 * 0.5) + (10 * 0.5)
    assert ema[4] == 15.0 # (20 * 0.5) + (10 * 0.5)

def test_rsi_bounds():
    # Strict monotonic upward price series should approach 100 RSI
    prices = [float(i * 5) for i in range(1, 30)]
    rsi = calculate_rsi(prices, 14)
    valid_rsi = [r for r in rsi if not math.isnan(r)]
    assert len(valid_rsi) > 0
    for r in valid_rsi:
        assert 0.0 <= r <= 100.0
    assert valid_rsi[-1] == 100.0

def test_position_sizing_math():
    # Capital: 1,00,000, 1% risk = 1,000 max loss
    # Entry: 500, Stop Loss: 480 -> Risk per share: 20
    # Expected shares = 1000 // 20 = 50
    result = calculate_position_size(
        account_capital=100000.0,
        risk_percentage=1.0,
        entry_price=500.0,
        stop_loss_price=480.0
    )
    assert result["risk_amount_inr"] == 1000.0
    assert result["per_share_risk_inr"] == 20.0
    assert result["recommended_shares"] == 50
    assert result["position_value_inr"] == 25000.0
    assert result["capital_allocation_pct"] == 25.0

def test_drawdown_recovery_asymmetry():
    # 50% loss requires 100% gain to recover
    res_50 = calculate_drawdown_recovery(50.0)
    assert res_50["recovery_gain_needed_pct"] == 100.0

    # 20% loss requires 25% gain
    res_20 = calculate_drawdown_recovery(20.0)
    assert res_20["recovery_gain_needed_pct"] == 25.0
