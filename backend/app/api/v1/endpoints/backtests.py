from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user_optional
from app.models.models import User, BacktestRun
from app.schemas.schemas import BacktestRequest, BacktestResponse
from app.services.market_data.provider import market_data_provider
from app.services.backtesting.engine import BacktestEngine

router = APIRouter()

@router.post("/run", response_model=BacktestResponse)
def run_backtest(
    request: BacktestRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_optional)
):
    """
    Executes a deterministic quantitative backtest with Indian regulatory costs,
    slippage, and zero look-ahead bias.
    """
    bars = market_data_provider.get_bars(request.symbol, interval="1d", limit=180)
    if not bars:
        raise HTTPException(status_code=400, detail=f"No data available for symbol '{request.symbol}'.")

    engine = BacktestEngine(
        bars=bars,
        initial_capital=request.initial_capital,
        brokerage_rate=request.brokerage_rate,
        slippage_rate=request.slippage_rate
    )

    try:
        results = engine.run_strategy(request.strategy_type, request.parameters)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Persist run if user authenticated and strategy_id provided
    run_id = None
    if user and request.strategy_id:
        backtest_run = BacktestRun(
            strategy_id=request.strategy_id,
            symbol=request.symbol,
            start_date=bars[0]["timestamp"],
            end_date=bars[-1]["timestamp"],
            initial_capital=request.initial_capital,
            brokerage_rate=request.brokerage_rate,
            slippage_rate=request.slippage_rate,
            total_return_pct=results["total_return_pct"],
            cagr_pct=results["cagr_pct"],
            max_drawdown_pct=results["max_drawdown_pct"],
            sharpe_ratio=results["sharpe_ratio"],
            sortino_ratio=results["sortino_ratio"],
            win_rate_pct=results["win_rate_pct"],
            profit_factor=results["profit_factor"],
            total_trades=results["total_trades"],
            benchmark_return_pct=results["benchmark_return_pct"],
            equity_curve=results["equity_curve"],
            trades_log=results["trades_log"]
        )
        db.add(backtest_run)
        db.commit()
        db.refresh(backtest_run)
        run_id = backtest_run.id

    return {
        "id": run_id,
        "symbol": request.symbol,
        "strategy_type": request.strategy_type,
        "initial_capital": results["initial_capital"],
        "final_equity": results["final_equity"],
        "total_return_pct": results["total_return_pct"],
        "cagr_pct": results["cagr_pct"],
        "max_drawdown_pct": results["max_drawdown_pct"],
        "sharpe_ratio": results["sharpe_ratio"],
        "sortino_ratio": results["sortino_ratio"],
        "win_rate_pct": results["win_rate_pct"],
        "profit_factor": results["profit_factor"],
        "total_trades": results["total_trades"],
        "benchmark_return_pct": results["benchmark_return_pct"],
        "equity_curve": results["equity_curve"],
        "trades_log": results["trades_log"],
        "disclaimer": results["disclaimer"]
    }
