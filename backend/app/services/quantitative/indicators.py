"""
Deterministic Technical Indicators Engine for TradeWise India.
All formulas are mathematically verifiable and implement standard quantitative specifications.
"""
from typing import List, Tuple
import numpy as np

def calculate_sma(prices: List[float], period: int) -> List[float]:
    """Calculate Simple Moving Average (SMA) of price series."""
    if len(prices) < period or period <= 0:
        return [float("nan")] * len(prices)
    
    sma = [float("nan")] * (period - 1)
    window_sum = sum(prices[:period])
    sma.append(window_sum / period)
    
    for i in range(period, len(prices)):
        window_sum += prices[i] - prices[i - period]
        sma.append(window_sum / period)
        
    return sma

def calculate_ema(prices: List[float], period: int) -> List[float]:
    """
    Calculate Exponential Moving Average (EMA).
    Multiplier: k = 2 / (period + 1)
    Initial value: SMA of the first `period` prices.
    """
    if len(prices) < period or period <= 0:
        return [float("nan")] * len(prices)
    
    ema = [float("nan")] * (period - 1)
    initial_sma = sum(prices[:period]) / period
    ema.append(initial_sma)
    
    k = 2.0 / (period + 1.0)
    current_ema = initial_sma
    
    for i in range(period, len(prices)):
        current_ema = (prices[i] * k) + (current_ema * (1.0 - k))
        ema.append(current_ema)
        
    return ema

def calculate_rsi(prices: List[float], period: int = 14) -> List[float]:
    """
    Calculate Wilder's Relative Strength Index (RSI).
    Standard 14-period RSI bounded between 0 and 100.
    """
    if len(prices) <= period or period <= 0:
        return [float("nan")] * len(prices)
        
    changes = [prices[i] - prices[i - 1] for i in range(1, len(prices))]
    gains = [max(0.0, c) for c in changes]
    losses = [max(0.0, -c) for c in changes]
    
    rsi = [float("nan")] * period
    
    avg_gain = sum(gains[:period]) / period
    avg_loss = sum(losses[:period]) / period
    
    if avg_loss == 0.0:
        rsi.append(100.0)
    else:
        rs = avg_gain / avg_loss
        rsi.append(100.0 - (100.0 / (1.0 + rs)))
        
    for i in range(period, len(changes)):
        avg_gain = (avg_gain * (period - 1) + gains[i]) / period
        avg_loss = (avg_loss * (period - 1) + losses[i]) / period
        
        if avg_loss == 0.0:
            rsi.append(100.0)
        else:
            rs = avg_gain / avg_loss
            rsi.append(100.0 - (100.0 / (1.0 + rs)))
            
    return rsi

def calculate_bollinger_bands(
    prices: List[float], period: int = 20, num_std: float = 2.0
) -> Tuple[List[float], List[float], List[float]]:
    """
    Calculate Bollinger Bands: (Middle Band / SMA, Upper Band, Lower Band).
    """
    sma = calculate_sma(prices, period)
    upper_band = [float("nan")] * len(prices)
    lower_band = [float("nan")] * len(prices)
    
    for i in range(period - 1, len(prices)):
        window = prices[i - period + 1 : i + 1]
        std_dev = float(np.std(window, ddof=0))
        upper_band[i] = sma[i] + (num_std * std_dev)
        lower_band[i] = sma[i] - (num_std * std_dev)
        
    return sma, upper_band, lower_band

def calculate_atr(
    highs: List[float], lows: List[float], closes: List[float], period: int = 14
) -> List[float]:
    """
    Calculate Average True Range (ATR).
    TR = max(high - low, abs(high - previous_close), abs(low - previous_close))
    """
    n = len(closes)
    if n < period or period <= 0:
        return [float("nan")] * n
        
    tr = [highs[0] - lows[0]]
    for i in range(1, n):
        tr.append(
            max(
                highs[i] - lows[i],
                abs(highs[i] - closes[i - 1]),
                abs(lows[i] - closes[i - 1])
            )
        )
        
    atr = [float("nan")] * (period - 1)
    initial_atr = sum(tr[:period]) / period
    atr.append(initial_atr)
    
    current_atr = initial_atr
    for i in range(period, n):
        current_atr = (current_atr * (period - 1) + tr[i]) / period
        atr.append(current_atr)
        
    return atr
