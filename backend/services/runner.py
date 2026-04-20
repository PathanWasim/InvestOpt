"""
Runner service — dispatches to the selected algorithm and
normalises the result into a consistent response shape.
"""
from typing import List
from backend.algorithms.brute_force import brute_force
from backend.algorithms.greedy import greedy
from backend.algorithms.dp_standard import dp_standard
from backend.algorithms.dp_multiconstraint import dp_multiconstraint
from backend.algorithms.branch_bound import branch_bound

ALGORITHM_MAP = {
    "brute":       (brute_force,        "Brute Force",                True),
    "greedy":      (greedy,             "Greedy (Ratio Sort)",        False),
    "dp":          (dp_standard,        "Standard DP (1D)",           False),
    "modified_dp": (dp_multiconstraint, "Modified DP (2D — Dual Constraint)", True),
    "bnb":         (branch_bound,       "Branch & Bound (Dual-Bounded)", True),
}


def run_algorithm(stocks: List[dict], budget: float, risk_limit: float, algorithm: str) -> dict:
    """Run a single algorithm and return result dict."""
    if algorithm not in ALGORITHM_MAP:
        raise ValueError(f"Unknown algorithm '{algorithm}'. Choose from: {list(ALGORITHM_MAP.keys())}")

    fn, display_name, is_opt_flag = ALGORITHM_MAP[algorithm]
    result = fn(stocks, budget, risk_limit)

    # Override is_optimal with our known flag (greedy/dp_standard are never optimal)
    result["is_optimal"] = is_opt_flag
    result["algorithm"] = algorithm
    result["display_name"] = display_name
    return result


def run_all_algorithms(stocks: List[dict], budget: float, risk_limit: float) -> List[dict]:
    """
    Run all algorithms in sequence.
    Brute force capped at 20 stocks to avoid extreme timeouts.
    """
    results = []
    n = len(stocks)

    for algo_key, (fn, display_name, is_opt_flag) in ALGORITHM_MAP.items():
        # Brute force is only feasible for small inputs
        if algo_key == "brute" and n > 20:
            results.append({
                "algorithm": algo_key,
                "display_name": display_name,
                "selected_stocks": [],
                "total_return": 0.0,
                "total_cost": 0.0,
                "total_risk": 0.0,
                "execution_time": -1.0,
                "is_optimal": True,
                "skipped": True,
                "skip_reason": f"Skipped: n={n} > 20 (would take too long)",
            })
            continue

        res = fn(stocks, budget, risk_limit)
        res["algorithm"] = algo_key
        res["display_name"] = display_name
        res["is_optimal"] = is_opt_flag
        res["skipped"] = False
        results.append(res)

    # Compute optimality gap relative to best known optimal
    optimal_return = max(
        r["total_return"] for r in results if r.get("is_optimal") and not r.get("skipped")
    ) if any(r.get("is_optimal") and not r.get("skipped") for r in results) else 0.0

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
