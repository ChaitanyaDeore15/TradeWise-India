"""
Seed Data Script for TradeWise India.
Populates courses, lessons, quizzes, demo user accounts, and initial instruments.
"""
from sqlalchemy.orm import Session
from app.models.models import (
    User, Course, Lesson, Quiz, Instrument, PaperAccount
)
from app.core.security import hash_password
from app.services.market_data.provider import market_data_provider

COURSES_DATA = [
    {
        "slug": "indian-markets-foundation",
        "title": "Indian Financial Markets & Exchange Architecture",
        "description": "Master the structural foundations of Indian trading: NSE, BSE, clearing corporations, Demat mechanics, order routing, and regulatory protections under SEBI.",
        "difficulty": "beginner",
        "category": "Market Structure",
        "estimated_hours": 2.5,
        "order": 1,
        "lessons": [
            {
                "slug": "indian-market-structure",
                "title": "NSE, BSE, and the Regulatory Role of SEBI",
                "summary": "Understand how India's premier exchanges operate, who regulates them, and how retail investors are protected.",
                "duration_minutes": 20,
                "order": 1,
                "learning_objectives": [
                    "Differentiate between primary and secondary markets in India",
                    "Understand the roles of NSE, BSE, and depositories (NSDL & CDSL)",
                    "Identify key investor protections enforced by SEBI"
                ],
                "content_markdown": """# Indian Stock Market Architecture

The Indian financial market is among the most technologically advanced and liquid exchange ecosystems globally.

### 1. Key Participants
- **SEBI (Securities and Exchange Board of India)**: The statutory apex regulator ensuring market integrity, preventing fraudulent practices, and protecting investor rights.
- **Stock Exchanges (NSE & BSE)**: Nationwide electronic order-matching venues operating fully automated screen-based trading systems (NEAT on NSE and BOLT on BSE).
- **Depositories (NSDL & CDSL)**: Electronic custodians holding dematerialized securities. Just as banks hold cash in accounts, depositories hold shares in **Demat accounts**.
- **Clearing Corporations (NSE Clearing Ltd / ICCL)**: Guarantees trade settlement as a central counterparty, eliminating counterparty default risk.

### 2. Trading Sessions in India (IST)
- **Pre-Open Session**: 09:00 AM – 09:15 AM (Order collection and equilibrium opening price discovery).
- **Regular Trading Session**: 09:15 AM – 03:30 PM (Continuous order matching).
- **Post-Closing Session**: 03:40 PM – 04:00 PM (Trades executed at the day's weighted average closing price).

### 3. Settlement: T+1 Rolling Cycle
Since January 2023, India is one of the few global markets operating entirely on **T+1 rolling settlement**. Shares bought on Monday settle into your Demat account on Tuesday.
""",
                "quizzes": [
                    {
                        "question": "Which regulatory body governs securities markets and protects investor interests in India?",
                        "options": ["RBI", "SEBI", "IRDAI", "Ministry of Corporate Affairs"],
                        "correct_option_index": 1,
                        "explanation": "SEBI (Securities and Exchange Board of India) is the statutory regulatory body established under the SEBI Act, 1992."
                    },
                    {
                        "question": "What is the standard rolling settlement cycle for Indian equity markets?",
                        "options": ["T+3", "T+2", "T+1", "T+5"],
                        "correct_option_index": 2,
                        "explanation": "India completed its nationwide transition to the T+1 rolling settlement cycle in January 2023."
                    }
                ]
            },
            {
                "slug": "demat-trading-order-types",
                "title": "Demat Accounts, Trading Accounts, and Order Types",
                "summary": "Learn the mechanics of placing Market, Limit, Stop-Loss, and Cover Orders in Indian broker platforms.",
                "duration_minutes": 25,
                "order": 2,
                "learning_objectives": [
                    "Distinguish between Demat and Trading accounts",
                    "Understand Market, Limit, Stop-Loss (SL), and SL-Market orders",
                    "Learn how bid, ask, and spread impact order execution"
                ],
                "content_markdown": """# Demat Accounts & Order Execution Mechanics

To invest or trade in India, a user requires an integrated **3-in-1 account infrastructure**:
1. **Bank Account**: Funds repository.
2. **Trading Account**: Maintained with a SEBI-registered broker to place buy/sell orders.
3. **Demat Account**: Maintained with NSDL or CDSL to electronically store your equity securities.

### Order Types Explained
- **Market Order**: Executes immediately at the best currently available market price. Carries execution certainty but price uncertainty in volatile markets.
- **Limit Order**: Specifies the maximum price you are willing to pay (Buy Limit) or minimum price you accept (Sell Limit).
- **Stop-Loss Limit (SL)**: Triggers an active limit order once a specified trigger price is touched by the market.
- **Stop-Loss Market (SL-M)**: Triggers an unconditional market order once the trigger price is breached.
""",
                "quizzes": [
                    {
                        "question": "Where are equity shares electronically stored after purchase?",
                        "options": ["Trading Account", "Demat Account (NSDL/CDSL)", "Broker's Pool Account", "Exchange Clearing Vault"],
                        "correct_option_index": 1,
                        "explanation": "Shares are held in dematerialized form in your Demat account directly registered under your PAN with NSDL or CDSL."
                    }
                ]
            }
        ]
    },
    {
        "slug": "technical-analysis-foundations",
        "title": "Technical Analysis & Systematic Trading Foundations",
        "description": "Understand price action, candlestick dynamics, trend indicators (SMA/EMA), and momentum oscillators (RSI/MACD) with quantitative rigor.",
        "difficulty": "intermediate",
        "category": "Quantitative Analysis",
        "estimated_hours": 3.0,
        "order": 2,
        "lessons": [
            {
                "slug": "candlesticks-and-trendlines",
                "title": "Candlestick Dynamics, Support & Resistance",
                "summary": "Master the visual language of Japanese candlesticks and market auction theory.",
                "duration_minutes": 30,
                "order": 1,
                "learning_objectives": [
                    "Interpret Open, High, Low, and Close (OHLC) candles",
                    "Identify institutional support and resistance zones",
                    "Avoid false breakout traps using volume confirmation"
                ],
                "content_markdown": """# Candlestick Interpretation & Market Auction

Every candlestick encapsulates the battle between buyers (bids) and sellers (asks) over a discrete interval.

### Anatomic Components:
- **Body**: The range between the Open and Close price.
- **Upper Shadow (Wick)**: Price rejection from the session high.
- **Lower Shadow (Tail)**: Buying absorption from the session low.

### Support & Resistance Zones
Support represents a price area where demand is strong enough to prevent the price from declining further. Resistance is where selling interest outweighs buying enthusiasm.
Always evaluate support and resistance as **zones**, not exact single-rupee points.
""",
                "quizzes": [
                    {
                        "question": "What does a long lower shadow (wick) on a daily candle typically indicate?",
                        "options": [
                            "Aggressive institutional selling throughout the session",
                            "Price rejection from lows and strong buying support",
                            "Low trading volume",
                            "A guaranteed gap-down the next day"
                        ],
                        "correct_option_index": 1,
                        "explanation": "A long lower shadow indicates that sellers drove prices down, but buyers stepped in aggressively to close prices well above the day's lows."
                    }
                ]
            },
            {
                "slug": "moving-averages-and-rsi",
                "title": "Moving Averages (SMA/EMA) & Momentum (RSI)",
                "summary": "Implement quantitative trend filters and momentum indicators to formulate systematic rules.",
                "duration_minutes": 35,
                "order": 2,
                "learning_objectives": [
                    "Calculate and configure SMA and EMA filters",
                    "Understand the Golden Cross and Death Cross conventions",
                    "Apply RSI with trend context rather than naive overbought/oversold fades"
                ],
                "content_markdown": """# Moving Averages & Momentum Oscillators

### Simple vs Exponential Moving Averages
- **SMA**: Arithmetic mean over $N$ periods: $\\text{SMA}_t = \\frac{1}{N} \\sum_{i=0}^{N-1} P_{t-i}$.
- **EMA**: Applies exponential weighting prioritizing recent price data: $k = \\frac{2}{N+1}$.

### Golden Cross & Death Cross
- **Golden Cross**: 50-day moving average crosses above 200-day moving average (bullish regime).
- **Death Cross**: 50-day moving average crosses below 200-day moving average (bearish regime).

### Relative Strength Index (RSI)
Formulated by J. Welles Wilder, RSI calculates internal price strength on a 0–100 scale:
$\\text{RSI} = 100 - \\frac{100}{1 + \\text{RS}}$ where $\\text{RS} = \\frac{\\text{Average Gain}}{\\text{Average Loss}}$.
""",
                "quizzes": [
                    {
                        "question": "Why does an Exponential Moving Average (EMA) respond faster to price turns than a Simple Moving Average (SMA)?",
                        "options": [
                            "It uses future price estimates",
                            "It assigns greater mathematical weight to recent observations",
                            "It ignores closing prices",
                            "It only calculates prices on Mondays"
                        ],
                        "correct_option_index": 1,
                        "explanation": "EMAs use an exponential multiplier (2/(N+1)) that gives exponentially higher weight to the most recent price bars."
                    }
                ]
            }
        ]
    },
    {
        "slug": "quantitative-research-and-risk",
        "title": "Quantitative Strategy Research, Derivatives & Risk Modeling",
        "description": "Design deterministic backtests, eliminate look-ahead bias, evaluate statistical metrics (Sharpe/Drawdown), and understand derivatives risk.",
        "difficulty": "advanced",
        "category": "Quantitative Finance",
        "estimated_hours": 4.0,
        "order": 3,
        "lessons": [
            {
                "slug": "backtesting-methodology-and-pitfalls",
                "title": "Quantitative Backtesting Methodology & Bias Prevention",
                "summary": "Build rigorous backtests that do not leak future information or overfit noise.",
                "duration_minutes": 40,
                "order": 1,
                "learning_objectives": [
                    "Identify and eliminate Look-Ahead Bias",
                    "Model realistic Indian slippage, STT, and exchange turnover fees",
                    "Evaluate Sharpe Ratio, Sortino Ratio, and Maximum Drawdown"
                ],
                "content_markdown": """# The Rigorous Science of Backtesting

A backtest is an educational simulation of how a systematic strategy rule would have executed on historical data.

### Critical Biases to Avoid:
1. **Look-Ahead Bias**: Using data at timestamp $t$ that was not yet known until $t+1$. In TradeWise, indicators computed at bar close execute orders on the next bar open.
2. **Survivorship Bias**: Backtesting only on currently surviving index constituents while ignoring delisted or failed companies.
3. **Overfitting / Data Snooping**: Testing 1,000 parameter variations on the same 2-year sample until one produces an artificially high Sharpe ratio.

### Real-World Indian Friction:
Any backtest ignoring transaction costs is invalid. TradeWise factors in:
- Brokerage (e.g. ₹20 or 0.03%)
- Securities Transaction Tax (STT @ 0.1%)
- Exchange turnover fees (0.00345%)
- GST (18%) and Stamp Duty (0.015%)
""",
                "quizzes": [
                    {
                        "question": "What is 'Look-Ahead Bias' in quantitative backtesting?",
                        "options": [
                            "Simulating trades with excessive leverage",
                            "Mistakenly using information in calculations that would not have been available at the simulated execution time",
                            "Testing on stocks that had splits",
                            "Using 1-minute data instead of daily data"
                        ],
                        "correct_option_index": 1,
                        "explanation": "Look-ahead bias introduces future knowledge into historical simulation steps, creating unrealistically high and unreplicable backtest returns."
                    }
                ]
            },
            {
                "slug": "futures-and-options-fundamentals",
                "title": "Futures, Options Mechanics & SEBI Risk Reality",
                "summary": "Understand derivative contracts, leverage mechanics, and why SEBI data shows 93% of retail F&O traders lose money.",
                "duration_minutes": 35,
                "order": 2,
                "learning_objectives": [
                    "Understand Futures contracts and margin leverage",
                    "Understand Call and Put options payoffs and time decay (Theta)",
                    "Internalize the SEBI empirical study on retail derivative losses"
                ],
                "content_markdown": """# Derivatives: Leverage, Greeks & Risk Reality

Equity derivatives are financial contracts whose value derives from an underlying stock or index (e.g., NIFTY 50 Futures).

### Key Features of Derivatives:
- **Leverage**: With ₹1.5 Lakh initial margin, you control a NIFTY lot worth over ₹12 Lakhs. Small underlying moves generate massive percentage gains or total capital wipes.
- **Zero-Sum Nature**: For every rupee gained by one counterparty, another loses a rupee (less brokerage, STT, and exchange charges).

### The SEBI Reality Check
In September 2024, SEBI published an empirical study examining retail traders across Indian brokers:
- **93% of individual retail F&O traders suffered net losses**.
- Over 90% of loss-makers lost an average of ₹1.2 Lakh each.
- Top institutional algorithmic prop desks capture the majority of net profits.

**TradeWise Rule**: Derivatives are advanced instruments designed for institutional risk hedging, not retail get-rich-quick gambles.
""",
                "quizzes": [
                    {
                        "question": "According to official SEBI research studies on Indian retail F&O trading, what percentage of individual retail traders incur net losses?",
                        "options": ["About 25%", "Around 50%", "Over 90% (93%)", "Less than 10%"],
                        "correct_option_index": 2,
                        "explanation": "SEBI's landmark empirical analysis showed that 93% of retail individual traders in equity F&O incurred net trading losses across FY22-FY24."
                    }
                ]
            }
        ]
    }
]

