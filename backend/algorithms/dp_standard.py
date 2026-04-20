"""
Standard 1D Dynamic Programming — O(n * W)
Classical 0/1 Knapsack DP using only the budget constraint.
Risk constraint is enforced as a post-filter only (not in DP state).

PURPOSE: Demonstrates why a single-constraint DP is INSUFFICIENT
for the multi-constraint problem. Used for comparison / academic discussion.
"""
import time


def dp_standard(stocks: list, budget: float, risk_limit: float) -> dict:
    """
    Standard 0/1 Knapsack DP on budget dimension only.

    State:  dp[w] = max return achievable with exactly cost w used
    Transition: dp[w] = max(dp[w], dp[w - cost_i] + return_i)
    
    Time Complexity:  O(n * W)   where W = budget (integer-scaled)
    Space Complexity: O(W)

    NOTE: Stocks that violate risk_limit individually are skipped.
          However the DP does NOT track cumulative risk — this means
          the final selection MAY violate the total risk constraint.
          The result is therefore filtered and adjusted post-hoc,
          which is academically suboptimal compared to modified_dp.
    """
    start = time.perf_counter()

    # Scale to integers for DP table indexing
    scale = 10
    W = int(budget * scale)

    # dp[w] = (max_return, [selected indices])
    dp_return = [0.0] * (W + 1)
    dp_chosen = [[] for _ in range(W + 1)]

    for i, stock in enumerate(stocks):
        c = int(stock["cost"] * scale)
        r = stock["expected_return"]

        # Skip stocks that individually violate risk (opportunistic filter)
        if stock["risk"] > risk_limit:
            continue

        # Reverse iteration — ensures each stock is used at most once (0/1)
        for w in range(W, c - 1, -1):
            candidate = dp_return[w - c] + r
            if candidate > dp_return[w]:
                dp_return[w] = candidate
                dp_chosen[w] = dp_chosen[w - c] + [i]

    # Extract best solution that also respects risk limit
    best_return = 0.0
    best_w = 0
    for w in range(W + 1):
        indices = dp_chosen[w]
        total_risk = sum(stocks[i]["risk"] for i in indices)
        if dp_return[w] > best_return and total_risk <= risk_limit:
            best_return = dp_return[w]
            best_w = w

    best_indices = dp_chosen[best_w]
    selected = [stocks[i] for i in best_indices]
    total_cost = sum(s["cost"] for s in selected)
    total_risk = sum(s["risk"] for s in selected)

    elapsed = (time.perf_counter() - start) * 1000

    return {
        "selected_stocks": selected,
        "total_return": best_return,
        "total_cost": total_cost,
        "total_risk": total_risk,
        "execution_time": elapsed,
        "is_optimal": False,   # NOT optimal — ignores risk in DP state
        "dp_table_size": W + 1,
    }
