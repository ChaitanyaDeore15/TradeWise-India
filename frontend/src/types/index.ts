export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface Instrument {
  id: number;
  symbol: string;
  name: string;
  exchange: string;
  segment: string;
  sector: string;
  last_price: number;
  change: number;
  change_pct: number;
  volume: number;
  tick_size?: number;
  lot_size?: number;
  updated_at: string;
}

export interface MarketBar {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketOverview {
  status: string;
  market_session: string;
  settlement_cycle: string;
  benchmarks: {
    nifty50: Instrument;
    banknifty: Instrument;
  };
  breadth: {
    advances: number;
    declines: number;
    ratio: number;
  };
  top_gainers: Instrument[];
  top_losers: Instrument[];
  disclaimer: string;
}

export interface Quiz {
  id: number;
  question: string;
  options: string[];
  explanation?: string;
}

export interface LessonSummary {
  id: number;
  title: string;
  slug: string;
  duration_minutes: number;
  order: number;
  summary?: string;
}

export interface LessonDetail {
  id: number;
  course_id: number;
  title: string;
  slug: string;
  summary?: string;
  content_markdown: string;
  duration_minutes: number;
  order: number;
  learning_objectives: string[];
  quizzes: Quiz[];
}

export interface Course {
  id: number;
  slug: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  estimated_hours: number;
  is_free: boolean;
  order: number;
  lessons: LessonSummary[];
}

export interface BacktestRequest {
  strategy_type: string;
  parameters: Record<string, any>;
  symbol: string;
  initial_capital: number;
  brokerage_rate: number;
  slippage_rate: number;
}

export interface BacktestResponse {
  id?: number;
  symbol: string;
  strategy_type: string;
  initial_capital: number;
  final_equity: number;
  total_return_pct: number;
  cagr_pct: number;
  max_drawdown_pct: number;
  sharpe_ratio: number;
  sortino_ratio: number;
  win_rate_pct: number;
  profit_factor: number;
  total_trades: number;
  benchmark_return_pct: number;
  equity_curve: Array<{ date: string; equity: number; cash: number; in_position: boolean }>;
  trades_log: Array<{
    entry_date: string;
    exit_date: string;
    side: string;
    shares: number;
    entry_price: number;
    exit_price: number;
    gross_pnl: number;
    net_pnl: number;
    pnl_pct: number;
    costs: number;
  }>;
  disclaimer: string;
}

export interface PaperPosition {
  id: number;
  symbol: string;
  quantity: number;
  average_entry_price: number;
  current_price: number;
  unrealized_pnl: number;
}

export interface PaperOrder {
  id: number;
  symbol: string;
  side: "BUY" | "SELL";
  order_type: string;
  quantity: number;
  price: number;
  status: string;
  estimated_fees: number;
  executed_at: string;
}

export interface PaperAccount {
  id: number;
  account_number: string;
  balance: number;
  initial_balance: number;
  realized_pnl: number;
  unrealized_pnl: number;
  total_equity: number;
  positions: PaperPosition[];
  recent_orders: PaperOrder[];
}

export interface PositionSizeResult {
  risk_amount_inr: number;
  per_share_risk_inr: number;
  recommended_shares: number;
  position_value_inr: number;
  capital_allocation_pct: number;
  risk_reward_ratio?: number;
  warning?: string;
  explanation: string;
}

export interface StressTestResult {
  scenario_key: string;
  scenario_name: string;
  historical_benchmark_drop_pct: number;
  estimated_loss_inr: number;
  estimated_remaining_portfolio: number;
  recovery_gain_needed_pct: number;
  historical_recovery_days: number;
  educational_takeaway: string;
  disclaimer: string;
}

export interface AITutorResponse {
  answer: string;
  citations: Array<{ source: string; reference: string }>;
  recommended_lessons: Array<{ slug: string; title: string }>;
  disclaimer: string;
}
