from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime

# Auth & User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str
    role: Optional[str] = "student"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# Market Schemas
class InstrumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    symbol: str
    name: str
    exchange: str
    segment: str
    sector: str
    last_price: float
    change: float
    change_pct: float
    volume: float
    updated_at: datetime

class MarketBarResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float

class WatchlistItemCreate(BaseModel):
    symbol: str
    notes: Optional[str] = None

class WatchlistCreate(BaseModel):
    name: str
    symbols: Optional[List[str]] = []

class WatchlistItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    symbol: str
    notes: Optional[str]

class WatchlistResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    created_at: datetime
    items: List[WatchlistItemResponse] = []


# Academy Schemas
class QuizResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    question: str
    options: List[str]
    explanation: Optional[str] = None

class QuizAttemptSubmit(BaseModel):
    quiz_id: int
    selected_option_index: int

class QuizAttemptResult(BaseModel):
    quiz_id: int
    is_correct: bool
    correct_option_index: int
    explanation: str

class LessonSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    slug: str
    duration_minutes: int
    order: int
    summary: Optional[str]

class LessonDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    course_id: int
    title: str
    slug: str
    summary: Optional[str]
    content_markdown: str
    duration_minutes: int
    order: int
    learning_objectives: List[str]
    quizzes: List[QuizResponse] = []

class CourseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    slug: str
    title: str
    description: str
    difficulty: str
    category: str
    estimated_hours: float
    is_free: bool
    order: int
    lessons: List[LessonSummaryResponse] = []


# Strategy & Backtest Schemas
class StrategyCreate(BaseModel):
    name: str
    description: Optional[str] = None
    strategy_type: str = "sma_crossover"
    parameters: Dict[str, Any] = {}

class StrategyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    description: Optional[str]
    strategy_type: str
    parameters: Dict[str, Any]
    created_at: datetime

class BacktestRequest(BaseModel):
    strategy_id: Optional[int] = None
    strategy_type: str = "sma_crossover"
    parameters: Dict[str, Any] = Field(default_factory=dict)
    symbol: str = "NIFTY50"
    start_date: Optional[str] = "2023-01-01"
    end_date: Optional[str] = "2024-01-01"
    initial_capital: float = 1000000.0
    brokerage_rate: float = 0.0003
    slippage_rate: float = 0.0005

class BacktestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: Optional[int] = None
    symbol: str
    strategy_type: str
    initial_capital: float
    final_equity: float
    total_return_pct: float
    cagr_pct: float
    max_drawdown_pct: float
    sharpe_ratio: float
    sortino_ratio: float
    win_rate_pct: float
    profit_factor: float
    total_trades: int
    benchmark_return_pct: float
    equity_curve: List[Dict[str, Any]]
    trades_log: List[Dict[str, Any]]
    disclaimer: str


# Paper Trading Schemas
class PaperOrderCreate(BaseModel):
    symbol: str
    side: str = Field(pattern="^(BUY|SELL)$")
    order_type: str = "MARKET"
    quantity: int = Field(gt=0)
    price: Optional[float] = None

class PaperPositionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    symbol: str
    quantity: int
    average_entry_price: float
    current_price: float
    unrealized_pnl: float

class PaperOrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    symbol: str
    side: str
    order_type: str
    quantity: int
    price: float
    status: str
    estimated_fees: float
    executed_at: datetime

class PaperAccountResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    account_number: str
    balance: float
    initial_balance: float
    realized_pnl: float
    unrealized_pnl: float
    total_equity: float
    positions: List[PaperPositionResponse] = []
    recent_orders: List[PaperOrderResponse] = []


# Risk Studio Schemas
class PositionSizeCalculateRequest(BaseModel):
    account_capital: float = Field(gt=0)
    risk_percentage: float = Field(gt=0, le=10)
    entry_price: float = Field(gt=0)
    stop_loss_price: float = Field(gt=0)

class PositionSizeResponse(BaseModel):
    risk_amount_inr: float
    per_share_risk_inr: float
    recommended_shares: int
    position_value_inr: float
    capital_allocation_pct: float
    risk_reward_ratio: Optional[float] = None
    warning: Optional[str] = ""
    explanation: str

class StressTestRequest(BaseModel):
    portfolio_value: float = Field(gt=0)
    scenario: str = "covid_crash_2020"

class StressTestResponse(BaseModel):
    scenario_name: str
    historical_benchmark_drop_pct: float
    estimated_loss_inr: float
    estimated_remaining_portfolio: float
    recovery_gain_needed_pct: float
    historical_recovery_days: int
    educational_takeaway: str


# AI Finance Tutor Schemas
class AITutorQueryRequest(BaseModel):
    query: str = Field(min_length=2)
    conversation_id: Optional[int] = None

class AITutorResponse(BaseModel):
    answer: str
    citations: List[Dict[str, str]]
    recommended_lessons: List[Dict[str, Any]]
    disclaimer: str


# Research Notes Schemas
class ResearchNoteCreate(BaseModel):
    symbol: Optional[str] = None
    title: str
    content: str
    tags: List[str] = []

class ResearchNoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    symbol: Optional[str]
    title: str
    content: str
    tags: List[str]
    created_at: datetime
