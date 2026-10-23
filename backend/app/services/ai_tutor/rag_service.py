"""
AI Finance Tutor & Grounded RAG Engine for TradeWise India.
Provides factual explanations backed by official SEBI, NSE, and RBI educational literature.
Never predicts prices, never offers personalized investment advice, and cites exact references.
"""
from typing import Dict, Any, List

EDUCATIONAL_CORPUS = [
    {
        "keywords": ["settlement", "t+1", "demat", "payout", "clearing"],
        "title": "Indian Market Settlement Cycle (T+1 / T+0)",
        "source": "NSE & BSE Master Operational Circular (2024)",
        "citation": "SEBI Circular SEBI/HO/MRD/MRD-PoD-1/P/CIR/2021/687",
        "content": (
            "Indian equities operate on a mandatory T+1 rolling settlement cycle across NSE and BSE. "
            "When you purchase shares on Monday (T), delivery into your Demat account occurs by Tuesday evening (T+1). "
            "Clearing corporations (NSE Clearing Ltd and Indian Clearing Corporation Ltd) act as central counterparty guarantees."
        ),
        "recommended_lesson_slug": "indian-market-structure"
    },
    {
        "keywords": ["f&o", "futures", "options", "derivatives", "loss", "sebi study"],
        "title": "SEBI Study on Retail Participation in Derivatives (F&O)",
        "source": "Securities and Exchange Board of India (SEBI) Research Report",
        "citation": "SEBI Consultation Paper on Derivatives Risk Disclosures (Sept 2024)",
        "content": (
            "A comprehensive study by SEBI revealed that 93% of individual retail traders in equity Futures & Options (F&O) "
            "incurred net trading losses over the FY22-FY24 period, with average losses exceeding ₹1.2 Lakh per trader including transaction costs. "
            "Derivatives are leveraged zero-sum instruments with asymmetric downside; they should be treated strictly as hedging tools."
        ),
        "recommended_lesson_slug": "futures-and-options-fundamentals"
    },
    {
        "keywords": ["pe ratio", "p/e", "valuation", "fundamental", "roe", "debt"],
        "title": "Principles of Equity Valuation & Financial Ratios",
        "source": "SEBI Investor Education / Zerodha Varsity Module 3",
        "citation": "NSE Academy Financial Literacy Series, Chapter 4",
        "content": (
            "The Price-to-Earnings (P/E) ratio compares a company's market stock price to its earnings per share (EPS). "
            "A high P/E indicates high future growth expectations or potential overvaluation. "
            "Institutional analysts compare P/E against historical 5-year averages, sector medians, and Return on Equity (ROE)."
        ),
        "recommended_lesson_slug": "fundamental-analysis-basics"
    },
    {
        "keywords": ["rsi", "relative strength index", "overbought", "oversold", "indicator"],
        "title": "Relative Strength Index (RSI) Mechanics",
        "source": "J. Welles Wilder (1978) / Technical Analysis Education",
        "citation": "Technical Analysis of the Financial Markets, Chapter 10",
        "content": (
            "RSI is a momentum oscillator measured on a scale of 0 to 100. Values above 70 typically indicate overbought conditions, "
            "while values below 30 indicate oversold conditions. In strong bull regimes, RSI can remain sustained above 70 for extended intervals; "
            "thus, divergence and trend alignment must be used rather than naive contrarian fading."
        ),
        "recommended_lesson_slug": "technical-indicators-mastery"
    },
    {
        "keywords": ["look-ahead bias", "overfitting", "backtesting", "survivorship bias", "quantitative"],
        "title": "Quantitative Backtesting Pitfalls & Research Rigor",
        "source": "Quantitative Finance & Algorithmic Trading Standards",
        "citation": "Marcos Lopez de Prado, Advances in Financial Machine Learning",
        "content": (
            "Look-ahead bias occurs when future data is mistakenly utilized during historical backtests (e.g. executing on day T using day T close). "
            "TradeWise backtesting strictly enforces execution on subsequent bar intervals (T+1 open) with modeled Indian transaction slippage, "
            "STT, and exchange turnover levies to prevent overfitting."
        ),
        "recommended_lesson_slug": "backtesting-methodology-and-pitfalls"
    },
    {
        "keywords": ["tax", "stcg", "ltcg", "capital gains", "budget"],
        "title": "Indian Equity Taxation (Finance Act 2024)",
        "source": "Income Tax Department of India & Union Budget 2024",
        "citation": "Income Tax Act, Section 111A and Section 112A",
        "content": (
            "Under current Indian tax provisions: Short-Term Capital Gains (STCG) on listed equity held under 12 months are taxed at 20%. "
            "Long-Term Capital Gains (LTCG) on listed equity held over 12 months are taxed at 12.5% on gains exceeding the ₹1.25 Lakh annual exemption limit. "
            "Securities Transaction Tax (STT) must have been paid on purchase and sale."
        ),
        "recommended_lesson_slug": "risk-and-return-fundamentals"
    }
]

class AITutorService:
    def answer_query(self, user_query: str) -> Dict[str, Any]:
        """
        Retrieves matching verified corpus documents and composes an objective educational response.
        Appends mandatory citations, recommended lessons, and statutory risk warnings.
        """
        query_lower = user_query.lower()
        matched_docs = []
        
        for doc in EDUCATIONAL_CORPUS:
            score = sum(1 for kw in doc["keywords"] if kw in query_lower)
            if score > 0:
                matched_docs.append((score, doc))
                
        # Sort by relevance score
        matched_docs.sort(key=lambda x: x[0], reverse=True)
        
        if matched_docs:
            top_doc = matched_docs[0][1]
            answer = (
                f"### {top_doc['title']}\n\n"
                f"{top_doc['content']}\n\n"
                f"**Practical Application in TradeWise:**\n"
                f"You can explore this concept in depth through our interactive simulator or backtesting lab to evaluate how these rules behave across market cycles."
            )
            citations = [
                {"source": top_doc["source"], "reference": top_doc["citation"]}
            ]
            recommended = [
                {"slug": top_doc["recommended_lesson_slug"], "title": top_doc["title"]}
            ]
        else:
            # Fallback educational explanation
            answer = (
                f"Regarding your query on '{user_query}':\n\n"
                "In systematic financial markets, disciplined decision-making relies on formulating testable hypotheses, "
                "evaluating historical data without look-ahead bias, understanding market structure (NSE/BSE), and enforcing strict risk management. "
                "You can inspect verified curriculum lessons in the Trading Academy or test indicator rules in the Strategy Lab."
            )
            citations = [
                {"source": "National Stock Exchange of India (NSE) Education", "reference": "SEBI Investor Charter"}
            ]
            recommended = [
                {"slug": "indian-market-structure", "title": "Indian Stock Market Structure & NSE/BSE Fundamentals"}
            ]

        disclaimer = (
            "TradeWise AI Finance Tutor provides educational information only. "
            "It does not provide investment advice, stock recommendations, or price targets. "
            "All financial concepts should be verified with official SEBI/NSE publications."
        )

        return {
            "answer": answer,
            "citations": citations,
            "recommended_lessons": recommended,
            "disclaimer": disclaimer
        }

ai_tutor_service = AITutorService()
