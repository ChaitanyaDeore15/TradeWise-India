import React from "react";
import { Search, Shield, User as UserIcon, RefreshCw, Sun, Moon } from "lucide-react";

interface NavbarProps {
  onSearchSymbol?: (symbol: string) => void;
  activeTheme: "dark" | "light";
  onToggleTheme: () => void;
  userEmail?: string;
  onRefreshData?: () => void;
  isLive?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSearchSymbol,
  activeTheme,
  onToggleTheme,
  userEmail = "demo@tradewise.in",
  onRefreshData,
  isLive = true
}) => {
  return (
    <header className="h-16 border-b border-[#1E293B] bg-[#0B1220]/90 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-6 flex items-center justify-between">
      {/* Brand & Market Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#2DD4BF] to-[#0D9488] flex items-center justify-center shadow-lg shadow-[#2DD4BF]/20">
            <span className="text-[#0B1220] font-black text-xl tracking-tighter">TW</span>
          </div>
          <div>
            <span className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
              TradeWise <span className="text-[#2DD4BF] text-xs font-semibold px-1.5 py-0.5 rounded bg-[#2DD4BF]/10 border border-[#2DD4BF]/30">INDIA</span>
            </span>
          </div>
        </div>

        {/* Data Status Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#111C2E] border border-[#1E293B] text-xs">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
          <span className="text-emerald-400 font-semibold">{isLive ? "Angel One SmartAPI (NSE Live)" : "NSE/BSE Sample Feed"}</span>
          <span className="text-slate-500">•</span>
          <span className="text-[#2DD4BF] font-mono">T+1 Settlement</span>
        </div>
      </div>

      {/* Global Symbol Search */}
      <div className="hidden lg:flex items-center relative w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Search NIFTY, BANKNIFTY, RELIANCE..."
          className="w-full bg-[#111C2E] border border-[#1E293B] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#2DD4BF] transition-all"
          onKeyDown={(e) => {
            if (e.key === "Enter" && onSearchSymbol) {
              onSearchSymbol((e.target as HTMLInputElement).value);
            }
          }}
        />
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {onRefreshData && (
          <button
            onClick={onRefreshData}
            title="Refresh Market Data"
            className="p-2 rounded-lg bg-[#111C2E] border border-[#1E293B] text-slate-300 hover:text-white hover:border-[#2DD4BF] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          title={`Switch to ${activeTheme === "dark" ? "Light" : "Dark"} Mode`}
          className="p-2 rounded-lg bg-[#111C2E] border border-[#1E293B] text-slate-300 hover:text-white transition-colors"
        >
          {activeTheme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
        </button>

        {/* User Session Profile Badge */}
        <div className="flex items-center gap-2 pl-3 border-l border-[#1E293B]">
          <div className="w-8 h-8 rounded-full bg-[#162235] border border-[#2DD4BF]/40 flex items-center justify-center text-[#2DD4BF]">
            <UserIcon className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-medium text-slate-200 leading-none">Student Account</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{userEmail}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
