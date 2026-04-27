"""
FastAPI routes — REST API endpoints.
All results include: Sharpe ratio, constraint utilization, algorithm metadata.
"""
from fastapi import APIRouter, HTTPException
from typing import List

from backend.models.stock import (
    RunRequest, LivePortfolioRequest, EfficientFrontierRequest,
    RunResponse, CompareResponse, AlgorithmResult, Stock,
)
from backend.services.runner import run_algorithm, run_all_algorithms
from backend.utils.datasets import get_dataset, list_datasets

router = APIRouter()


# ─────────────────────────────────────────────
# Existing endpoints
# ─────────────────────────────────────────────

@router.get("/datasets")
def get_datasets():
    return {"datasets": list_datasets()}


@router.get("/datasets/{name}")
def get_dataset_by_name(name: str):
    try:
        return get_dataset(name)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/run")
def run_single(request: RunRequest):
    stocks_dict = [s.model_dump() for s in request.stocks]
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
    stocks_dict = [s.model_dump() for s in request.stocks]
    try:
        results, optimal_return = run_all_algorithms(
            stocks_dict, request.budget, request.risk_limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison error: {str(e)}")
    return {
        "results":        results,
        "optimal_return": optimal_return,
        "dataset_size":   len(request.stocks),
        "budget":         request.budget,
        "risk_limit":     request.risk_limit,
    }


@router.get("/health")
def health():
    return {"status": "ok", "message": "Knapsack Portfolio API is running", "version": "2.1.0"}


# ─────────────────────────────────────────────
# Live Portfolio
# ─────────────────────────────────────────────

@router.post("/live-portfolio")
def live_portfolio(request: LivePortfolioRequest):
    """
    Fetch real-time Alpha Vantage data for symbols, then run optimization.
    Supports single algorithm OR compare-all mode.
    Returns structured errors with fallback flag.
    """
    from backend.services.market_data import build_stock_from_api

    stocks, errors = [], []

    for idx, symbol in enumerate(request.symbols, start=1):
        sym = symbol.upper().strip()
        if not sym:
            continue
        try:
            stocks.append(build_stock_from_api(sym, stock_id=idx))
        except Exception as e:
            errors.append({
                "symbol":   sym,
                "error":    str(e),
                "fallback": "rate_limit" in str(e).lower() or "limit" in str(e).lower(),
            })

    if not stocks:
        detail = "No valid stocks fetched."
        if errors:
            detail += " " + "; ".join(f"{e['symbol']}: {e['error']}" for e in errors)
        raise HTTPException(status_code=422, detail=detail)

    # Compare-all mode
    if request.compare_all:
        try:
            results, optimal_return = run_all_algorithms(
                stocks, request.budget, request.risk_limit
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        return {
            "mode":           "compare",
            "results":        results,
            "optimal_return": optimal_return,
            "fetched_stocks": stocks,
            "fetch_errors":   errors,
            "dataset_size":   len(stocks),
            "budget":         request.budget,
            "risk_limit":     request.risk_limit,
        }

    # Single algorithm mode
    try:
        result = run_algorithm(stocks, request.budget, request.risk_limit, request.algorithm)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    result["fetch_errors"]   = errors
    result["fetched_stocks"] = stocks
    result["mode"]           = "single"
    return result


# ─────────────────────────────────────────────
# Efficient Frontier
# ─────────────────────────────────────────────

@router.post("/efficient-frontier")
def efficient_frontier(request: EfficientFrontierRequest):
    """
    Generate efficient frontier by running Modified DP across a grid of
    budget × risk combinations.

    Returns:
      - all_points:       every feasible (risk, return) point
      - efficient_points: non-dominated subset (Pareto front)
      - optimal_point:    highest Sharpe ratio on efficient frontier
    """
    from backend.algorithms.dp_multiconstraint import dp_multiconstraint

    stocks_dict = [s.model_dump() for s in request.stocks]
    if not stocks_dict:
        raise HTTPException(status_code=400, detail="No stocks provided.")

    max_risk = sum(s["risk"] for s in stocks_dict)
    n        = request.samples

    all_points: list = []
    seen: set = set()

    budget_steps = [request.budget * i / n for i in range(3, n + 1)]
    risk_steps   = [max_risk   * i / n for i in range(3, n + 1)]

    for b in budget_steps:
        for r in risk_steps:
            key = (round(b, 1), round(r, 1))
            if key in seen:
                continue
            seen.add(key)
            try:
                res = dp_multiconstraint(stocks_dict, b, r)
                if res["total_return"] > 0 and res["total_risk"] > 0:
                    sharpe = round(res["total_return"] / res["total_risk"], 4)
                    all_points.append({
                        "risk":         round(res["total_risk"],   2),
                        "return":       round(res["total_return"], 2),
                        "cost":         round(res["total_cost"],   2),
                        "stocks_count": len(res["selected_stocks"]),
                        "sharpe":       sharpe,
                        "is_dominated": False,
                        "is_efficient": False,
                        "is_optimal":   False,
                    })
            except Exception:
                continue

    if not all_points:
        return {"all_points": [], "efficient_points": [], "optimal_point": None, "total_points": 0}

    # ── Remove dominated portfolios ──
    # Portfolio A dominates B if: return_A >= return_B AND risk_A <= risk_B (strict in at least one)
    def is_dominated(p, others):
        for q in others:
            if q is p:
                continue
            if q["return"] >= p["return"] and q["risk"] <= p["risk"]:
                if q["return"] > p["return"] or q["risk"] < p["risk"]:
                    return True
        return False

    for p in all_points:
        p["is_dominated"] = is_dominated(p, all_points)

    efficient_points = [p for p in all_points if not p["is_dominated"]]
    for p in efficient_points:
        p["is_efficient"] = True

    # ── Optimal = highest Sharpe on efficient frontier ──
    if efficient_points:
        best = max(efficient_points, key=lambda p: p["sharpe"])
        best["is_optimal"] = True

    efficient_points.sort(key=lambda p: p["risk"])

    return {
        "all_points":      all_points,
        "efficient_points": efficient_points,
        "optimal_point":   next((p for p in efficient_points if p["is_optimal"]), None),
        "total_points":    len(all_points),
        "efficient_count": len(efficient_points),
    }


# ─────────────────────────────────────────────
# Report
# ─────────────────────────────────────────────

@router.post("/report")
def generate_report(request: RunRequest):
    """
    Run algorithm and return structured JSON report for PDF generation.
    Includes: Sharpe, constraint utilization, sector breakdown.
    """
    stocks_dict = [s.model_dump() for s in request.stocks]
    try:
        result = run_algorithm(
            stocks_dict, request.budget, request.risk_limit, request.algorithm
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    selected = result.get("selected_stocks", [])

    sector_counts: dict = {}
    for s in selected:
        sec = s.get("sector", "General")
        sector_counts[sec] = sector_counts.get(sec, 0) + 1

    return {
        "report": {
            "algorithm":           result.get("algorithm"),
            "display_name":        result.get("display_name"),
            "is_optimal":          result.get("is_optimal"),
            "total_return":        result.get("total_return"),
            "total_cost":          result.get("total_cost"),
            "total_risk":          result.get("total_risk"),
            "sharpe_ratio":        result.get("sharpe_ratio"),
            "execution_time_ms":   result.get("execution_time"),
            "budget_utilization":  result.get("budget_utilization"),
            "risk_utilization":    result.get("risk_utilization"),
            "stocks_selected":     len(selected),
            "budget":              request.budget,
            "risk_limit":          request.risk_limit,
            "sector_breakdown":    sector_counts,
            "selected_stocks":     selected,
        }
    }
