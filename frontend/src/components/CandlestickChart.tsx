import React, { useState, useMemo, useRef } from "react";
import { MarketBar } from "../types";

interface CandlestickChartProps {
  bars: MarketBar[];
  symbol: string;
  height?: number;
  showSma20?: boolean;
  showSma50?: boolean;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  bars,
  symbol,
  height = 360,
  showSma20 = true,
  showSma50 = true
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate Simple Moving Averages for overlays
  const sma20 = useMemo(() => {
    const period = 20;
    const closes = bars.map(b => b.close);
    const result: (number | null)[] = [];
    for (let i = 0; i < closes.length; i++) {
      if (i < period - 1) {
        result.push(null);
      } else {
        const slice = closes.slice(i - period + 1, i + 1);
        const sum = slice.reduce((a, b) => a + b, 0);
        result.push(sum / period);
      }
    }
    return result;
  }, [bars]);

  const sma50 = useMemo(() => {
    const period = 50;
    const closes = bars.map(b => b.close);
    const result: (number | null)[] = [];
    for (let i = 0; i < closes.length; i++) {
      if (i < period - 1) {
        result.push(null);
      } else {
        const slice = closes.slice(i - period + 1, i + 1);
        const sum = slice.reduce((a, b) => a + b, 0);
        result.push(sum / period);
      }
    }
    return result;
  }, [bars]);

  if (!bars || bars.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-[#111C2E] rounded-xl border border-[#1E293B] text-slate-400 text-sm">
        No historical market bars available for {symbol}.
      </div>
    );
  }

  // Determine bounds
  const minPrice = Math.min(...bars.map(b => b.low)) * 0.995;
  const maxPrice = Math.max(...bars.map(b => b.high)) * 1.005;
  const priceRange = maxPrice - minPrice || 1;
  const maxVol = Math.max(...bars.map(b => b.volume)) || 1;

  const width = 800; // SVG viewBox coordinate width
  const chartHeight = height - 70; // Reserve bottom area for volume and date axis
  const volHeight = 45;

  const getX = (index: number) => {
    const step = width / (bars.length || 1);
    return index * step + step / 2;
  };

  const getY = (price: number) => {
    return chartHeight - ((price - minPrice) / priceRange) * chartHeight + 10;
  };

  const candleWidth = Math.max(2, Math.min(10, (width / bars.length) * 0.65));

  // Build SMA path strings
  const getSmaPath = (smaArray: (number | null)[]) => {
    let d = "";
    smaArray.forEach((val, i) => {
      if (val !== null) {
        const x = getX(i);
        const y = getY(val);
        d += d === "" ? `M ${x} ${y}` : ` L ${x} ${y}`;
      }
    });
    return d;
  };

  const activeBar = hoverIndex !== null && hoverIndex >= 0 && hoverIndex < bars.length
    ? bars[hoverIndex]
    : bars[bars.length - 1];

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const ratio = mouseX / rect.width;
    const index = Math.min(bars.length - 1, Math.max(0, Math.floor(ratio * bars.length)));
    setHoverIndex(index);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const isBullish = activeBar.close >= activeBar.open;
  const changeVal = activeBar.close - activeBar.open;
  const changePct = ((changeVal / activeBar.open) * 100);

  return (
    <div ref={containerRef} className="bg-[#111C2E] border border-[#1E293B] rounded-xl p-4 flex flex-col gap-2">
      {/* Header Info Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E293B] pb-2 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white text-sm">{symbol}</span>
          <span className="text-slate-400 font-mono">Date: {activeBar.timestamp}</span>
          <span className="text-slate-400">O: <strong className="text-slate-200 tabular-nums">₹{activeBar.open.toFixed(2)}</strong></span>
          <span className="text-slate-400">H: <strong className="text-slate-200 tabular-nums">₹{activeBar.high.toFixed(2)}</strong></span>
          <span className="text-slate-400">L: <strong className="text-slate-200 tabular-nums">₹{activeBar.low.toFixed(2)}</strong></span>
          <span className="text-slate-400">C: <strong className="text-slate-200 tabular-nums">₹{activeBar.close.toFixed(2)}</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`font-semibold tabular-nums ${isBullish ? "text-[#10B981]" : "text-[#EF4444]"}`}>
            {isBullish ? "+" : ""}{changeVal.toFixed(2)} ({isBullish ? "+" : ""}{changePct.toFixed(2)}%)
          </span>
          <span className="text-slate-400 text-[11px] font-mono">Vol: {activeBar.volume.toLocaleString()}</span>
          {showSma20 && <span className="text-[#2DD4BF] text-[11px] font-medium flex items-center gap-1"><span className="w-2 h-0.5 bg-[#2DD4BF]"></span> SMA(20)</span>}
          {showSma50 && <span className="text-amber-400 text-[11px] font-medium flex items-center gap-1"><span className="w-2 h-0.5 bg-amber-400"></span> SMA(50)</span>}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Horizontal Gridlines */}
          {[0.2, 0.4, 0.6, 0.8].map((ratio, idx) => {
            const price = minPrice + priceRange * (1 - ratio);
            const y = chartHeight * ratio + 10;
            return (
              <g key={idx}>
                <line x1={0} y1={y} x2={width} y2={y} stroke="#1E293B" strokeDasharray="3 3" />
                <text x={width - 50} y={y - 4} fill="#64748B" fontSize="9" fontFamily="monospace">
                  ₹{price.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Volume Separator */}
          <line x1={0} y1={chartHeight + 15} x2={width} y2={chartHeight + 15} stroke="#1E293B" />

          {/* Candlesticks & Volume Bars */}
          {bars.map((bar, i) => {
            const x = getX(i);
            const openY = getY(bar.open);
            const closeY = getY(bar.close);
            const highY = getY(bar.high);
            const lowY = getY(bar.low);
            const isUp = bar.close >= bar.open;
            const candleColor = isUp ? "#10B981" : "#EF4444";
            const topY = Math.min(openY, closeY);
            const bHeight = Math.max(1.5, Math.abs(closeY - openY));

            // Volume bar
            const vHeight = (bar.volume / maxVol) * volHeight;
            const vY = height - 15 - vHeight;

            return (
              <g key={i}>
                {/* Volume Bar */}
                <rect
                  x={x - candleWidth / 2}
                  y={vY}
                  width={candleWidth}
                  height={vHeight}
                  fill={isUp ? "#10B981" : "#EF4444"}
                  opacity="0.35"
                />

                {/* Upper and Lower Wick */}
                <line
                  x1={x}
                  y1={highY}
                  x2={x}
                  y2={lowY}
                  stroke={candleColor}
                  strokeWidth="1.2"
                />

                {/* Candle Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={topY}
                  width={candleWidth}
                  height={bHeight}
                  fill={candleColor}
                  rx="0.5"
                />
              </g>
            );
          })}

          {/* SMA Overlays */}
          {showSma20 && (
            <path
              d={getSmaPath(sma20)}
              fill="none"
              stroke="#2DD4BF"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          )}

          {showSma50 && (
            <path
              d={getSmaPath(sma50)}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          )}

          {/* Crosshair on Hover */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={0}
                x2={getX(hoverIndex)}
                y2={height - 15}
                stroke="#94A3B8"
                strokeWidth="0.8"
                strokeDasharray="2 2"
              />
              <line
                x1={0}
                y1={getY(activeBar.close)}
                x2={width}
                y2={getY(activeBar.close)}
                stroke="#94A3B8"
                strokeWidth="0.8"
                strokeDasharray="2 2"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
