# Multi-Constraint Stock Portfolio Optimizer

> A production-grade academic project implementing **multi-constraint 0/1 Knapsack optimization** for risk-aware stock portfolio selection — with live market data, efficient frontier visualization, and full algorithm comparison.

**Stack:** FastAPI · React · Recharts · Alpha Vantage · Tailwind CSS  
**Version:** 2.1.0 · DAA Project

---

## What This Project Does

Classical knapsack only handles one constraint (budget). This project extends it to **two simultaneous constraints** — budget (W) and risk (R) — using a novel 2D Dynamic Programming approach:

```
dp[w][r] = maximum return achievable with budget ≤ w and risk ≤ r
```

This enables **exact optimal portfolio selection** under dual constraints, which no single-constraint algorithm can guarantee.

---

## Features

| Feature | Description |
|---|---|
| **5 Algorithms** | Brute Force, Greedy, Standard DP, Modified DP (2D), Branch & Bound |
| **Algorithm Comparison** | Side-by-side return, time, Sharpe ratio, optimality gap |
| **Live Market Data** | Real-time prices via Alpha Vantage API |
| **Efficient Frontier** | Pareto-optimal portfolio visualization |
| **Portfolio Analytics** | Sector allocation, risk contribution, Sharpe ratio |
| **Report Download** | Structured text report with all metrics |
| **Dark / Light Mode** | Full theme support |
| **CSV Export** | Export selected portfolio to CSV |

---

## Project Structure

```
Stock_Portfolio_knapsack/
├── backend/
│   ├── main.py                      # FastAPI entry point
│   ├── api/routes.py                # All REST endpoints
│   ├── models/stock.py              # Pydantic models
│   ├── services/
│   │   ├── runner.py                # Algorithm dispatcher + Sharpe/utilization
│   │   ├── market_data.py           # Alpha Vantage integration
│   │   └── cache.py                 # In-memory TTL cache
│   ├── algorithms/
│   │   ├── brute_force.py           # O(2^n)
│   │   ├── greedy.py                # O(n log n)
│   │   ├── dp_standard.py           # O(nW)
│   │   ├── dp_multiconstraint.py    # O(nWR) ← MAIN CONTRIBUTION
│   │   └── branch_bound.py          # Exponential (pruned)
│   └── utils/datasets.py            # Preset portfolios (5/20/50 stocks)
├── frontend/
│   └── src/
│       ├── App.jsx                  # Root + theme toggle
│       ├── api.js                   # Axios client
│       ├── pages/
│       │   ├── Dashboard.jsx        # Dataset mode
│       │   └── LivePortfolio.jsx    # Live market mode
│       ├── components/
│       │   ├── AlgorithmSelector.jsx
│       │   ├── ComparisonChart.jsx  # Return + Time + Sharpe charts
│       │   ├── EfficientFrontier.jsx
│       │   ├── MetricsPanel.jsx
│       │   ├── PortfolioInsights.jsx
│       │   ├── ResultCard.jsx
│       │   └── StockTable.jsx
│       └── index.css                # CSS variable theming
├── .env                             # API key (not committed)
├── .gitignore
├── requirements.txt
├── README.md
└── TECHNICAL_DOCUMENTATION.md
```

---

## Quick Start

### 1. Clone & Setup

```bash
git clone <repo-url>
cd Stock_Portfolio_knapsack
```

### 2. Backend

```bash
# Install Python dependencies
pip install -r requirements.txt

# Add your Alpha Vantage API key to .env
echo "ALPHA_VANTAGE_API_KEY=your_key_here" > .env

# Run from project ROOT (not from backend/)
python -m uvicorn backend.main:app --reload
```

Backend runs at: `http://localhost:8000`  
API docs at: `http://localhost:8000/docs`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/datasets` | List preset datasets |
| GET | `/api/datasets/{name}` | Get dataset (small/medium/large) |
| POST | `/api/run` | Run single algorithm |
| POST | `/api/compare` | Compare all algorithms |
| POST | `/api/live-portfolio` | Fetch live data + optimize |
| POST | `/api/efficient-frontier` | Generate efficient frontier |
| POST | `/api/report` | Generate structured report |
| GET | `/api/health` | Health check |

---

## Algorithm Summary

| Algorithm | Time | Space | Optimal | Notes |
|-----------|------|-------|---------|-------|
| Brute Force | O(2^n) | O(n) | ✓ | Feasible only for n ≤ 20 |
| Greedy | O(n log n) | O(n) | ✗ | Fast but suboptimal |
| Standard DP | O(nW) | O(W) | ✗ | Ignores risk in state |
| **Modified DP** | **O(nWR)** | **O(WR)** | **✓** | **Main contribution** |
| Branch & Bound | Exp (pruned) | O(n·2^n) | ✓ | Dual-constraint bounds |

---

## Environment Variables

Create a `.env` file in the project root:

```env
ALPHA_VANTAGE_API_KEY=your_api_key_here
```

Get a free key at [alphavantage.co](https://www.alphavantage.co/support/#api-key).  
Free tier: 5 requests/minute. Results are cached for 1 hour.

---

## Running Commands

```powershell
# Backend — always run from project root
python -m uvicorn backend.main:app --reload

# Frontend
cd frontend
npm run dev

# Build frontend for production
cd frontend
npm run build
```

---

## Academic Contribution

> "This project extends classical 0/1 knapsack into a multi-constraint optimization problem by incorporating risk as an additional dimension in dynamic programming (state: `dp[w][r]`), and introduces dual-constraint bounding in Branch & Bound, enabling exact optimal solutions under simultaneous budget and risk constraints."

The key insight: by adding risk as a second DP dimension, every state `dp[w][r]` represents a solution that respects **both** constraints simultaneously — something a 1D DP fundamentally cannot do.
