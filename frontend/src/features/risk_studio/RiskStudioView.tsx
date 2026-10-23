import React, { useState } from "react";
import { ShieldAlert, Calculator, TrendingDown, AlertTriangle, ArrowRight } from "lucide-react";
import { api } from "../../services/api";
import { PositionSizeResult, StressTestResult } from "../../types";

export const RiskStudioView: React.FC = () => {
  // Position Sizing state
  const [accountCapital, setAccountCapital] = useState(500000);
  const [riskPct, setRiskPct] = useState(1.0);
  const [entryPrice, setEntryPrice] = useState(2500);
  const [stopLossPrice, setStopLossPrice] = useState(2450);
  const [posResult, setPosResult] = useState<PositionSizeResult | null>(null);

  // Stress testing state
  const [portfolioValue, setPortfolioValue] = useState(1000000);
  const [selectedScenario, setSelectedScenario] = useState("covid_crash_2020");
  const [stressResult, setStressResult] = useState<StressTestResult | null>(null);
  const [stressLoading, setStressLoading] = useState(false);

  const handleCalculatePosition = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.calculatePositionSize(accountCapital, riskPct, entryPrice, stopLossPrice);
      setPosResult(res);
    } catch (err: any) {
      alert(err.message || "Failed to calculate position size");
    }
  };

  const handleRunStressTest = async () => {
    setStressLoading(true);
    try {
      const res = await api.runStressTest(portfolioValue, selectedScenario);
      setStressResult(res);
    } catch (err: any) {
      alert(err.message || "Failed to run stress test");
    } finally {
      setStressLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          Financial Risk Studio <span className="text-xs px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 font-mono">Institutional Math</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Master capital preservation formulas: position sizing, asymmetric drawdown recovery, and historical Indian crisis stress testing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: Position Sizing Calculator */}
        <div className="bg-[#111C2E] border border-[#1E293B] rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#1E293B] pb-3">
            <Calculator className="w-5 h-5 text-[#2DD4BF]" />
            <div>
              <h2 className="text-sm font-bold text-white">Mathematical Position Sizer</h2>
              <p className="text-[11px] text-slate-400">Formula: Shares = (Capital × Risk%) / |Entry - StopLoss|</p>
            </div>
          </div>

          <form onSubmit={handleCalculatePosition} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Total Capital (INR)</label>
                <input
                  type="number"
                  value={accountCapital}
                  onChange={(e) => setAccountCapital(Number(e.target.value))}
                  className="w-full bg-[#0B1220] border border-[#1E293B] rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#2DD4BF]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Risk per Trade (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="10"
                  value={riskPct}
                  onChange={(e) => setRiskPct(Number(e.target.value))}
                  className="w-full bg-[#0B1220] border border-[#1E293B] rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#2DD4BF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Entry Price (INR)</label>
                <input
                  type="number"
                  step="0.05"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(Number(e.target.value))}
                  className="w-full bg-[#0B1220] border border-[#1E293B] rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#2DD4BF]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Stop-Loss Price (INR)</label>
                <input
                  type="number"
                  step="0.05"
                  value={stopLossPrice}
                  onChange={(e) => setStopLossPrice(Number(e.target.value))}
                  className="w-full bg-[#0B1220] border border-[#1E293B] rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#2DD4BF]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#2DD4BF] hover:bg-[#14B8A6] text-[#0B1220] font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              Calculate Disciplined Size
            </button>
          </form>

          {posResult && (
            <div className="bg-[#0B1220] border border-[#1E293B] rounded-xl p-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Maximum Allowed Loss:</span>
                <span className="text-[#EF4444] font-bold">₹{posResult.risk_amount_inr.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Risk per Share:</span>
                <span className="text-white">₹{posResult.per_share_risk_inr}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Recommended Shares:</span>
                <span className="text-[#2DD4BF] font-extrabold text-sm">{posResult.recommended_shares} shares</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Position Value & Allocation:</span>
                <span className="text-white">₹{posResult.position_value_inr.toLocaleString()} ({posResult.capital_allocation_pct}%)</span>
              </div>
              {posResult.warning && (
                <div className="p-2 bg-amber-950/40 border border-amber-500/50 rounded-lg text-amber-300 text-[11px] font-sans mt-2">
                  {posResult.warning}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Module 2: Asymmetric Drawdown Recovery Law */}
        <div className="bg-[#111C2E] border border-[#1E293B] rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#1E293B] pb-3">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <div>
              <h2 className="text-sm font-bold text-white">The Asymmetry of Portfolio Loss</h2>
              <p className="text-[11px] text-slate-400">Mathematical Recovery Law: Required Gain = Loss / (1 - Loss)</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Losses work against you exponentially. Because capital reduces after a loss, your remaining capital must earn a significantly higher return just to get back to even:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1E293B] text-slate-400">
                  <th className="pb-2 text-left">Portfolio Loss</th>
                  <th className="pb-2 text-right">Required Gain to Break Even</th>
                  <th className="pb-2 text-right">Asymmetry Multiplier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B] text-slate-300">
                <tr>
                  <td className="py-1.5 text-slate-300">10% Drawdown</td>
                  <td className="py-1.5 text-right text-emerald-400">+11.1% Gain</td>
                  <td className="py-1.5 text-right text-slate-400">1.1x</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-slate-300">20% Drawdown</td>
                  <td className="py-1.5 text-right text-emerald-400">+25.0% Gain</td>
                  <td className="py-1.5 text-right text-slate-400">1.25x</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-amber-300">30% Drawdown</td>
                  <td className="py-1.5 text-right text-amber-400">+42.9% Gain</td>
                  <td className="py-1.5 text-right text-slate-400">1.43x</td>
                </tr>
                <tr className="bg-red-950/20 font-bold">
                  <td className="py-1.5 text-red-400">50% Drawdown</td>
                  <td className="py-1.5 text-right text-red-400">+100.0% Gain</td>
                  <td className="py-1.5 text-right text-red-300">2.0x</td>
                </tr>
                <tr className="bg-red-950/30 font-bold">
                  <td className="py-1.5 text-red-500">75% Drawdown</td>
                  <td className="py-1.5 text-right text-red-500">+300.0% Gain</td>
                  <td className="py-1.5 text-right text-red-400">4.0x</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-[#0B1220] border border-[#1E293B] rounded-xl text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-white">Institutional Rule:</strong> Never allow an individual trade or bad month to cause a &gt;10% account drawdown. Once down 50%, you need a 100% home run just to recover your original base.
          </div>
        </div>
      </div>

      {/* Module 3: Historical Indian Market Crash Stress Tester */}
      <div className="bg-[#111C2E] border border-[#1E293B] rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E293B] pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-white">Historical Indian Market Crash Stress Tester</h2>
              <p className="text-[11px] text-slate-400">Simulate how severe real-world market shocks impact your capital</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Simulated Portfolio Size (INR)</label>
            <input
              type="number"
              value={portfolioValue}
              onChange={(e) => setPortfolioValue(Number(e.target.value))}
              className="w-full bg-[#0B1220] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Historical Scenario</label>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="w-full bg-[#0B1220] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white"
            >
              <option value="covid_crash_2020">March 2020 COVID Liquidity Shock (-38.4%)</option>
              <option value="lehman_2008">2008 Lehman Global Financial Crisis (-59.9%)</option>
              <option value="demonetization_2016">November 2016 Demonetization (-7.3%)</option>
              <option value="election_day_2024">June 4, 2024 Election Volatility (-5.9%)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleRunStressTest}
              disabled={stressLoading}
              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-[#0B1220] font-bold text-xs rounded-lg transition-colors shadow-md"
            >
              {stressLoading ? "Simulating Shock..." : "Run Stress Scenario"}
            </button>
          </div>
        </div>

        {stressResult && (
          <div className="bg-[#0B1220] border border-[#1E293B] rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E293B] pb-3">
              <h3 className="text-sm font-bold text-white">{stressResult.scenario_name}</h3>
              <span className="text-xs font-mono font-bold text-red-400">
                Benchmark Drop: -{stressResult.historical_benchmark_drop_pct}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="bg-[#111C2E] p-3 rounded-lg border border-[#1E293B]">
                <span className="text-slate-400">Hypothetical Drawdown Loss:</span>
                <p className="text-base font-bold text-red-400 mt-1">
                  -₹{stressResult.estimated_loss_inr.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-[#111C2E] p-3 rounded-lg border border-[#1E293B]">
                <span className="text-slate-400">Remaining Capital:</span>
                <p className="text-base font-bold text-white mt-1">
                  ₹{stressResult.estimated_remaining_portfolio.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-[#111C2E] p-3 rounded-lg border border-[#1E293B]">
                <span className="text-slate-400">Required Recovery Gain:</span>
                <p className="text-base font-bold text-[#2DD4BF] mt-1">
                  +{stressResult.recovery_gain_needed_pct.toFixed(1)}% (≈{stressResult.historical_recovery_days} days)
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#111C2E] rounded-lg border border-[#1E293B] text-xs text-slate-300 leading-relaxed">
              <strong className="text-amber-400">Historical Lesson: </strong>
              {stressResult.educational_takeaway}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
