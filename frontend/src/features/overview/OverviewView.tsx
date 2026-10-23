import React, { useEffect, useState } from "react";
import { TrendingUp, Award, Wallet, ShieldAlert, ArrowUpRight, ArrowDownRight, BookOpen, Activity } from "lucide-react";
import { api } from "../../services/api";
import { MarketOverview, MarketBar } from "../../types";
import { CandlestickChart } from "../../components/CandlestickChart";
import { TabType } from "../../components/Sidebar";

interface OverviewViewProps {
  onNavigate: (tab: TabType) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigate }) => {
  const [overview, setOverview] = useState<MarketOverview | null>(null);
  const [niftyBars, setNiftyBars] = useState<MarketBar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [ovData, barsData] = await Promise.all([
          api.getMarketOverview(),
          api.getBars("NIFTY50", "1d", 90)
        ]);
        setOverview(ovData);
        setNiftyBars(barsData);
      } catch (err) {
        console.error("Failed to load overview data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-[#111C2E] rounded-xl border border-[#1E293B]"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-[#111C2E] rounded-xl border border-[#1E293B]"></div>
          <div className="h-32 bg-[#111C2E] rounded-xl border border-[#1E293B]"></div>
          <div className="h-32 bg-[#111C2E] rounded-xl border border-[#1E293B]"></div>
        </div>
      </div>
    );
  }

  const nifty = overview?.benchmarks.nifty50;
  const bankNifty = overview?.benchmarks.banknifty;

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-[#111C2E] via-[#162235] to-[#111C2E] border border-[#1E293B] rounded-2xl p-6 relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 text-[#2DD4BF] text-xs font-semibold mb-3">
            <span>Official Educational Platform for Indian Financial Markets</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Learn Markets. Test Strategies. <span className="text-[#2DD4BF]">Understand Risk.</span>
          </h1>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            TradeWise India combines institutional-grade market data, quantitative backtesting with statutory Indian costs (STT, GST, brokerage), zero look-ahead bias, and SEBI-grounded financial literacy.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <button
              onClick={() => onNavigate("academy")}
              className="px-4 py-2 bg-[#2DD4BF] hover:bg-[#14B8A6] text-[#0B1220] font-semibold text-xs rounded-lg flex items-center gap-2 shadow-lg shadow-[#2DD4BF]/20 transition-all"
            >
              <BookOpen className="w-4 h-4" /> Start Learning Academy
            </button>
            <button
              onClick={() => onNavigate("strategy_lab")}
              className="px-4 py-2 bg-[#162235] hover:bg-[#1E293B] text-white font-medium text-xs rounded-lg border border-[#1E293B] flex items-center gap-2 transition-all"
            >
              <Activity className="w-4 h-4 text-[#2DD4BF]" /> Launch Strategy Lab
            </button>
          </div>
        </div>
      </div>

      {/* Benchmark Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* NIFTY 50 Card */}
        <div className="bg-[#111C2E] border border-[#1E293B] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">National Benchmark</span>
              <h3 className="text-lg font-bold text-white">NIFTY 50</h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">NSE INDEX</span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white font-mono tabular-nums">
              ₹{nifty ? nifty.last_price.toLocaleString("en-IN") : "24,850.00"}
            </span>
            <div className={`flex items-center gap-0.5 text-xs font-bold font-mono ${
              nifty && nifty.change >= 0 ? "text-[#10B981]" : "text-[#EF4444]"
            }`}>
              {nifty && nifty.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{nifty ? `${nifty.change > 0 ? "+" : ""}${nifty.change.toFixed(2)} (${nifty.change_pct}%)` : "+0.45%"}</span>
            </div>
          </div>
        </div>

        {/* BANK NIFTY Card */}
        <div className="bg-[#111C2E] border border-[#1E293B] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sectoral Benchmark</span>
              <h3 className="text-lg font-bold text-white">NIFTY BANK</h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">NSE INDEX</span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white font-mono tabular-nums">
              ₹{bankNifty ? bankNifty.last_price.toLocaleString("en-IN") : "51,200.00"}
            </span>
            <div className={`flex items-center gap-0.5 text-xs font-bold font-mono ${
              bankNifty && bankNifty.change >= 0 ? "text-[#10B981]" : "text-[#EF4444]"
            }`}>
              {bankNifty && bankNifty.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{bankNifty ? `${bankNifty.change > 0 ? "+" : ""}${bankNifty.change.toFixed(2)} (${bankNifty.change_pct}%)` : "+0.62%"}</span>
            </div>
          </div>
        </div>

        {/* Market Breadth & Settlement Card */}
        <div className="bg-[#111C2E] border border-[#1E293B] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Market Breadth (NSE)</span>
              <h3 className="text-lg font-bold text-white">
                {overview ? `${overview.breadth.advances} Adv / ${overview.breadth.declines} Dec` : "Advances / Declines"}
              </h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-[#2DD4BF]/15 text-[#2DD4BF] font-mono">T+1 Rolling</span>
          </div>
          <div className="mt-4">
            <div className="w-full h-2 rounded-full bg-red-500/30 overflow-hidden flex">
              <div
                className="bg-[#10B981] h-full"
                style={{
                  width: `${
                    overview
                      ? (overview.breadth.advances / (overview.breadth.advances + overview.breadth.declines || 1)) * 100
                      : 60
                  }%`
                }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1.5">
              <span className="text-[#10B981] font-semibold">{overview?.breadth.advances || 6} Advances</span>
              <span className="text-[#EF4444] font-semibold">{overview?.breadth.declines || 4} Declines</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Benchmark Chart */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">NIFTY 50 Benchmark Interactive Candle View</h2>
            <p className="text-xs text-slate-400">Daily OHLCV candles with SMA(20) and SMA(50) quantitative trend filters.</p>
          </div>
          <button
            onClick={() => onNavigate("markets")}
            className="text-xs text-[#2DD4BF] hover:underline flex items-center gap-1 font-medium"
          >
            Open All Indian Markets <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <CandlestickChart bars={niftyBars} symbol="NIFTY 50" height={340} />
      </div>

      {/* Educational Modules & Risk Wisdom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Trading Academy Progress Card */}
        <div className="bg-[#111C2E] border border-[#1E293B] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF]">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Trading Academy Progress</h3>
                  <p className="text-xs text-slate-400">Structured Indian capital markets curriculum</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-[#2DD4BF]">Track: Beginner</span>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Course 1: Indian Financial Markets & Architecture</span>
                <span className="font-mono text-[#2DD4BF]">100% Ready</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#2DD4BF] h-full w-full"></div>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Master Demat mechanics, order execution (Market, Limit, SL), T+1 settlement rules, and SEBI regulations.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate("academy")}
            className="mt-4 w-full py-2 bg-[#162235] hover:bg-[#1E293B] border border-[#1E293B] text-slate-200 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            Continue Learning Lessons <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Risk Management Insight Card */}
        <div className="bg-[#111C2E] border border-[#1E293B] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Empirical Risk Disclosure</h3>
                <p className="text-xs text-slate-400">Mathematical realities of trading</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-xs text-slate-300 leading-relaxed bg-[#0B1220] p-3 rounded-lg border border-[#1E293B]">
              <p>
                <strong className="text-amber-400">SEBI Study:</strong> 93% of individual retail traders in equity Futures & Options (F&O) incurred net losses between FY22-FY24.
              </p>
              <p className="text-slate-400">
                <strong>Asymmetric Drawdown:</strong> A 50% loss requires a 100% gain just to break even. TradeWise teaches strict position sizing (1-2% capital risk rule) before deploying capital.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate("risk_studio")}
            className="mt-4 w-full py-2 bg-[#162235] hover:bg-[#1E293B] border border-[#1E293B] text-amber-300 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            Launch Risk Studio & Position Sizer <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
