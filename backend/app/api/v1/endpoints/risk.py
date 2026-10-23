from fastapi import APIRouter, HTTPException
from app.schemas.schemas import (
    PositionSizeCalculateRequest, PositionSizeResponse,
    StressTestRequest, StressTestResponse
)
from app.services.risk.calculator import (
    calculate_position_size, calculate_drawdown_recovery, simulate_stress_test, HISTORICAL_SCENARIOS
)

router = APIRouter()

@router.post("/position-size", response_model=PositionSizeResponse)
def compute_position_size(request: PositionSizeCalculateRequest):
    """Calculate mathematically disciplined position sizing based on risk percentage."""
    try:
        result = calculate_position_size(
            account_capital=request.account_capital,
            risk_percentage=request.risk_percentage,
            entry_price=request.entry_price,
            stop_loss_price=request.stop_loss_price
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/drawdown-recovery/{loss_pct}")
def get_drawdown_recovery(loss_pct: float):
    """Calculate asymmetric gain percentage required to break even after a loss."""
    try:
        return calculate_drawdown_recovery(loss_pct)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/stress-test/scenarios")
def get_stress_test_scenarios():
    """List available historical Indian market shock scenarios."""
    return [
        {"key": k, "name": v["name"], "drop_pct": v["drop_pct"], "recovery_days": v["recovery_days"]}
        for k, v in HISTORICAL_SCENARIOS.items()
    ]

@router.post("/stress-test", response_model=StressTestResponse)
def run_stress_test(request: StressTestRequest):
    """Simulate historical Indian crisis scenario on portfolio value."""
    try:
        return simulate_stress_test(request.portfolio_value, request.scenario)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
