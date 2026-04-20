"""
Preset datasets for demonstration:
  - small  : 5 stocks  (ideal for brute force demo)
  - medium : 20 stocks (greedy failure easily visible)
  - large  : 50 stocks (shows DP/B&B superiority in speed)
"""

DATASETS = {
    "small": {
        "name": "Small Portfolio (5 Stocks)",
        "description": "Ideal for Brute Force comparison. Greedy failure is visible.",
        "budget": 100,
        "risk_limit": 30,
        "stocks": [
            {"id": 1, "name": "AAPL", "cost": 40, "expected_return": 60, "risk": 10, "sector": "Technology"},
            {"id": 2, "name": "TSLA", "cost": 30, "expected_return": 50, "risk": 20, "sector": "EV"},
            {"id": 3, "name": "MSFT", "cost": 50, "expected_return": 70, "risk": 15, "sector": "Technology"},
            {"id": 4, "name": "AMZN", "cost": 20, "expected_return": 40, "risk": 8,  "sector": "E-Commerce"},
            {"id": 5, "name": "GOOG", "cost": 35, "expected_return": 55, "risk": 12, "sector": "Technology"},
        ],
    },
    "medium": {
        "name": "Medium Portfolio (20 Stocks)",
        "description": "Greedy failure is prominent. DP/B&B show clear advantage.",
        "budget": 300,
        "risk_limit": 80,
        "stocks": [
            {"id": 1,  "name": "AAPL",  "cost": 40,  "expected_return": 60,  "risk": 10, "sector": "Technology"},
            {"id": 2,  "name": "TSLA",  "cost": 30,  "expected_return": 50,  "risk": 20, "sector": "EV"},
            {"id": 3,  "name": "MSFT",  "cost": 50,  "expected_return": 70,  "risk": 15, "sector": "Technology"},
            {"id": 4,  "name": "AMZN",  "cost": 20,  "expected_return": 40,  "risk": 8,  "sector": "E-Commerce"},
            {"id": 5,  "name": "GOOG",  "cost": 35,  "expected_return": 55,  "risk": 12, "sector": "Technology"},
            {"id": 6,  "name": "META",  "cost": 45,  "expected_return": 65,  "risk": 18, "sector": "Social Media"},
            {"id": 7,  "name": "NVDA",  "cost": 60,  "expected_return": 90,  "risk": 22, "sector": "Semiconductors"},
            {"id": 8,  "name": "JPM",   "cost": 25,  "expected_return": 35,  "risk": 6,  "sector": "Finance"},
            {"id": 9,  "name": "V",     "cost": 38,  "expected_return": 52,  "risk": 9,  "sector": "Finance"},
            {"id": 10, "name": "WMT",   "cost": 22,  "expected_return": 30,  "risk": 5,  "sector": "Retail"},
            {"id": 11, "name": "DIS",   "cost": 28,  "expected_return": 45,  "risk": 14, "sector": "Entertainment"},
            {"id": 12, "name": "NFLX",  "cost": 55,  "expected_return": 80,  "risk": 25, "sector": "Streaming"},
            {"id": 13, "name": "PYPL",  "cost": 18,  "expected_return": 28,  "risk": 7,  "sector": "Fintech"},
            {"id": 14, "name": "BABA",  "cost": 32,  "expected_return": 48,  "risk": 16, "sector": "E-Commerce"},
            {"id": 15, "name": "INTC",  "cost": 15,  "expected_return": 22,  "risk": 5,  "sector": "Semiconductors"},
            {"id": 16, "name": "AMD",   "cost": 42,  "expected_return": 68,  "risk": 20, "sector": "Semiconductors"},
            {"id": 17, "name": "ADBE",  "cost": 48,  "expected_return": 72,  "risk": 17, "sector": "Software"},
            {"id": 18, "name": "CRM",   "cost": 36,  "expected_return": 54,  "risk": 13, "sector": "SaaS"},
            {"id": 19, "name": "UBER",  "cost": 12,  "expected_return": 18,  "risk": 8,  "sector": "Mobility"},
            {"id": 20, "name": "SPOT",  "cost": 26,  "expected_return": 42,  "risk": 11, "sector": "Streaming"},
        ],
    },
    "large": {
        "name": "Large Portfolio (50 Stocks)",
        "description": "Brute force infeasible. DP & B&B shine. Greedy failure is dramatic.",
        "budget": 600,
        "risk_limit": 150,
        "stocks": [
            {"id": 1,  "name": "AAPL",  "cost": 40,  "expected_return": 60,  "risk": 10, "sector": "Technology"},
            {"id": 2,  "name": "TSLA",  "cost": 30,  "expected_return": 50,  "risk": 20, "sector": "EV"},
            {"id": 3,  "name": "MSFT",  "cost": 50,  "expected_return": 70,  "risk": 15, "sector": "Technology"},
            {"id": 4,  "name": "AMZN",  "cost": 20,  "expected_return": 40,  "risk": 8,  "sector": "E-Commerce"},
            {"id": 5,  "name": "GOOG",  "cost": 35,  "expected_return": 55,  "risk": 12, "sector": "Technology"},
            {"id": 6,  "name": "META",  "cost": 45,  "expected_return": 65,  "risk": 18, "sector": "Social Media"},
            {"id": 7,  "name": "NVDA",  "cost": 60,  "expected_return": 90,  "risk": 22, "sector": "Semiconductors"},
            {"id": 8,  "name": "JPM",   "cost": 25,  "expected_return": 35,  "risk": 6,  "sector": "Finance"},
            {"id": 9,  "name": "V",     "cost": 38,  "expected_return": 52,  "risk": 9,  "sector": "Finance"},
            {"id": 10, "name": "WMT",   "cost": 22,  "expected_return": 30,  "risk": 5,  "sector": "Retail"},
            {"id": 11, "name": "DIS",   "cost": 28,  "expected_return": 45,  "risk": 14, "sector": "Entertainment"},
            {"id": 12, "name": "NFLX",  "cost": 55,  "expected_return": 80,  "risk": 25, "sector": "Streaming"},
            {"id": 13, "name": "PYPL",  "cost": 18,  "expected_return": 28,  "risk": 7,  "sector": "Fintech"},
            {"id": 14, "name": "BABA",  "cost": 32,  "expected_return": 48,  "risk": 16, "sector": "E-Commerce"},
            {"id": 15, "name": "INTC",  "cost": 15,  "expected_return": 22,  "risk": 5,  "sector": "Semiconductors"},
            {"id": 16, "name": "AMD",   "cost": 42,  "expected_return": 68,  "risk": 20, "sector": "Semiconductors"},
            {"id": 17, "name": "ADBE",  "cost": 48,  "expected_return": 72,  "risk": 17, "sector": "Software"},
            {"id": 18, "name": "CRM",   "cost": 36,  "expected_return": 54,  "risk": 13, "sector": "SaaS"},
            {"id": 19, "name": "UBER",  "cost": 12,  "expected_return": 18,  "risk": 8,  "sector": "Mobility"},
            {"id": 20, "name": "SPOT",  "cost": 26,  "expected_return": 42,  "risk": 11, "sector": "Streaming"},
            {"id": 21, "name": "SNOW",  "cost": 52,  "expected_return": 75,  "risk": 24, "sector": "Cloud"},
            {"id": 22, "name": "PLTR",  "cost": 14,  "expected_return": 20,  "risk": 9,  "sector": "Analytics"},
            {"id": 23, "name": "SQ",    "cost": 22,  "expected_return": 36,  "risk": 12, "sector": "Fintech"},
            {"id": 24, "name": "SHOP",  "cost": 58,  "expected_return": 85,  "risk": 26, "sector": "E-Commerce"},
            {"id": 25, "name": "ZM",    "cost": 16,  "expected_return": 24,  "risk": 7,  "sector": "SaaS"},
            {"id": 26, "name": "DOCU",  "cost": 20,  "expected_return": 32,  "risk": 10, "sector": "SaaS"},
            {"id": 27, "name": "TWLO",  "cost": 24,  "expected_return": 38,  "risk": 13, "sector": "Cloud"},
            {"id": 28, "name": "NET",   "cost": 34,  "expected_return": 56,  "risk": 16, "sector": "Cybersecurity"},
            {"id": 29, "name": "OKTA",  "cost": 30,  "expected_return": 46,  "risk": 14, "sector": "Cybersecurity"},
            {"id": 30, "name": "DDOG",  "cost": 28,  "expected_return": 44,  "risk": 12, "sector": "Cloud"},
            {"id": 31, "name": "MDB",   "cost": 38,  "expected_return": 58,  "risk": 17, "sector": "Database"},
            {"id": 32, "name": "ESTC",  "cost": 18,  "expected_return": 28,  "risk": 8,  "sector": "Database"},
            {"id": 33, "name": "GTLB",  "cost": 26,  "expected_return": 40,  "risk": 11, "sector": "DevOps"},
            {"id": 34, "name": "HCP",   "cost": 10,  "expected_return": 16,  "risk": 4,  "sector": "Healthcare"},
            {"id": 35, "name": "UNH",   "cost": 46,  "expected_return": 64,  "risk": 13, "sector": "Healthcare"},
            {"id": 36, "name": "CVS",   "cost": 18,  "expected_return": 25,  "risk": 5,  "sector": "Healthcare"},
            {"id": 37, "name": "PFE",   "cost": 14,  "expected_return": 20,  "risk": 5,  "sector": "Pharma"},
            {"id": 38, "name": "MRNA",  "cost": 32,  "expected_return": 52,  "risk": 22, "sector": "Biotech"},
            {"id": 39, "name": "BNTX",  "cost": 28,  "expected_return": 44,  "risk": 18, "sector": "Biotech"},
            {"id": 40, "name": "LLY",   "cost": 55,  "expected_return": 78,  "risk": 14, "sector": "Pharma"},
            {"id": 41, "name": "XOM",   "cost": 20,  "expected_return": 28,  "risk": 8,  "sector": "Energy"},
            {"id": 42, "name": "CVX",   "cost": 24,  "expected_return": 34,  "risk": 9,  "sector": "Energy"},
            {"id": 43, "name": "NEE",   "cost": 30,  "expected_return": 42,  "risk": 7,  "sector": "Utilities"},
            {"id": 44, "name": "ENPH",  "cost": 36,  "expected_return": 56,  "risk": 19, "sector": "CleanEnergy"},
            {"id": 45, "name": "FSLR",  "cost": 26,  "expected_return": 40,  "risk": 15, "sector": "CleanEnergy"},
            {"id": 46, "name": "BA",    "cost": 44,  "expected_return": 62,  "risk": 20, "sector": "Aerospace"},
            {"id": 47, "name": "LMT",   "cost": 50,  "expected_return": 70,  "risk": 11, "sector": "Defense"},
            {"id": 48, "name": "RTX",   "cost": 32,  "expected_return": 46,  "risk": 9,  "sector": "Defense"},
            {"id": 49, "name": "GS",    "cost": 42,  "expected_return": 60,  "risk": 15, "sector": "Finance"},
            {"id": 50, "name": "MS",    "cost": 38,  "expected_return": 54,  "risk": 13, "sector": "Finance"},
        ],
    },
}


def get_dataset(name: str) -> dict:
    if name not in DATASETS:
        raise ValueError(f"Dataset '{name}' not found. Choose from: {list(DATASETS.keys())}")
    return DATASETS[name]


def list_datasets() -> list:
    return [
        {
            "key": k,
            "name": v["name"],
            "description": v["description"],
            "stock_count": len(v["stocks"]),
            "budget": v["budget"],
            "risk_limit": v["risk_limit"],
        }
        for k, v in DATASETS.items()
    ]
