"""
Runner service — dispatches to the selected algorithm and
normalises the result into a consistent, enriched response shape.
Adds: Sharpe ratio, constraint utilization, display metadata.
"""
from typing import List
from backend.algorithms.brute_force import brute_force
from backend.algorithms.greedy import greedy
from backend.algorithms.dp_standard import dp_standard
from backend.algorithms.dp_multiconstraint import dp_multiconstraint
from backend.algorithms.branch_bound import branch_bound

ALGORITHM_MAP = {
    "brute":       (brute_force,        "Brute Force",                        True),
    "greedy":      (greedy,             "Greedy (Ratio Sort)",                 False),
    "dp":          (dp_standard,        "Standard DP (1D)",                    False),
    "modified_dp": (dp_multiconstraint, "Modified DP (2D — Dual Constraint)",  True),
    "bnb":         (branch_bound,       "Branch & Bound (Dual-Bounded)",       True),
}

RISK_FREE_RATE = 0.05  # 5% annualised


def _enrich(result: dict, budget: float, risk_limit: float) -> dict:
    """Add Sharpe ratio and constraint utilization to any result dict."""
    ret  = result.get("total_return", 0.0)
    risk = result.get("total_risk",   0.0)
    cost = result.get("total_cost",   0.0)

    # Sharpe-like ratio: return / risk  (both in same units)
    result["sharpe_ratio"] = round(ret / risk, 4) if risk > 0 else 0.0

    # Constraint utilization (%)
    result["budget_utilization"] = round(cost / budget * 100, 2) if budget > 0 else 0.0
    result["risk_utilization"]   = round(risk / risk_limit * 100, 2) if risk_limit > 0 else 0.0

    return result


def run_algorithm(
    stocks: List[dict], budget: float, risk_limit: float, algorithm: str
) -> dict:
    if algorithm not in ALGORITHM_MAP:
        raise ValueError(
            f"Unknown algorithm '{algorithm}'. Choose from: {list(ALGORITHM_MAP.keys())}"
        )

    fn, display_name, is_opt_flag = ALGORITHM_MAP[algorithm]
    result = fn(stocks, budget, risk_limit)

    result["is_optimal"]   = is_opt_flag
    result["algorithm"]    = algorithm
    result["display_name"] = display_name

    return _enrich(result, budget, risk_limit)


def run_all_algorithms(
    stocks: List[dict], budget: float, risk_limit: float
) -> tuple:
    results = []
    n = len(stocks)

    for algo_key, (fn, display_name, is_opt_flag) in ALGORITHM_MAP.items():
        if algo_key == "brute" and n > 20:
            results.append({
                "algorithm":    algo_key,
                "display_name": display_name,
                "selected_stocks": [],
                "total_return": 0.0,
                "total_cost":   0.0,
                "total_risk":   0.0,
                "execution_time": -1.0,
                "is_optimal":   True,
                "skipped":      True,
                "skip_reason":  f"Skipped: n={n} > 20",
                "sharpe_ratio": 0.0,
                "budget_utilization": 0.0,
                "risk_utilization":   0.0,
            })
            continue

        res = fn(stocks, budget, risk_limit)
        res["algorithm"]    = algo_key
        res["display_name"] = display_name
        res["is_optimal"]   = is_opt_flag
        res["skipped"]      = False
        _enrich(res, budget, risk_limit)
        results.append(res)

    # Optimality gap
    optimal_return = max(
        (r["total_return"] for r in results if r.get("is_optimal") and not r.get("skipped")),
        default=0.0,
    )

    for r in results:
        if r.get("skipped"):
            r["optimality_gap"] = None
        elif optimal_return > 0:
            r["optimality_gap"] = round(
                (optimal_return - r["total_return"]) / optimal_return * 100, 2
            )
        else:
            r["optimality_gap"] = 0.0

    return results, optimal_return
