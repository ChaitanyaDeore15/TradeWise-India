"""
Financial Risk & Portfolio Stress Testing Engine for TradeWise India.
Provides deterministic risk calculations, position sizing, drawdown recovery modeling,
and historical Indian market crash scenarios.
"""
from typing import Dict, Any, Optional

def calculate_position_size(
    account_capital: float,
    risk_percentage: float,
    entry_price: float,
    stop_loss_price: float,
    target_price: Optional[float] = None
) -> Dict[str, Any]:
    """
    Calculates disciplined position size based on explicit monetary risk per trade.
    Formula: Shares = (Capital * (Risk_Pct / 100)) / abs(Entry - StopLoss)
    """
    if account_capital <= 0:
        raise ValueError("Account capital must be positive.")
    if risk_percentage <= 0 or risk_percentage > 10:
        raise ValueError("Risk percentage must be between 0.1% and 10% (SEBI/Institutional best practice is 1-2%).")
    if entry_price <= 0 or stop_loss_price <= 0:
        raise ValueError("Entry price and stop-loss price must be positive.")
        
    per_share_risk = abs(entry_price - stop_loss_price)
    if per_share_risk == 0:
        raise ValueError("Stop-loss price cannot equal entry price.")
        
    risk_amount = account_capital * (risk_percentage / 100.0)
    recommended_shares = int(risk_amount // per_share_risk)
    position_value = recommended_shares * entry_price
    capital_allocation_pct = (position_value / account_capital) * 100.0

    # Risk-Reward calculation if target provided
    risk_reward_ratio = None
    if target_price and target_price > entry_price:
        reward = target_price - entry_price
        risk_reward_ratio = round(reward / per_share_risk, 2)

    warning = ""
    if capital_allocation_pct > 30.0:
        warning = "Caution: This trade commits > 30% of total capital to a single position, posing concentration risk."

    explanation = (
        f"At {risk_percentage}% risk on ₹{account_capital:,.2f}, your maximum tolerable loss is ₹{risk_amount:,.2f}. "
        f"With ₹{per_share_risk:,.2f} risk per share, you can buy {recommended_shares} shares. "
        f"Total position value is ₹{position_value:,.2f} ({capital_allocation_pct:.1f}% of total portfolio)."
    )

    return {
        "risk_amount_inr": round(risk_amount, 2),
        "per_share_risk_inr": round(per_share_risk, 2),
        "recommended_shares": recommended_shares,
        "position_value_inr": round(position_value, 2),
        "capital_allocation_pct": round(capital_allocation_pct, 2),
        "risk_reward_ratio": risk_reward_ratio,
        "warning": warning,
        "explanation": explanation
    }

def calculate_drawdown_recovery(loss_pct: float) -> Dict[str, Any]:
    """
    Computes required percentage gain to recover from a given drawdown.
    Formula: Required Gain = Loss% / (100% - Loss%)
    """
    if loss_pct <= 0 or loss_pct >= 100:
        raise ValueError("Loss percentage must be between 1% and 99%.")
        
    recovery_pct = (loss_pct / (100.0 - loss_pct)) * 100.0
    return {
        "loss_pct": round(loss_pct, 2),
        "recovery_gain_needed_pct": round(recovery_pct, 2),
        "asymmetry_factor": round(recovery_pct / loss_pct, 2),
        "insight": (
            f"A {loss_pct:.0f}% loss requires a {recovery_pct:.1f}% gain just to break even. "
            "This mathematical asymmetry is why capital preservation is paramount in trading."
        )
    }

HISTORICAL_SCENARIOS = {
    "covid_crash_2020": {
        "name": "March 2020 COVID-19 Liquidity Shock",
        "drop_pct": 38.4,
        "recovery_days": 134,
        "vix_peak": 86.6,
        "takeaway": "NIFTY plunged 38% in 30 trading sessions. Extreme panic caused circuit breakers, but disciplined systematic buyers recovered capital within 5 months."
    },
    "lehman_2008": {
        "name": "2008 Global Financial Crisis (Lehman Shock)",
        "drop_pct": 59.9,
        "recovery_days": 490,
        "vix_peak": 85.0,
        "takeaway": "NIFTY declined nearly 60% over 10 months. Highly leveraged intraday and margin traders were wiped out; unleveraged index holders required 2+ years to recover."
    },
    "demonetization_2016": {
        "name": "November 2016 Demonetization Shock",
        "drop_pct": 7.3,
        "recovery_days": 42,
        "vix_peak": 22.0,
        "takeaway": "Sudden cash demonetization triggered acute FMCG and banking liquidity pressure, but broader index rebounded to new highs in under two months."
    },
    "election_day_2024": {
        "name": "June 4, 2024 Election Result Day Volatility",
        "drop_pct": 5.9,
        "recovery_days": 3,
        "vix_peak": 31.7,
        "takeaway": "Event-risk shock caused an unprecedented 1,300+ point intraday swing in NIFTY 50. Stop-losses executed with high slippage, followed by a V-shaped 3-day recovery."
    }
}

def simulate_stress_test(portfolio_value: float, scenario_key: str) -> Dict[str, Any]:
    """Simulate hypothetical impact of a historical Indian market shock on portfolio value."""
    if scenario_key not in HISTORICAL_SCENARIOS:
        scenario_key = "covid_crash_2020"
        
    scenario = HISTORICAL_SCENARIOS[scenario_key]
    drop_pct = scenario["drop_pct"]
    loss_amount = portfolio_value * (drop_pct / 100.0)
    remaining_value = portfolio_value - loss_amount
    recovery_needed = (drop_pct / (100.0 - drop_pct)) * 100.0

    return {
        "scenario_key": scenario_key,
        "scenario_name": scenario["name"],
        "historical_benchmark_drop_pct": drop_pct,
        "estimated_loss_inr": round(loss_amount, 2),
        "estimated_remaining_portfolio": round(remaining_value, 2),
        "recovery_gain_needed_pct": round(recovery_needed, 2),
        "historical_recovery_days": scenario["recovery_days"],
        "educational_takeaway": scenario["takeaway"],
        "disclaimer": "Historical shock simulations are educational models and do not guarantee future drawdown limits."
    }
