"""
Deterministic Backtesting Engine for TradeWise India.
Implements strict chronological execution, Indian transaction costs (STT, GST, Exchange charges, Stamp duty),
and institutional performance metrics.
"""
from typing import List, Dict, Any, Optional
import math
import numpy as np
from app.services.quantitative.indicators import (
    calculate_sma, calculate_ema, calculate_rsi
)

class BacktestEngine:
    def __init__(
        self,
        bars: List[Dict[str, Any]],
        initial_capital: float = 1000000.0,
        brokerage_rate: float = 0.0003, # 0.03%
        slippage_rate: float = 0.0005,   # 0.05%
        risk_free_rate: float = 0.065    # 6.5% Indian 91-day T-Bill / RBI benchmark
    ):
        self.bars = bars
        self.initial_capital = initial_capital
        self.brokerage_rate = brokerage_rate
        self.slippage_rate = slippage_rate
        self.risk_free_rate = risk_free_rate

    def _calculate_indian_transaction_costs(self, turnover: float, is_buy: bool) -> float:
        """
        Calculates realistic Indian regulatory and statutory transaction costs:
        - Brokerage: min(20, turnover * brokerage_rate)
        - STT: 0.1% on delivery (both buy and sell)
        - Exchange Turnover Charges: 0.00345%
        - GST: 18% on (Brokerage + Exchange Charges)
        - Stamp Duty: 0.015% on buy only
        """
        brokerage = min(20.0, turnover * self.brokerage_rate)
        stt = turnover * 0.001
        exchange_charges = turnover * 0.0000345
        gst = (brokerage + exchange_charges) * 0.18
        stamp_duty = (turnover * 0.00015) if is_buy else 0.0
        
        return brokerage + stt + exchange_charges + gst + stamp_duty

    def run_strategy(self, strategy_type: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes backtest with no look-ahead bias.
        Signal computed at index i close, trade executed at index i+1 open (or close with slippage).
        """
        if len(self.bars) < 20:
            raise ValueError("Insufficient historical bars for backtesting (minimum 20 required).")

        closes = [b["close"] for b in self.bars]
        dates = [b["timestamp"] for b in self.bars]
        n = len(closes)

        # Generate signals: 1 for Long, 0 for Cash
        signals = [0] * n

        if strategy_type == "sma_crossover":
            fast = int(parameters.get("fast_period", 10))
            slow = int(parameters.get("slow_period", 30))
            sma_fast = calculate_sma(closes, fast)
            sma_slow = calculate_sma(closes, slow)
            for i in range(slow, n):
                if not math.isnan(sma_fast[i]) and not math.isnan(sma_slow[i]):
                    if sma_fast[i] > sma_slow[i]:
                        signals[i] = 1
                    else:
                        signals[i] = 0

        elif strategy_type == "ema_crossover":
            fast = int(parameters.get("fast_period", 9))
            slow = int(parameters.get("slow_period", 21))
            ema_fast = calculate_ema(closes, fast)
            ema_slow = calculate_ema(closes, slow)
            for i in range(slow, n):
                if not math.isnan(ema_fast[i]) and not math.isnan(ema_slow[i]):
                    if ema_fast[i] > ema_slow[i]:
                        signals[i] = 1
                    else:
                        signals[i] = 0

        elif strategy_type == "rsi_reversal":
            period = int(parameters.get("rsi_period", 14))
            oversold = float(parameters.get("oversold", 30))
            overbought = float(parameters.get("overbought", 70))
            rsi = calculate_rsi(closes, period)
            holding = False
            for i in range(period + 1, n):
                if not math.isnan(rsi[i]):
                    if rsi[i] < oversold:
                        holding = True
                    elif rsi[i] > overbought:
                        holding = False
                    signals[i] = 1 if holding else 0

        elif strategy_type == "breakout":
            lookback = int(parameters.get("lookback_period", 20))
            for i in range(lookback, n):
                highest_high = max(closes[i - lookback : i])
                lowest_low = min(closes[i - lookback : i])
                if closes[i] >= highest_high:
                    signals[i] = 1
                elif closes[i] <= lowest_low:
                    signals[i] = 0
                else:
                    signals[i] = signals[i - 1]
        else:
            raise ValueError(f"Unsupported strategy type: {strategy_type}")

        # Chronological Simulation
        cash = self.initial_capital
        position_shares = 0
        trades_log = []
        equity_curve = []
        entry_price = 0.0
        entry_date = ""
        total_costs = 0.0

        for i in range(n):
            current_date = dates[i]
            current_close = closes[i]

            # Signal from PREVIOUS bar determines order action at current bar (eliminates look-ahead)
            if i > 0:
                prev_signal = signals[i - 1]
                
                # Buy entry condition
                if prev_signal == 1 and position_shares == 0:
                    exec_price = current_close * (1.0 + self.slippage_rate)
                    shares = int(cash // exec_price)
                    if shares > 0:
                        turnover = shares * exec_price
                        costs = self._calculate_indian_transaction_costs(turnover, is_buy=True)
                        if turnover + costs <= cash:
                            cash -= (turnover + costs)
                            position_shares = shares
                            entry_price = exec_price
                            entry_date = current_date
                            total_costs += costs

                # Sell exit condition
                elif prev_signal == 0 and position_shares > 0:
                    exec_price = current_close * (1.0 - self.slippage_rate)
                    turnover = position_shares * exec_price
                    costs = self._calculate_indian_transaction_costs(turnover, is_buy=False)
                    cash += (turnover - costs)
                    total_costs += costs
                    
                    pnl = (exec_price - entry_price) * position_shares - costs
                    pnl_pct = ((exec_price - entry_price) / entry_price) * 100.0
                    
                    trades_log.append({
                        "entry_date": entry_date,
                        "exit_date": current_date,
                        "side": "BUY",
                        "shares": position_shares,
                        "entry_price": round(entry_price, 2),
                        "exit_price": round(exec_price, 2),
                        "gross_pnl": round((exec_price - entry_price) * position_shares, 2),
                        "net_pnl": round(pnl, 2),
                        "pnl_pct": round(pnl_pct, 2),
                        "costs": round(costs, 2)
                    })
                    position_shares = 0

            # Record daily equity
            current_equity = cash + (position_shares * current_close)
            equity_curve.append({
                "date": current_date,
                "equity": round(current_equity, 2),
                "cash": round(cash, 2),
                "in_position": position_shares > 0
            })

        # Close any open position at end
        if position_shares > 0:
            final_price = closes[-1] * (1.0 - self.slippage_rate)
            turnover = position_shares * final_price
            costs = self._calculate_indian_transaction_costs(turnover, is_buy=False)
            cash += (turnover - costs)
            total_costs += costs
            pnl = (final_price - entry_price) * position_shares - costs
            trades_log.append({
                "entry_date": entry_date,
                "exit_date": dates[-1],
                "side": "BUY",
                "shares": position_shares,
                "entry_price": round(entry_price, 2),
                "exit_price": round(final_price, 2),
                "gross_pnl": round((final_price - entry_price) * position_shares, 2),
                "net_pnl": round(pnl, 2),
                "pnl_pct": round(((final_price - entry_price) / entry_price) * 100.0, 2),
                "costs": round(costs, 2)
            })

        final_equity = cash
        total_return_pct = ((final_equity - self.initial_capital) / self.initial_capital) * 100.0
        
        # Benchmark buy-and-hold return
        benchmark_return_pct = ((closes[-1] - closes[0]) / closes[0]) * 100.0

        # Drawdown calculation
        peak = self.initial_capital
        max_drawdown_pct = 0.0
        daily_equities = [item["equity"] for item in equity_curve]
        
        for eq in daily_equities:
            if eq > peak:
                peak = eq
            dd = ((peak - eq) / peak) * 100.0 if peak > 0 else 0.0
            if dd > max_drawdown_pct:
                max_drawdown_pct = dd

        # CAGR calculation
        years = len(self.bars) / 252.0 # Standard 252 Indian trading days per year
        if years > 0 and final_equity > 0:
            cagr_pct = ((final_equity / self.initial_capital) ** (1.0 / years) - 1.0) * 100.0
        else:
            cagr_pct = 0.0

        # Sharpe and Sortino Ratios
        daily_returns = []
        for i in range(1, len(daily_equities)):
            ret = (daily_equities[i] - daily_equities[i - 1]) / daily_equities[i - 1]
            daily_returns.append(ret)

        daily_rf = self.risk_free_rate / 252.0
        excess_returns = [r - daily_rf for r in daily_returns]
        
        if len(excess_returns) > 1 and np.std(daily_returns) > 0:
            sharpe_ratio = float((np.mean(excess_returns) / np.std(daily_returns)) * math.sqrt(252))
        else:
            sharpe_ratio = 0.0

        downside_returns = [r for r in excess_returns if r < 0]
        if len(downside_returns) > 1 and np.std(downside_returns) > 0:
            sortino_ratio = float((np.mean(excess_returns) / np.std(downside_returns)) * math.sqrt(252))
        else:
            sortino_ratio = 0.0

        # Trade metrics
        total_trades = len(trades_log)
        winning_trades = [t for t in trades_log if t["net_pnl"] > 0]
        losing_trades = [t for t in trades_log if t["net_pnl"] <= 0]
        
        win_rate_pct = (len(winning_trades) / total_trades * 100.0) if total_trades > 0 else 0.0
        gross_profit = sum(t["gross_pnl"] for t in winning_trades)
        gross_loss = abs(sum(t["gross_pnl"] for t in losing_trades))
        profit_factor = (gross_profit / gross_loss) if gross_loss > 0 else (gross_profit if gross_profit > 0 else 0.0)

        return {
            "initial_capital": self.initial_capital,
            "final_equity": round(final_equity, 2),
            "total_return_pct": round(total_return_pct, 2),
            "cagr_pct": round(cagr_pct, 2),
            "max_drawdown_pct": round(max_drawdown_pct, 2),
            "sharpe_ratio": round(sharpe_ratio, 2),
            "sortino_ratio": round(sortino_ratio, 2),
            "win_rate_pct": round(win_rate_pct, 2),
            "profit_factor": round(profit_factor, 2),
            "total_trades": total_trades,
            "total_costs": round(total_costs, 2),
            "benchmark_return_pct": round(benchmark_return_pct, 2),
            "equity_curve": equity_curve,
            "trades_log": trades_log,
            "disclaimer": (
                "Educational backtest results are historical and hypothetical. "
                "Past performance is not indicative of future returns. "
                "Simulated net returns incorporate estimated Indian STT, GST, and brokerage fees."
            )
        }
