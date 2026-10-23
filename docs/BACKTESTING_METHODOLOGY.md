# Quantitative Backtesting Methodology

## 1. Zero Look-Ahead Bias Guarantee
In naive or fraudulent backtesting systems, decisions at bar $t$ mistakenly use information generated at bar $t$ (such as the closing price) to execute trades at the exact same bar $t$ close.

**TradeWise Execution Convention:**
1. At bar $t$ close, all indicators (SMA, EMA, RSI) are computed using information up to and including $t$.
2. The trade order is generated at bar $t$ close.
3. Execution occurs at bar $t+1$ with simulated **slippage** applied to the price.

---

## 2. Indian Statutory & Regulatory Cost Model
A strategy that appears profitable before transaction friction frequently generates net losses after accounting for Indian taxes. TradeWise explicitly deducts:

| Charge | Statutory Basis | Rate Applied in Simulation |
| :--- | :--- | :--- |
| **Brokerage** | Indian Discount Broker Model | $\min(₹20, \text{Turnover} \times 0.03\%)$ |
| **STT (Securities Transaction Tax)** | Central Govt Levy | $0.1\%$ on Delivery Buy and Sell |
| **Exchange Turnover Charges** | NSE / BSE Tariff | $0.00345\%$ |
| **GST** | Central Goods & Services Tax | $18\%$ on (Brokerage + Exchange Charges) |
| **Stamp Duty** | Indian Stamp Act | $0.015\%$ on Buy side only |
| **Execution Slippage** | Liquidity & Market Impact | $0.05\%$ default (configurable) |

---

## 3. Quantitative Performance Metrics

### Total Net Return (%)
$$\text{Total Return} = \frac{\text{Final Equity} - \text{Initial Capital}}{\text{Initial Capital}} \times 100$$

### Compound Annual Growth Rate (CAGR %)
$$\text{CAGR} = \left( \frac{\text{Final Equity}}{\text{Initial Capital}} \right)^{\frac{1}{\text{Years}}} - 1$$
*(Calculated assuming 252 Indian trading sessions per year).*

### Maximum Drawdown (MDD %)
$$\text{Drawdown}_t = \frac{\text{Peak}_t - \text{Equity}_t}{\text{Peak}_t} \times 100, \quad \text{MDD} = \max_t(\text{Drawdown}_t)$$

### Annualized Sharpe Ratio
$$\text{Sharpe} = \frac{\text{Mean}(\text{Daily Returns} - R_f)}{\text{Std}(\text{Daily Returns})} \times \sqrt{252}$$
*(Where $R_f$ defaults to 6.5%, reflecting the prevailing RBI 91-day Treasury Bill rate).*

### Sortino Ratio
Focuses strictly on downside volatility:
$$\text{Sortino} = \frac{\text{Mean}(\text{Daily Returns} - R_f)}{\text{Std}(\text{Negative Excess Returns})} \times \sqrt{252}$$
