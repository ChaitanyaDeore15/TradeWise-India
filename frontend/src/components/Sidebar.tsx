import React from "react";
import {
  TrendingUp,
  BarChart3,
  GraduationCap,
  Activity,
  Wallet,
  ShieldAlert,
  Bot,
  Bookmark,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export type TabType =
  | "overview"
  | "markets"
  | "academy"
  | "strategy_lab"
  | "paper_trading"
  | "risk_studio"
  | "ai_tutor"
  | "saved_research";

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse
}) => {
  const navItems = [
    { id: "overview" as TabType, label: "Overview", icon: TrendingUp },
    { id: "markets" as TabType, label: "Indian Markets", icon: BarChart3 },
    { id: "academy" as TabType, label: "Trading Academy", icon: GraduationCap },
    { id: "strategy_lab" as TabType, label: "Strategy Lab", icon: Activity },
    { id: "paper_trading" as TabType, label: "Paper Trading", icon: Wallet },
    { id: "risk_studio" as TabType, label: "Risk Studio", icon: ShieldAlert },
    { id: "ai_tutor" as TabType, label: "AI Finance Tutor", icon: Bot },
    { id: "saved_research" as TabType, label: "Saved Research", icon: Bookmark }
  ];

  return (
    <aside
      className={`border-r border-[#1E293B] bg-[#0B1220] flex flex-col justify-between transition-all duration-300 z-20 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="p-3">
        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#111C2E]"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#2DD4BF]" : "text-slate-400"}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-[#1E293B]">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#111C2E] transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
