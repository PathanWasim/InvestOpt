"""
FastAPI application entry point.
"""
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import router

app = FastAPI(
    title="Stock Portfolio Knapsack API",
    description=(
        "Multi-Constraint 0/1 Knapsack Optimization for Risk-Aware Stock Portfolio Selection. "
        "Implements Brute Force, Greedy, Standard DP, Branch & Bound, "
        "and the novel Modified Multi-Constraint DP (O(nWR)). "
        "Supports live market data via Alpha Vantage, Efficient Frontier, and Portfolio Analytics."
    ),
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/")
def root():
    return {
        "project": "Multi-Constraint Knapsack Stock Portfolio",
        "version": "2.0.0",
        "docs": "/docs",
        "api_prefix": "/api",
        "features": ["live-portfolio", "efficient-frontier", "report", "compare"],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
