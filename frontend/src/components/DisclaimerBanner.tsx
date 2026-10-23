import React, { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

export const DisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-[#111C2E] border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-200/90">
      <div className="flex items-center gap-2 max-w-5xl">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <p>
          <strong className="text-amber-300">SEBI Regulatory Notice:</strong> TradeWise India is an educational and analytical platform.
          We are <strong>NOT</strong> a SEBI-registered Investment Adviser (RIA) or Research Analyst (RA). All strategies, backtests, paper trades, and market metrics are strictly hypothetical and for educational purposes only.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-400/80 hover:text-amber-200 p-1 transition-colors"
        title="Dismiss notice"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
