import React, { useEffect, useState } from "react";
import { Wallet, ArrowUpRight, ArrowDownRight, RefreshCw, ShoppingCart, DollarSign, AlertCircle } from "lucide-react";
import { api } from "../../services/api";
import { PaperAccount, Instrument } from "../../types";

export const PaperTradingView: React.FC = () => {
  const [account, setAccount] = useState<PaperAccount | null>(null);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState("RELIANCE");
  const [orderSide, setOrderSide] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState(10);
  const [loading, setLoading] = useState(true);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAccount = async () => {
    try {
      const [accData, instData] = await Promise.all([
        api.getPaperAccount(),
        api.getInstruments()
      ]);
      setAccount(accData);
      setInstruments(instData);
    } catch (err) {
      console.error("Failed to load paper account:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccount();
  }, []);

  const handleExecuteOrder = async () => {
    if (quantity <= 0) return;
    setOrderSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      const res = await api.placePaperOrder(selectedSymbol, orderSide, quantity);
      setMessage(res.message);
      await loadAccount();
    } catch (err: any) {
      setError(err.message || "Order execution failed");
    } finally {
      setOrderSubmitting(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset paper trading portfolio back to ₹10,00,000 virtual balance?")) return;
    try {
      await api.resetPaperAccount();
      await loadAccount();
      setMessage("Virtual portfolio reset to ₹10,00,000.");
    } catch (err: any) {
      setError(err.message || "Failed to reset portfolio");
    }
  };

  const selectedInst = instruments.find(i => i.symbol === selectedSymbol);
  const estTurnover = (selectedInst?.last_price || 0) * quantity;
  const estBrokerage = Math.min(20, estTurnover * 0.0003);
  const estStt = estTurnover * 0.001;
  const estFees = estBrokerage + estStt + (estTurnover * 0.0000345) + (estBrokerage * 0.18);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        Loading Virtual Paper Trading Account...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Simulated Paper Trading <span className="text-xs px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] font-mono">Virtual ₹10 Lakhs</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Practice execution without capital risk. Simulated fills incorporate Indian brokerage, STT, and exchange taxes.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="px-3 py-1.5 rounded-lg bg-[#111C2E] border border-[#1E293B] text-slate-300 hover:text-white hover:border-[#EF4444] text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-red-400" /> Reset Portfolio
        </button>
      </div>

      {/* Portfolio Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111C2E] border border-[#1E293B] rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">Virtual Cash Available</span>
          <p className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
            ₹{account ? account.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "10,00,000.00"}
          </p>
          <span className="text-[10px] text-slate-400 font-mono">Unencumbered cash</span>
        </div>

        <div className="bg-[#111C2E] border border-[#1E293B] rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">Total Portfolio Equity</span>
          <p className="text-xl font-bold font-mono text-[#2DD4BF] mt-1 tabular-nums">
            ₹{account ? account.total_equity.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "10,00,000.00"}
          </p>
          <span className="text-[10px] text-slate-400 font-mono">Cash + Holdings mark-to-market</span>
        </div>

        <div className="bg-[#111C2E] border border-[#1E293B] rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">Unrealized P&L</span>
          <p className={`text-xl font-bold font-mono mt-1 tabular-nums ${
            account && account.unrealized_pnl >= 0 ? "text-[#10B981]" : "text-[#EF4444]"
          }`}>
            {account && account.unrealized_pnl >= 0 ? "+" : ""}₹{account ? account.unrealized_pnl.toFixed(2) : "0.00"}
          </p>
          <span className="text-[10px] text-slate-400 font-mono">Open positions</span>
        </div>

        <div className="bg-[#111C2E] border border-[#1E293B] rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">Realized P&L</span>
          <p className={`text-xl font-bold font-mono mt-1 tabular-nums ${
            account && account.realized_pnl >= 0 ? "text-[#10B981]" : "text-[#EF4444]"
          }`}>
            {account && account.realized_pnl >= 0 ? "+" : ""}₹{account ? account.realized_pnl.toFixed(2) : "0.00"}
          </p>
          <span className="text-[10px] text-slate-400 font-mono">Closed trades (net of fees)</span>
        </div>
      </div>

      {/* Main Row: Order Ticket on Left, Positions on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Ticket */}
        <div className="bg-[#111C2E] border border-[#1E293B] rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-[#2DD4BF]" /> Simulated Order Ticket
          </h2>

          <div className="grid grid-cols-2 gap-2 bg-[#0B1220] p-1 rounded-xl border border-[#1E293B]">
            <button
              onClick={() => setOrderSide("BUY")}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                orderSide === "BUY"
                  ? "bg-[#10B981] text-[#0B1220] shadow-md shadow-[#10B981]/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              BUY / LONG
            </button>
            <button
              onClick={() => setOrderSide("SELL")}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                orderSide === "SELL"
                  ? "bg-[#EF4444] text-white shadow-md shadow-[#EF4444]/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              SELL / SHORT
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Security</label>
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="w-full bg-[#0B1220] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
            >
              {instruments.map(i => (
                <option key={i.symbol} value={i.symbol}>{i.symbol} — {i.name} (₹{i.last_price})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Quantity (Shares)</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-[#0B1220] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#2DD4BF]"
            />
          </div>

          {/* Breakdown box */}
          <div className="bg-[#0B1220] border border-[#1E293B] rounded-xl p-3 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Est. Execution Price:</span>
              <span className="text-white">₹{selectedInst?.last_price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Gross Turnover:</span>
              <span className="text-white">₹{estTurnover.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Statutory Taxes & Charges:</span>
              <span className="text-amber-400">₹{estFees.toFixed(2)}</span>
            </div>
            <div className="border-t border-[#1E293B] pt-1 flex justify-between font-bold text-white">
              <span>Total Required:</span>
              <span>₹{(estTurnover + estFees).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <button
            onClick={handleExecuteOrder}
            disabled={orderSubmitting}
            className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
              orderSide === "BUY"
                ? "bg-[#10B981] hover:bg-emerald-600 text-[#0B1220] shadow-[#10B981]/20"
                : "bg-[#EF4444] hover:bg-red-600 text-white shadow-[#EF4444]/20"
            }`}
          >
            {orderSubmitting ? "Executing Order..." : `Simulate ${orderSide} Order`}
          </button>

          {message && (
            <div className="p-3 bg-emerald-950/40 border border-[#10B981]/50 rounded-lg text-xs text-emerald-300">
              {message}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-950/40 border border-[#EF4444]/50 rounded-lg text-xs text-red-300">
              {error}
            </div>
          )}
        </div>

        {/* Positions & Holdings Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#111C2E] border border-[#1E293B] rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">Open Portfolio Positions ({account?.positions.length || 0})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1E293B] text-slate-400 font-mono">
                    <th className="pb-2">Security</th>
                    <th className="pb-2">Quantity</th>
                    <th className="pb-2">Avg Entry</th>
                    <th className="pb-2">Current Price</th>
                    <th className="pb-2">Current Value</th>
                    <th className="pb-2">Unrealized P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B] font-mono text-slate-300">
                  {account?.positions && account.positions.length > 0 ? (
                    account.positions.map((pos) => {
                      const isProfit = pos.unrealized_pnl >= 0;
                      return (
                        <tr key={pos.id} className="hover:bg-[#162235]/60 transition-colors">
                          <td className="py-2.5 font-bold text-white">{pos.symbol}</td>
                          <td className="py-2.5">{pos.quantity}</td>
                          <td className="py-2.5">₹{pos.average_entry_price.toFixed(2)}</td>
                          <td className="py-2.5">₹{pos.current_price.toFixed(2)}</td>
                          <td className="py-2.5">₹{(pos.current_price * pos.quantity).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                          <td className={`py-2.5 font-bold ${isProfit ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                            {isProfit ? "+" : ""}₹{pos.unrealized_pnl.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500 font-sans">
                        No open positions. Place an order above to begin simulation.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Orders Log */}
          <div className="bg-[#111C2E] border border-[#1E293B] rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">Execution Journal ({account?.recent_orders.length || 0})</h3>
            <div className="overflow-x-auto max-h-48">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1E293B] text-slate-400 font-mono">
                    <th className="pb-2">Timestamp</th>
                    <th className="pb-2">Security</th>
                    <th className="pb-2">Side</th>
                    <th className="pb-2">Quantity</th>
                    <th className="pb-2">Fill Price</th>
                    <th className="pb-2">Fees</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B] font-mono text-slate-300">
                  {account?.recent_orders && account.recent_orders.length > 0 ? (
                    account.recent_orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#162235]/60">
                        <td className="py-2">{new Date(ord.executed_at).toLocaleTimeString()}</td>
                        <td className="py-2 font-bold text-white">{ord.symbol}</td>
                        <td className={`py-2 font-semibold ${ord.side === "BUY" ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                          {ord.side}
                        </td>
                        <td className="py-2">{ord.quantity}</td>
                        <td className="py-2">₹{ord.price.toFixed(2)}</td>
                        <td className="py-2 text-amber-400">₹{ord.estimated_fees.toFixed(2)}</td>
                        <td className="py-2 text-emerald-400 font-semibold">{ord.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-slate-500 font-sans">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
