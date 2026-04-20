"""
Branch & Bound — with Dual-Constraint Fractional Relaxation
Uses a best-first search (max-heap via negation) with an upper-bound
function that considers BOTH remaining budget AND remaining risk.

ACADEMIC MODIFICATION:
Classical B&B for knapsack uses only budget in the upper bound.
This implementation computes a DUAL-CONSTRAINT fractional relaxation:
  - Sort remaining stocks by return/cost ratio
  - Greedily fill using both budget_remaining and risk_remaining
  - Take fractional portion of the blocking stock (LP relaxation)

This tighter upper bound leads to more aggressive pruning.

Time Complexity:  Exponential worst case, but much faster in practice
Space Complexity: O(n * 2^n) worst case branch nodes
"""
import time
import heapq


def _compute_upper_bound(
    idx: int,
    current_return: float,
    budget_remaining: float,
    risk_remaining: float,
    sorted_stocks: list,
) -> float:
    """
    Fractional relaxation upper bound considering BOTH constraints.
    Greedily picks fractional stocks by return/cost ratio until
    either budget or risk is exhausted.
    """
    bound = current_return
    bud = budget_remaining
    rsk = risk_remaining

    for i in range(idx, len(sorted_stocks)):
        s = sorted_stocks[i]
        if s["cost"] <= bud and s["risk"] <= rsk:
            bound += s["expected_return"]
            bud -= s["cost"]
            rsk -= s["risk"]
        else:
            # Fractional: take what we can (limited by tighter constraint)
            frac_by_budget = bud / s["cost"] if s["cost"] > 0 else 0
            frac_by_risk = rsk / s["risk"] if s["risk"] > 0 else 0
            frac = min(frac_by_budget, frac_by_risk)
            bound += frac * s["expected_return"]
            break

    return bound


def branch_bound(stocks: list, budget: float, risk_limit: float) -> dict:
    """
    Best-first Branch & Bound with dual-constraint fractional upper bound.

    Node state: (neg_upper_bound, level, current_return, budget_used,
                 risk_used, selected_indices)

    Pruning: A node is pruned if:
      1. Budget or risk is already violated, OR
      2. Upper bound ≤ current best (cannot improve)
    """
    start = time.perf_counter()
    n = len(stocks)

    # Sort by return/cost ratio for tighter upper bounds
    sorted_stocks = sorted(
        stocks,
        key=lambda s: s["expected_return"] / s["cost"],
        reverse=True,
    )

    best_return = 0.0
    best_selection = []
    nodes_explored = 0

    # Priority queue: (neg_upper_bound, level, ret, cost_used, risk_used, selected)
    initial_ub = _compute_upper_bound(0, 0.0, budget, risk_limit, sorted_stocks)
    heap = [(-initial_ub, 0, 0.0, 0.0, 0.0, [])]

    while heap:
        neg_ub, level, cur_ret, cur_cost, cur_risk, selected = heapq.heappop(heap)
        nodes_explored += 1

        # Prune: upper bound can't beat best
        if -neg_ub <= best_return:
            continue

        if level == n:
            if cur_ret > best_return:
                best_return = cur_ret
                best_selection = selected
            continue

        stock = sorted_stocks[level]

        # --- Branch: INCLUDE stock ---
        new_cost = cur_cost + stock["cost"]
        new_risk = cur_risk + stock["risk"]
        new_ret = cur_ret + stock["expected_return"]

        if new_cost <= budget and new_risk <= risk_limit:
            if new_ret > best_return:
                best_return = new_ret
                best_selection = selected + [stock]
            ub_include = _compute_upper_bound(
                level + 1, new_ret, budget - new_cost,
                risk_limit - new_risk, sorted_stocks
            )
            if ub_include > best_return:
                heapq.heappush(
                    heap,
                    (-ub_include, level + 1, new_ret,
                     new_cost, new_risk, selected + [stock])
                )

        # --- Branch: EXCLUDE stock ---
        ub_exclude = _compute_upper_bound(
            level + 1, cur_ret, budget - cur_cost,
            risk_limit - cur_risk, sorted_stocks
        )
        if ub_exclude > best_return:
            heapq.heappush(
                heap,
                (-ub_exclude, level + 1, cur_ret,
                 cur_cost, cur_risk, selected)
            )

    elapsed = (time.perf_counter() - start) * 1000

    total_cost = sum(s["cost"] for s in best_selection)
    total_risk = sum(s["risk"] for s in best_selection)

    return {
        "selected_stocks": best_selection,
        "total_return": best_return,
        "total_cost": total_cost,
        "total_risk": total_risk,
        "execution_time": elapsed,
        "is_optimal": True,
        "nodes_explored": nodes_explored,
    }
