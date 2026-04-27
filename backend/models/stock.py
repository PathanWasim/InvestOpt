"""
Pydantic models for the Stock Portfolio Knapsack system.
"""
from pydantic import BaseModel, Field
from typing import List, Optional


class Stock(BaseModel):
    id: int
    name: str
    cost: float = Field(..., gt=0)
    expected_return: float = Field(..., gt=0)
    risk: float = Field(..., gt=0)
    sector: Optional[str] = "General"
    volatility: Optional[float] = None
    sharpe_ratio: Optional[float] = None


class RunRequest(BaseModel):
    stocks: List[Stock]
    budget: float = Field(..., gt=0)
    risk_limit: float = Field(..., gt=0)
    algorithm: str = Field(..., description="brute | greedy | dp | bnb | modified_dp")


class LivePortfolioRequest(BaseModel):
    symbols: List[str]
    budget: float = Field(..., gt=0)
    risk_limit: float = Field(..., gt=0)
    algorithm: str = Field(default="modified_dp")
    compare_all: bool = Field(default=False)


class EfficientFrontierRequest(BaseModel):
    stocks: List[Stock]
    budget: float = Field(..., gt=0)
    samples: int = Field(default=50, ge=10, le=150)


class RunResponse(BaseModel):
    selected_stocks: List[Stock]
    total_return: float
    total_cost: float
    total_risk: float
    execution_time: float
    is_optimal: bool
    algorithm: str
    sharpe_ratio: Optional[float] = None
    budget_utilization: Optional[float] = None
    risk_utilization: Optional[float] = None
    nodes_explored: Optional[int] = None
    dp_table_size: Optional[int] = None


class AlgorithmResult(BaseModel):
    algorithm: str
    display_name: str
    selected_stocks: List[Stock]
    total_return: float
    total_cost: float
    total_risk: float
    execution_time: float
    is_optimal: bool
    optimality_gap: float = 0.0
    sharpe_ratio: Optional[float] = None
    budget_utilization: Optional[float] = None
    risk_utilization: Optional[float] = None
    nodes_explored: Optional[int] = None


class CompareResponse(BaseModel):
    results: List[AlgorithmResult]
    optimal_return: float
    dataset_size: int
    budget: float
    risk_limit: float