def seed_database(db: Session):
    """Seed initial courses, demo user, instruments, and demo paper account."""
    # Check if courses already exist
    if db.query(Course).first():
        return # Already seeded

    # 1. Seed demo user
    demo_user = User(
        email="demo@tradewise.in",
        hashed_password=hash_password("tradewise2026"),
        full_name="TradeWise Demo Student",
        role="student",
        is_active=True,
        is_verified=True
    )
    db.add(demo_user)
    db.flush()

    # 2. Seed paper trading account for demo user with ₹10 Lakh virtual balance
    paper_acc = PaperAccount(
        user_id=demo_user.id,
        account_number="TW-PAPER-10001",
        balance=1000000.0,
        initial_balance=1000000.0,
        realized_pnl=0.0
    )
    db.add(paper_acc)

    # 3. Seed instruments
    for inst in market_data_provider.get_instruments():
        instrument_obj = Instrument(
            symbol=inst["symbol"],
            name=inst["name"],
            exchange=inst["exchange"],
            segment=inst["segment"],
            sector=inst["sector"],
            tick_size=inst["tick_size"],
            lot_size=inst["lot_size"],
            last_price=inst["last_price"],
            change=inst["change"],
            change_pct=inst["change_pct"],
            volume=inst["volume"]
        )
        db.add(instrument_obj)

    # 4. Seed courses and lessons
    for c_data in COURSES_DATA:
        course = Course(
            slug=c_data["slug"],
            title=c_data["title"],
            description=c_data["description"],
            difficulty=c_data["difficulty"],
            category=c_data["category"],
            estimated_hours=c_data["estimated_hours"],
            order=c_data["order"]
        )
        db.add(course)
        db.flush()

        for l_data in c_data["lessons"]:
            lesson = Lesson(
                course_id=course.id,
                slug=l_data["slug"],
                title=l_data["title"],
                summary=l_data["summary"],
                duration_minutes=l_data["duration_minutes"],
                order=l_data["order"],
                learning_objectives=l_data["learning_objectives"],
                content_markdown=l_data["content_markdown"]
            )
            db.add(lesson)
            db.flush()

            for q_data in l_data["quizzes"]:
                quiz = Quiz(
                    lesson_id=lesson.id,
                    question=q_data["question"],
                    options=q_data["options"],
                    correct_option_index=q_data["correct_option_index"],
                    explanation=q_data["explanation"]
                )
                db.add(quiz)

    db.commit()
