import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Sidebar, TabType } from "./components/Sidebar";
import { DisclaimerBanner } from "./components/DisclaimerBanner";
import { OverviewView } from "./features/overview/OverviewView";
import { MarketsView } from "./features/markets/MarketsView";
import { AcademyView } from "./features/academy/AcademyView";
import { StrategyLabView } from "./features/strategy_lab/StrategyLabView";
import { PaperTradingView } from "./features/paper_trading/PaperTradingView";
import { RiskStudioView } from "./features/risk_studio/RiskStudioView";
import { AITutorView } from "./features/ai_tutor/AITutorView";
import { SavedResearchView } from "./features/saved_research/SavedResearchView";
import { api } from "./services/api";

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [userEmail, setUserEmail] = useState<string>("demo@tradewise.in");

  useEffect(() => {
    // Auto-initialize demo guest session
    async function initSession() {
      try {
        if (!api.getToken()) {
          const authData = await api.guestLogin();
          setUserEmail(authData.user.email);
        } else {
          const me = await api.getMe();
          setUserEmail(me.email);
        }
      } catch (err) {
        console.warn("Guest session auto-init note:", err);
      }
    }
    initSession();
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-[#0B1220] text-[#F1F5F9]" : "bg-slate-50 text-slate-900"}`}>
      {/* Statutory Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Top Navigation */}
      <Navbar
        activeTheme={theme}
        onToggleTheme={toggleTheme}
        userEmail={userEmail}
        onSearchSymbol={() => setCurrentTab("markets")}
      />

      {/* Shell Layout: Sidebar + Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentTab === "overview" && <OverviewView onNavigate={setCurrentTab} />}
            {currentTab === "markets" && <MarketsView onNavigate={setCurrentTab} />}
            {currentTab === "academy" && <AcademyView />}
            {currentTab === "strategy_lab" && <StrategyLabView />}
            {currentTab === "paper_trading" && <PaperTradingView />}
            {currentTab === "risk_studio" && <RiskStudioView />}
            {currentTab === "ai_tutor" && <AITutorView onNavigate={setCurrentTab} />}
            {currentTab === "saved_research" && <SavedResearchView />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
