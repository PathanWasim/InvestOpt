"""
FastAPI routes — REST API endpoints.
"""
from fastapi import APIRouter, HTTPException
from typing import List
from backend.models.stock import RunRequest, RunResponse, CompareResponse, AlgorithmResult
from backend.services.runner import run_algorithm, run_all_algorithms
from backend.utils.datasets import get_dataset, list_datasets

router = APIRouter()


@router.get("/datasets")
def get_datasets():
    """Return available preset datasets."""
    return {"datasets": list_datasets()}


@router.get("/datasets/{name}")
def get_dataset_by_name(name: str):
    """Return a specific preset dataset."""
    try:
        data = get_dataset(name)
        return data
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/run")
def run_single(request: RunRequest):
    """
    Run a single algorithm on the provided stocks.

    Algorithm choices:
      - brute       : Brute Force O(2^n)
      - greedy      : Greedy by ratio O(n log n)
      - dp          : Standard DP O(nW)
      - modified_dp : 2D DP O(nWR) [MAIN CONTRIBUTION]
      - bnb         : Branch & Bound (dual-constraint)
    """
    stocks_dict = [s.dict() for s in request.stocks]
    try:
        result = run_algorithm(
            stocks_dict, request.budget, request.risk_limit, request.algorithm
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Algorithm error: {str(e)}")

    return result


@router.post("/compare")
def compare_all(request: RunRequest):
    """
    Run ALL algorithms and return comparison including optimality gaps.
    Brute Force is auto-skipped for n > 20.
    """
    stocks_dict = [s.dict() for s in request.stocks]
    try:
        results, optimal_return = run_all_algorithms(
            stocks_dict, request.budget, request.risk_limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison error: {str(e)}")

    return {
        "results": results,
        "optimal_return": optimal_return,
        "dataset_size": len(request.stocks),
        "budget": request.budget,
        "risk_limit": request.risk_limit,
    }


@router.get("/health")
def health():
    return {"status": "ok", "message": "Knapsack Portfolio API is running"}
