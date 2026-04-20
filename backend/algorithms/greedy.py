"""
Greedy Algorithm — O(n log n)
Sorts stocks by return/cost ratio (profit density) and greedily selects
the most "efficient" stocks until constraints are hit.

KNOWN LIMITATION:
This greedy heuristic does NOT guarantee an optimal solution.
It can fail significantly in scenarios where:
- A high-ratio cheap stock is selected but blocks a high-total-return combo
- Risk constraint causes early termination

This failure is DEMONSTRATED for academic comparison.
"""
import time


def greedy(stocks: list, budget: float, risk_limit: float) -> dict:
    """
    Greedy selection by descending return/cost ratio.

    Time Complexity: O(n log n)
    Space Complexity: O(n)

    NOT guaranteed optimal — used for comparison to demonstrate greedy failure.
    """
    start = time.perf_counter()

    # Sort by return/cost ratio (profit density) descending
    sorted_stocks = sorted(
        stocks,
        key=lambda s: s["expected_return"] / s["cost"],
        reverse=True,
    )

    selected = []
    total_cost = 0.0
    total_risk = 0.0
    total_return = 0.0

    for stock in sorted_stocks:
        if (total_cost + stock["cost"] <= budget and
                total_risk + stock["risk"] <= risk_limit):
            selected.append(stock)
            total_cost += stock["cost"]
            total_risk += stock["risk"]
            total_return += stock["expected_return"]

    elapsed = (time.perf_counter() - start) * 1000

    return {
        "selected_stocks": selected,
        "total_return": total_return,
        "total_cost": total_cost,
        "total_risk": total_risk,
        "execution_time": elapsed,
        "is_optimal": False,
        "nodes_explored": len(stocks),
    }
