import React, { useEffect, useState } from "react";
import { Search, BarChart2, Filter, ArrowUpRight, ArrowDownRight, Activity, Wallet } from "lucide-react";
import { api } from "../../services/api";
import { Instrument, MarketBar } from "../../types";
import { CandlestickChart } from "../../components/CandlestickChart";
import { TabType } from "../../components/Sidebar";

interface MarketsViewProps {
  onNavigate: (tab: TabType) => void;
  onSelectForTrade?: (symbol: string) => void;
}

export const MarketsView: React.FC<MarketsViewProps> = ({ onNavigate, onSelectForTrade }) => {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("RELIANCE");
  const [bars, setBars] = useState<MarketBar[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [barsLoading, setBarsLoading] = useState(false);
  const [showSma20, setShowSma20] = useState(true);
  const [showSma50, setShowSma50] = useState(true);

  useEffect(() => {
    async function fetchInstruments() {
      try {
        const instList = await api.getInstruments();
        setInstruments(instList);
        if (instList.length > 0) {
          const initial = instList.find(i => i.symbol === "RELIANCE") || instList[0];
          setSelectedSymbol(initial.symbol);
          loadBars(initial.symbol);
        }
      } catch (err) {
        console.error("Failed to fetch instruments:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchInstruments();
  }, []);

  const loadBars = async (sym: string) => {
    setBarsLoading(true);
    try {
      const data = await api.getBars(sym, "1d", 120);
      setBars(data);
    } catch (err) {
      console.error("Failed to load bars for:", sym, err);
    } finally {
      setBarsLoading(false);
    }
  };

  const handleSelectSymbol = (sym: string) => {
    setSelectedSymbol(sym);
    loadBars(sym);
  };

  const sectors = ["all", ...Array.from(new Set(instruments.map(i => i.sector)))];

  const filteredInstruments = instruments.filter(inst => {
    const matchesSearch =
      inst.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = sectorFilter === "all" || inst.sector === sectorFilter;
    return matchesSearch && matchesSector;
  });

  const selectedInst = instruments.find(i => i.symbol === selectedSymbol);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 animate-pulse text-sm">
        Loading Indian securities and historical feeds...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Indian Market Intelligence <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">🟢 Angel One SmartAPI (NSE Live)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Streaming live market prices and real NSE candlestick histories directly via authorized SmartAPI connection.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter symbols..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#111C2E] border border-[#1E293B] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#2DD4BF] w-48"
            />
          </div>
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="bg-[#111C2E] border border-[#1E293B] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
          >
            {sectors.map(s => (
              <option key={s} value={s}>{s === "all" ? "All Sectors" : s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Chart on Left, Instrument Watchlist on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Chart & Action Controls */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#111C2E] border border-[#1E293B] rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{selectedInst?.name}</h2>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-semibold">
                    {selectedInst?.symbol}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{selectedInst?.sector} • {selectedInst?.exchange} {selectedInst?.segment}</p>
              </div>

              {/* Indicator Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSma20(!showSma20)}
                  className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                    showSma20
                      ? "bg-[#2DD4BF]/15 border-[#2DD4BF] text-[#2DD4BF]"
                      : "bg-[#162235] border-[#1E293B] text-slate-400"
                  }`}
                >
                  SMA 20
                </button>
                <button
                  onClick={() => setShowSma50(!showSma50)}
                  className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                    showSma50
                      ? "bg-amber-500/15 border-amber-500 text-amber-400"
                      : "bg-[#162235] border-[#1E293B] text-slate-400"
                  }`}
                >
                  SMA 50
                </button>
              </div>
            </div>

            {/* Candlestick Component */}
            {barsLoading ? (
              <div className="h-80 flex items-center justify-center text-slate-400 text-xs">
                Rendering candlesticks...
              </div>
            ) : (
              <CandlestickChart
                bars={bars}
                symbol={selectedSymbol}
                height={340}
                showSma20={showSma20}
                showSma50={showSma50}
              />
            )}

            {/* Quick Action Bar for Strategy & Paper Trading */}
            <div className="mt-4 pt-4 border-t border-[#1E293B] flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                <span>Lot Size: <strong className="text-slate-200">{selectedInst?.lot_size || 1}</strong></span>
                <span className="mx-2">•</span>
                <span>Tick: <strong className="text-slate-200">₹{selectedInst?.tick_size || 0.05}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (onSelectForTrade && selectedInst) onSelectForTrade(selectedInst.symbol);
                    onNavigate("paper_trading");
                  }}
                  className="px-3 py-1.5 bg-[#10B981] hover:bg-emerald-600 text-[#0B1220] font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Wallet className="w-3.5 h-3.5" /> Paper Trade {selectedSymbol}
                </button>
                <button
                  onClick={() => onNavigate("strategy_lab")}
                  className="px-3 py-1.5 bg-[#162235] hover:bg-[#1E293B] border border-[#1E293B] text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Activity className="w-3.5 h-3.5 text-[#2DD4BF]" /> Backtest Strategy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Securities Watchlist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-semibold uppercase tracking-wider">Securities Watchlist</span>
            <span>{filteredInstruments.length} items</span>
          </div>

          <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
            {filteredInstruments.map(inst => {
              const isSelected = inst.symbol === selectedSymbol;
              const isUp = inst.change >= 0;
              return (
                <div
                  key={inst.symbol}
                  onClick={() => handleSelectSymbol(inst.symbol)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#162235] border-[#2DD4BF]/50 shadow-md"
                      : "bg-[#111C2E] border-[#1E293B] hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-xs">{inst.symbol}</h4>
                      <p className="text-[10px] text-slate-400 truncate max-w-[130px]">{inst.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-xs text-white tabular-nums">
                        ₹{inst.last_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </p>
                      <p className={`font-mono text-[10px] font-semibold tabular-nums flex items-center justify-end gap-0.5 ${
                        isUp ? "text-[#10B981]" : "text-[#EF4444]"
                      }`}>
                        {isUp ? "+" : ""}{inst.change.toFixed(2)} ({isUp ? "+" : ""}{inst.change_pct}%)
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
