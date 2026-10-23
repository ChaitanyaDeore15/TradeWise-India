import React, { useState } from "react";
import { Play, TrendingUp, AlertTriangle, ShieldCheck, ArrowUpRight, ArrowDownRight, Layers, DollarSign } from "lucide-react";
import { api } from "../../services/api";
import { BacktestResponse } from "../../types";

export const StrategyLabView: React.FC = () => {
  const [strategyType, setStrategyType] = useState<string>("sma_crossover");
  const [symbol, setSymbol] = useState<string>("NIFTY50");
  const [fastPeriod, setFastPeriod] = useState<number>(10);
  const [slowPeriod, setSlowPeriod] = useState<number>(30);
  const [rsiPeriod, setRsiPeriod] = useState<number>(14);
  const [oversold, setOversold] = useState<number>(30);
  const [overbought, setOverbought] = useState<number>(70);
  const [initialCapital, setInitialCapital] = useState<number>(1000000);
  const [slippage, setSlippage] = useState<number>(0.05); // 0.05%
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BacktestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunBacktest = async () => {
    setLoading(true);
    setError(null);
    try {
      let params: Record<string, any> = {};
      if (strategyType === "sma_crossover" || strategyType === "ema_crossover") {
        params = { fast_period: fastPeriod, slow_period: slowPeriod };
      } else if (strategyType === "rsi_reversal") {
        params = { rsi_period: rsiPeriod, oversold, overbought };
      } else if (strategyType === "breakout") {
        params = { lookback_period: 20 };
      }

      const res = await api.runBacktest({
        strategy_type: strategyType,
        symbol,
        parameters: params,
        initial_capital: initialCapital,
        brokerage_rate: 0.0003,
        slippage_rate: slippage / 100.0
      });
      setResults(res);
    } catch (err: any) {
      setError(err.message || "Failed to execute backtest");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          Quantitative Strategy Lab <span className="text-xs px-2 py-0.5 rounded bg-[#2DD4BF]/15 text-[#2DD4BF] font-mono">Zero Look-Ahead Bias</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Formulate, test, and evaluate systematic trading hypotheses with Indian STT, GST, brokerage fees, and realistic slippage assumptions.
        </p>
      </div>

      {/* Strategy Configuration Form */}
      <div className="bg-[#111C2E] border border-[#1E293B] rounded-2xl p-5 lg:p-6 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#2DD4BF]" /> Strategy Parameters & Execution Rules
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Strategy Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Strategy Rule</label>
            <select
              value={strategyType}
              onChange={(e) => setStrategyType(e.target.value)}
              className="w-full bg-[#0B1220] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
            >
              <option value="sma_crossover">SMA Crossover (Fast vs Slow)</option>
              <option value="ema_crossover">EMA Crossover (Exponential)</option>
              <option value="rsi_reversal">RSI Mean Reversal (30/70)</option>
              <option value="breakout">Donchian 20-Day Breakout</option>
            </select>
          </div>

          {/* Instrument */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Security / Index</label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-[#0B1220] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
            >
              <option value="NIFTY50">NIFTY 50 (Index)</option>
              <option value="BANKNIFTY">NIFTY Bank (Index)</option>
              <option value="RELIANCE">Reliance Industries</option>
              <option value="TCS">TCS Ltd</option>
              <option value="HDFCBANK">HDFC Bank Ltd</option>
              <option value="INFY">Infosys Ltd</option>
              <option value="ICICIBANK">ICICI Bank Ltd</option>
            </select>
          </div>

          {/* Capital */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Simulated Capital (INR)</label>
            <input
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              className="w-full bg-[#0B1220] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#2DD4BF]"
            />
          </div>

          {/* Slippage */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Slippage Assumption (%)</label>
            <input
              type="number"
              step="0.01"
              value={slippage}
              onChange={(e) => setSlippage(Number(e.target.value))}
              className="w-full bg-[#0B1220] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#2DD4BF]"
            />
          </div>
        </div>

        {/* Dynamic Parameter Row */}
        {(strategyType === "sma_crossover" || strategyType === "ema_crossover") && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#1E293B]">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Fast Moving Average Period</label>
              <input
                type="number"
                value={fastPeriod}
                onChange={(e) => setFastPeriod(Number(e.target.value))}
                className="w-full bg-[#0B1220] border border-[#1E293B] rounded-lg px-3 py-1.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Slow Moving Average Period</label>
              <input
                type="number"
                value={slowPeriod}
                onChange={(e) => setSlowPeriod(Number(e.target.value))}
                className="w-full bg-[#0B1220] border border-[#1E293B] rounded-lg px-3 py-1.5 text-xs text-white font-mono"
              />
            </div>
          </div>
        )}

        {strategyType === "rsi_reversal" && (
          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-[#1E293B]">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">RSI Period</label>
              <input
                type="number"
                value={rsiPeriod}
                onChange={(e) => setRsiPeriod(Number(e.target.value))}
                className="w-full bg-[#0B1220] border border-[#1E293B] rounded-lg px-3 py-1.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Oversold Threshold (Buy)</label>
              <input
                type="number"
                value={oversold}
                onChange={(e) => setOversold(Number(e.target.value))}
                className="w-full bg-[#0B1220] border border-[#1E293B] rounded-lg px-3 py-1.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Overbought Threshold (Sell)</label>
              <input
                type="number"
                value={overbought}
                onChange={(e) => setOverbought(Number(e.target.value))}
                className="w-full bg-[#0B1220] border border-[#1E293B] rounded-lg px-3 py-1.5 text-xs text-white font-mono"
              />
            </div>
          </div>
        )}

        {/* Cost Model Explanation & Launch Action */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
          <div className="text-[11px] text-slate-400 font-mono">
            Modeled Friction: Brokerage min(₹20, 0.03%) + STT 0.1% + Exchange charges 0.00345% + GST 18% + Stamp Duty 0.015%
          </div>
          <button
            onClick={handleRunBacktest}
            disabled={loading}
            className="px-5 py-2.5 bg-[#2DD4BF] hover:bg-[#14B8A6] disabled:opacity-50 text-[#0B1220] font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-[#2DD4BF]/20 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            {loading ? "Computing Simulation..." : "Execute Deterministic Backtest"}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-lg text-xs text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Backtest Results Presentation */}
      {results && (
        <div className="space-y-6">
          {/* Key Metrics Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#111C2E] border border-[#1E293B] rounded-xl p-4">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Return (Net)</span>
              <p className={`text-xl font-extrabold font-mono mt-1 ${
                results.total_return_pct >= 0 ? "text-[#10B981]" : "text-[#EF4444]"
              }`}>
                {results.total_return_pct >= 0 ? "+" : ""}{results.total_return_pct}%
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Benchmark: {results.benchmark_return_pct >= 0 ? "+" : ""}{results.benchmark_return_pct}%
              </p>
            </div>

            <div className="bg-[#111C2E] border border-[#1E293B] rounded-xl p-4">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Max Drawdown</span>
              <p className="text-xl font-extrabold font-mono text-[#EF4444] mt-1">
                -{results.max_drawdown_pct}%
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Peak-to-trough decline</p>
            </div>

            <div className="bg-[#111C2E] border border-[#1E293B] rounded-xl p-4">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Sharpe Ratio</span>
              <p className="text-xl font-extrabold font-mono text-[#2DD4BF] mt-1">
                {results.sharpe_ratio}
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Sortino: {results.sortino_ratio}</p>
            </div>

            <div className="bg-[#111C2E] border border-[#1E293B] rounded-xl p-4">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Win Rate & Trades</span>
              <p className="text-xl font-extrabold font-mono text-white mt-1">
                {results.win_rate_pct}%
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                {results.total_trades} Trades (Profit Factor: {results.profit_factor})
              </p>
            </div>
          </div>

          {/* Equity Curve SVG Chart */}
          <div className="bg-[#111C2E] border border-[#1E293B] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Simulated Portfolio Equity Curve</h3>
                <p className="text-xs text-slate-400">Chronological net equity progression factoring in transaction deductions</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Final Equity:</span>
                <span className="text-sm font-bold text-white font-mono ml-1.5 tabular-nums">
                  ₹{results.final_equity.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* SVG Curve */}
            <div className="h-44 w-full">
              <svg viewBox="0 0 800 160" className="w-full h-full">
                {(() => {
                  const equities = results.equity_curve.map(e => e.equity);
                  const min = Math.min(...equities) * 0.98;
                  const max = Math.max(...equities) * 1.02;
                  const range = max - min || 1;

                  let path = "";
                  results.equity_curve.forEach((item, i) => {
                    const x = (i / (results.equity_curve.length - 1)) * 800;
                    const y = 150 - ((item.equity - min) / range) * 130;
                    path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
                  });

                  return (
                    <>
                      <path d={path} fill="none" stroke="#2DD4BF" strokeWidth="2.5" />
                      <line x1="0" y1="150" x2="800" y2="150" stroke="#1E293B" strokeDasharray="2 2" />
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>

          {/* Executed Trades Log Table */}
          <div className="bg-[#111C2E] border border-[#1E293B] rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">Simulated Trades Log ({results.trades_log.length} Executions)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1E293B] text-slate-400 font-mono">
                    <th className="pb-2">Entry Date</th>
                    <th className="pb-2">Exit Date</th>
                    <th className="pb-2">Side</th>
                    <th className="pb-2">Shares</th>
                    <th className="pb-2">Entry (₹)</th>
                    <th className="pb-2">Exit (₹)</th>
                    <th className="pb-2">Net P&L (₹)</th>
                    <th className="pb-2">Return %</th>
                    <th className="pb-2">Costs (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B] font-mono text-slate-300">
                  {results.trades_log.map((t, i) => {
                    const isProfit = t.net_pnl > 0;
                    return (
                      <tr key={i} className="hover:bg-[#162235]/60 transition-colors">
                        <td className="py-2">{t.entry_date}</td>
                        <td className="py-2">{t.exit_date}</td>
                        <td className="py-2 font-semibold text-[#10B981]">{t.side}</td>
                        <td className="py-2">{t.shares}</td>
                        <td className="py-2">₹{t.entry_price}</td>
                        <td className="py-2">₹{t.exit_price}</td>
                        <td className={`py-2 font-bold ${isProfit ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                          {isProfit ? "+" : ""}₹{t.net_pnl}
                        </td>
                        <td className={`py-2 ${isProfit ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                          {isProfit ? "+" : ""}{t.pnl_pct}%
                        </td>
                        <td className="py-2 text-slate-400">₹{t.costs}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Statutory Backtesting Disclaimer */}
          <div className="p-4 rounded-xl bg-[#0B1220] border border-[#1E293B] text-xs text-slate-400 leading-relaxed">
            <span className="text-amber-400 font-semibold">Important Methodology Note: </span>
            {results.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
};
