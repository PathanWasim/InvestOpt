"""
Market Data Service — Alpha Vantage integration.
Fetches real-time daily price series and computes annualised return/risk/Sharpe.
Falls back gracefully with structured error on API failure.
"""
import os
import httpx
import numpy as np
from dotenv import load_dotenv
from backend.services import cache as _cache

load_dotenv()

API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY", "")
BASE_URL = "https://www.alphavantage.co/query"

SECTOR_MAP = {
    "AAPL": "Technology",  "MSFT": "Technology",  "GOOG": "Technology",
    "GOOGL": "Technology", "META": "Social Media", "NVDA": "Semiconductors",
    "AMD": "Semiconductors","INTC": "Semiconductors","ADBE": "Software",
    "CRM": "SaaS",         "TSLA": "EV",           "AMZN": "E-Commerce",
    "BABA": "E-Commerce",  "SHOP": "E-Commerce",   "JPM": "Finance",
    "GS": "Finance",       "MS": "Finance",         "V": "Finance",
    "PYPL": "Fintech",     "SQ": "Fintech",         "WMT": "Retail",
    "DIS": "Entertainment","NFLX": "Streaming",     "SPOT": "Streaming",
    "SNOW": "Cloud",       "NET": "Cybersecurity",  "OKTA": "Cybersecurity",
    "DDOG": "Cloud",       "TWLO": "Cloud",         "MDB": "Database",
    "PLTR": "Analytics",   "UBER": "Mobility",      "ZM": "SaaS",
    "DOCU": "SaaS",        "UNH": "Healthcare",     "LLY": "Pharma",
    "PFE": "Pharma",       "MRNA": "Biotech",       "BNTX": "Biotech",
    "XOM": "Energy",       "CVX": "Energy",         "NEE": "Utilities",
    "ENPH": "CleanEnergy", "BA": "Aerospace",       "LMT": "Defense",
    "RTX": "Defense",      "INFY": "Technology",    "TCS": "Technology",
    "RELIANCE": "Energy",  "COIN": "Fintech",       "HOOD": "Fintech",
}

# Risk-free rate assumption (annualised, e.g. 5% = 0.05)
RISK_FREE_RATE = 0.05


def fetch_time_series(symbol: str) -> dict:
    """
    Fetch daily time series from Alpha Vantage.
    Cached for 1 hour. Returns structured error dict on failure.
    """
    cache_key = f"ts:{symbol.upper()}"
    cached = _cache.get(cache_key)
    if cached:
        return cached

    if not API_KEY:
        raise ValueError("ALPHA_VANTAGE_API_KEY not set in environment.")

    params = {
        "function": "TIME_SERIES_DAILY",
        "symbol": symbol.upper(),
        "outputsize": "compact",
        "apikey": API_KEY,
    }

    try:
        with httpx.Client(timeout=15.0) as client:
            resp = client.get(BASE_URL, params=params)
            resp.raise_for_status()
            data = resp.json()
    except httpx.TimeoutException:
        raise ValueError(f"Request timed out for {symbol}. Try again.")
    except httpx.HTTPError as e:
        raise ValueError(f"HTTP error fetching {symbol}: {str(e)}")

    if "Error Message" in data:
        raise ValueError(f"Invalid symbol '{symbol}'. Check the ticker.")
    if "Note" in data:
        raise ValueError("Alpha Vantage rate limit reached (5 req/min). Wait 1 minute.")
    if "Information" in data:
        raise ValueError("Alpha Vantage daily limit reached. Results from cache or preset data.")
    if "Time Series (Daily)" not in data:
        raise ValueError(f"No price data returned for '{symbol}'.")

    _cache.set(cache_key, data)
    return data


def compute_metrics(time_series: dict) -> dict:
    """
    Compute annualised financial metrics from daily closing prices.

    Formulas (standard finance):
      daily_return_t  = (P_t - P_{t-1}) / P_{t-1}
      expected_return = mean(daily_returns) * 252          [annualised]
      volatility      = std(daily_returns)  * sqrt(252)    [annualised]
      sharpe_ratio    = (expected_return - risk_free) / volatility

    Returns percentages for expected_return and volatility.
    """
    ts_data = time_series.get("Time Series (Daily)", {})
    if not ts_data:
        raise ValueError("Empty time series data.")

    # Use last 60 trading days (≈ 3 months)
    sorted_dates = sorted(ts_data.keys(), reverse=True)[:61]
    if len(sorted_dates) < 5:
        raise ValueError("Insufficient price history (need at least 5 days).")

    closes = [float(ts_data[d]["4. close"]) for d in sorted_dates]
    closes.reverse()  # oldest → newest

    prices = np.array(closes)
    daily_returns = (prices[1:] - prices[:-1]) / prices[:-1]

    ann_return = float(np.mean(daily_returns) * 252)          # decimal
    ann_vol    = float(np.std(daily_returns, ddof=1) * np.sqrt(252))  # decimal
    sharpe     = (ann_return - RISK_FREE_RATE) / ann_vol if ann_vol > 0 else 0.0

    return {
        "latest_price":    round(float(prices[-1]), 2),
        "expected_return": round(ann_return * 100, 4),   # as %
        "risk":            round(ann_vol * 100, 4),       # as %
        "sharpe_ratio":    round(sharpe, 4),
        "daily_returns":   daily_returns.tolist(),
        "price_history":   closes,
    }


def build_stock_from_api(symbol: str, stock_id: int = 1) -> dict:
    """
    Fetch live data and return a Stock-compatible dict.
    cost  = latest_price / 10   (scaled to keep DP table manageable)
    return/risk are annualised percentages (already meaningful as knapsack values)
    """
    sym = symbol.upper().strip()
    ts  = fetch_time_series(sym)
    m   = compute_metrics(ts)

    cost       = round(max(m["latest_price"] / 10, 0.1), 2)
    exp_return = round(max(m["expected_return"], 0.1), 2)
    risk       = round(max(m["risk"], 0.1), 2)

    return {
        "id":              stock_id,
        "name":            sym,
        "cost":            cost,
        "expected_return": exp_return,
        "risk":            risk,
        "sector":          SECTOR_MAP.get(sym, "General"),
        "volatility":      risk,
        "sharpe_ratio":    m["sharpe_ratio"],
        "price_history":   m["price_history"],
    }
