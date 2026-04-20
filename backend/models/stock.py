"""
Pydantic models for the Stock Portfolio Knapsack system.
"""
from pydantic import BaseModel, Field
from typing import List, Optional


class Stock(BaseModel):
    id: int
    name: str
    cost: float = Field(..., gt=0, description="Cost / investment required")
    expected_return: float = Field(..., gt=0, description="Expected return value")
    risk: float = Field(..., gt=0, description="Risk score (lower is safer)")
    sector: Optional[str] = "General"


class RunRequest(BaseModel):
    stocks: List[Stock]
    budget: float = Field(..., gt=0, description="Total budget (W)")
    risk_limit: float = Field(..., gt=0, description="Maximum total risk (R)")
    algorithm: str = Field(
        ...,
        description="One of: brute | greedy | dp | bnb | modified_dp",
    )


class RunResponse(BaseModel):
    selected_stocks: List[Stock]
    total_return: float
    total_cost: float
    total_risk: float
    execution_time: float  # in milliseconds
    is_optimal: bool
    algorithm: str
    nodes_explored: Optional[int] = None  # for B&B
    dp_table_size: Optional[int] = None   # for DP


class AlgorithmResult(BaseModel):
    algorithm: str
    display_name: str
    selected_stocks: List[Stock]
    total_return: float
    total_cost: float
    total_risk: float
    execution_time: float
    is_optimal: bool
    optimality_gap: float = 0.0   # percentage difference from optimal
    nodes_explored: Optional[int] = None


class CompareResponse(BaseModel):
    results: List[AlgorithmResult]
    optimal_return: float
    dataset_size: int
    budget: float
    risk_limit: float
