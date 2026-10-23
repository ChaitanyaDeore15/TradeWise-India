# Financial & Mathematical Formulations

## 1. Technical Indicators

### Simple Moving Average (SMA)
$$\text{SMA}_t(N) = \frac{1}{N} \sum_{i=0}^{N-1} P_{t-i}$$

### Exponential Moving Average (EMA)
$$k = \frac{2}{N + 1}$$
$$\text{EMA}_t = (P_t \times k) + (\text{EMA}_{t-1} \times (1 - k))$$
*Initial seed is the SMA of the first $N$ observations.*

### Relative Strength Index (RSI) - Wilder's Convention
$$\text{RS} = \frac{\text{Smoothed Average Gain}}{\text{Smoothed Average Loss}}$$
$$\text{RSI} = 100 - \frac{100}{1 + \text{RS}}$$

### Average True Range (ATR)
$$\text{TR}_t = \max(H_t - L_t, |H_t - C_{t-1}|, |L_t - C_{t-1}|)$$
$$\text{ATR}_t = \frac{\text{ATR}_{t-1} \times (N - 1) + \text{TR}_t}{N}$$

---

## 2. Risk Management Formulations

### Mathematical Position Sizing (Fixed Fractional / 1% Rule)
$$\text{Risk Amount (INR)} = \text{Capital} \times \left( \frac{\text{Risk \%}}{100} \right)$$
$$\text{Risk per Share} = |\text{Entry Price} - \text{Stop Loss Price}|$$
$$\text{Recommended Shares} = \left\lfloor \frac{\text{Risk Amount}}{\text{Risk per Share}} \right\rfloor$$

### Asymmetric Drawdown Recovery Law
If capital suffers a loss percentage $L$, the required subsequent percentage gain $G$ to break even is:
$$G = \left( \frac{L}{1 - L} \right) \times 100$$
*(e.g., $L = 50\% \implies G = \frac{0.5}{0.5} = 100\%$).*
