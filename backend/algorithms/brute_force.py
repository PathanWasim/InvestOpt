"""
Brute Force Algorithm — O(2^n)
Enumerates all 2^n subsets and picks the one with maximum return
that satisfies both budget and risk constraints.
"""
import time
from typing import List, Tuple


def brute_force(stocks: list, budget: float, risk_limit: float) -> dict:
    """
    Exhaustive search over all subsets.

    Time Complexity: O(2^n)
    Space Complexity: O(n)

    Returns the globally optimal solution by checking every combination.
    """
    n = len(stocks)
    best_return = 0.0
    best_cost = 0.0
    best_risk = 0.0
    best_subset = []
    nodes_explored = 0

    start = time.perf_counter()

    for mask in range(1 << n):
        total_cost = 0.0
        total_risk = 0.0
        total_return = 0.0
        subset = []
        nodes_explored += 1

        for i in range(n):
            if mask & (1 << i):
                total_cost += stocks[i]["cost"]
                total_risk += stocks[i]["risk"]
                total_return += stocks[i]["expected_return"]
                subset.append(stocks[i])

        if total_cost <= budget and total_risk <= risk_limit:
            if total_return > best_return:
                best_return = total_return
                best_cost = total_cost
                best_risk = total_risk
                best_subset = subset

    elapsed = (time.perf_counter() - start) * 1000  # ms

    return {
        "selected_stocks": best_subset,
        "total_return": best_return,
        "total_cost": best_cost,
        "total_risk": best_risk,
        "execution_time": elapsed,
        "is_optimal": True,
        "nodes_explored": nodes_explored,
    }
