import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=True)
    role = Column(String(50), default="student") # student, trader, quant, admin
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    watchlists = relationship("Watchlist", back_populates="user", cascade="all, delete-orphan")
    learning_progress = relationship("LearningProgress", back_populates="user", cascade="all, delete-orphan")
    strategies = relationship("Strategy", back_populates="user", cascade="all, delete-orphan")
    paper_accounts = relationship("PaperAccount", back_populates="user", cascade="all, delete-orphan")
    ai_conversations = relationship("AIConversation", back_populates="user", cascade="all, delete-orphan")
    research_notes = relationship("ResearchNote", back_populates="user", cascade="all, delete-orphan")


class Instrument(Base):
    __tablename__ = "instruments"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(50), unique=True, index=True, nullable=False) # e.g. NIFTY50, RELIANCE, TCS
    name = Column(String(255), nullable=False) # e.g. Reliance Industries Ltd
    exchange = Column(String(20), default="NSE") # NSE, BSE
    segment = Column(String(50), default="EQUITY") # INDEX, EQUITY, COMMODITY
    sector = Column(String(100), default="Diversified")
    tick_size = Column(Float, default=0.05)
    lot_size = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    last_price = Column(Float, default=0.0)
    change = Column(Float, default=0.0)
    change_pct = Column(Float, default=0.0)
    volume = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)


class MarketBar(Base):
    __tablename__ = "market_bars"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(50), index=True, nullable=False)
    interval = Column(String(20), default="1d") # 1m, 5m, 15m, 1d
    timestamp = Column(DateTime, index=True, nullable=False)
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    volume = Column(Float, default=0.0)


class Watchlist(Base):
    __tablename__ = "watchlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="watchlists")
    items = relationship("WatchlistItem", back_populates="watchlist", cascade="all, delete-orphan")


class WatchlistItem(Base):
    __tablename__ = "watchlist_items"

    id = Column(Integer, primary_key=True, index=True)
    watchlist_id = Column(Integer, ForeignKey("watchlists.id"), nullable=False)
    symbol = Column(String(50), nullable=False)
    notes = Column(String(255), nullable=True)

    watchlist = relationship("Watchlist", back_populates="items")


# Academy Models
class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(String(50), default="beginner") # beginner, intermediate, advanced
    category = Column(String(100), default="Indian Markets")
    estimated_hours = Column(Float, default=2.0)
    is_free = Column(Boolean, default=True)
    order = Column(Integer, default=1)
    
    lessons = relationship("Lesson", back_populates="course", cascade="all, delete-orphan", order_by="Lesson.order")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(255), nullable=False)
    slug = Column(String(100), nullable=False)
    summary = Column(Text, nullable=True)
    content_markdown = Column(Text, nullable=False)
    duration_minutes = Column(Integer, default=15)
    order = Column(Integer, default=1)
    learning_objectives = Column(JSON, default=list)

    course = relationship("Course", back_populates="lessons")
    quizzes = relationship("Quiz", back_populates="lesson", cascade="all, delete-orphan")


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    question = Column(Text, nullable=False)
    options = Column(JSON, nullable=False) # list of 4 options
    correct_option_index = Column(Integer, nullable=False)
    explanation = Column(Text, nullable=False)

    lesson = relationship("Lesson", back_populates="quizzes")


class LearningProgress(Base):
    __tablename__ = "learning_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    completed = Column(Boolean, default=False)
    score = Column(Float, default=0.0)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="learning_progress")


# Strategy & Backtesting Models
class Strategy(Base):
    __tablename__ = "strategies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    strategy_type = Column(String(50), default="sma_crossover") # sma_crossover, ema_crossover, rsi_reversal, breakout
    parameters = Column(JSON, default=dict) # e.g. {"fast_period": 20, "slow_period": 50, "rsi_period": 14}
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="strategies")
    backtest_runs = relationship("BacktestRun", back_populates="strategy", cascade="all, delete-orphan")


class BacktestRun(Base):
    __tablename__ = "backtest_runs"

    id = Column(Integer, primary_key=True, index=True)
    strategy_id = Column(Integer, ForeignKey("strategies.id"), nullable=False)
    symbol = Column(String(50), nullable=False)
    start_date = Column(String(50), nullable=False)
    end_date = Column(String(50), nullable=False)
    initial_capital = Column(Float, default=1000000.0) # INR 10,00,000
    brokerage_rate = Column(Float, default=0.0003) # 0.03% or standard discount broker
    slippage_rate = Column(Float, default=0.0005) # 0.05%
    status = Column(String(50), default="completed") # pending, running, completed, failed
    
    # Quantitative Results
    total_return_pct = Column(Float, default=0.0)
    cagr_pct = Column(Float, default=0.0)
    max_drawdown_pct = Column(Float, default=0.0)
    sharpe_ratio = Column(Float, default=0.0)
    sortino_ratio = Column(Float, default=0.0)
    win_rate_pct = Column(Float, default=0.0)
    profit_factor = Column(Float, default=0.0)
    total_trades = Column(Integer, default=0)
    benchmark_return_pct = Column(Float, default=0.0)
    equity_curve = Column(JSON, default=list) # [{date, equity, drawdown}]
    trades_log = Column(JSON, default=list) # [{entry_date, exit_date, symbol, side, entry_price, exit_price, pnl, pnl_pct, costs}]
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    strategy = relationship("Strategy", back_populates="backtest_runs")


# Paper Trading Models
class PaperAccount(Base):
    __tablename__ = "paper_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    account_number = Column(String(50), unique=True, nullable=False)
    balance = Column(Float, default=1000000.0) # Virtual INR 10 Lakhs
    initial_balance = Column(Float, default=1000000.0)
    realized_pnl = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="paper_accounts")
    positions = relationship("PaperPosition", back_populates="account", cascade="all, delete-orphan")
    orders = relationship("PaperOrder", back_populates="account", cascade="all, delete-orphan")


class PaperPosition(Base):
    __tablename__ = "paper_positions"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("paper_accounts.id"), nullable=False)
    symbol = Column(String(50), nullable=False)
    quantity = Column(Integer, default=0)
    average_entry_price = Column(Float, default=0.0)
    current_price = Column(Float, default=0.0)
    unrealized_pnl = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

    account = relationship("PaperAccount", back_populates="positions")


class PaperOrder(Base):
    __tablename__ = "paper_orders"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("paper_accounts.id"), nullable=False)
    symbol = Column(String(50), nullable=False)
    side = Column(String(10), nullable=False) # BUY, SELL
    order_type = Column(String(20), default="MARKET") # MARKET, LIMIT
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    status = Column(String(20), default="EXECUTED") # PENDING, EXECUTED, CANCELLED, REJECTED
    estimated_fees = Column(Float, default=0.0)
    executed_at = Column(DateTime, default=datetime.datetime.utcnow)

    account = relationship("PaperAccount", back_populates="orders")


# AI Tutor & Research Notes
class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), default="Trading Concept Query")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="ai_conversations")
    messages = relationship("AIMessage", back_populates="conversation", cascade="all, delete-orphan")


class AIMessage(Base):
    __tablename__ = "ai_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("ai_conversations.id"), nullable=False)
    role = Column(String(20), nullable=False) # user, assistant
    content = Column(Text, nullable=False)
    citations = Column(JSON, default=list) # [{source: "NSE Master Circular", url: "...", section: "..."}]
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    conversation = relationship("AIConversation", back_populates="messages")


class ResearchNote(Base):
    __tablename__ = "research_notes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    symbol = Column(String(50), nullable=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    tags = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="research_notes")
