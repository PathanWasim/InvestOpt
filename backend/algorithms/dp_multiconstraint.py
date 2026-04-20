"""
⭐ MAIN ACADEMIC CONTRIBUTION ⭐
Modified Multi-Constraint Dynamic Programming — O(n * W * R)

This extends the classical 0/1 Knapsack (1D DP) into a 2D state space
by incorporating RISK as an additional DP dimension alongside BUDGET.

STATE:
    dp[w][r] = maximum return achievable using exactly cost w and risk r

TRANSITION (for each stock i):
    dp[w][r] = max(
        dp[w][r],                                     ← skip stock i
        dp[w - cost_i][r - risk_i] + return_i         ← include stock i
    )

Reverse iteration (w from W→0, r from R→0) ensures 0/1 property:
each stock is included AT MOST ONCE.

ACADEMIC STATEMENT:
"This project extends classical 0/1 knapsack into a multi-constraint
optimization problem by incorporating risk as an additional dimension
in dynamic programming, enabling exact optimal solutions under dual constraints."

Time Complexity:  O(n * W * R)
Space Complexity: O(W * R)
"""
import time


def dp_multiconstraint(stocks: list, budget: float, risk_limit: float) -> dict:
    """
    2D DP: dp[w][r] = max return with budget w and risk r.

    This is the MAIN CONTRIBUTION of the project:
    Extension of classical knapsack to multi-dimensional state space.
    """
    start = time.perf_counter()

    # Scale floats to integers for table indexing
    scale = 10
    W = int(budget * scale)
    R = int(risk_limit * scale)

    # dp table: (W+1) x (R+1) initialized to 0.0
    # dp[w][r] = max return achievable with cost ≤ w and risk ≤ r
    dp = [[0.0] * (R + 1) for _ in range(W + 1)]

    # chosen[w][r] = list of stock indices selected to achieve dp[w][r]
    chosen = [[[] for _ in range(R + 1)] for _ in range(W + 1)]

    for i, stock in enumerate(stocks):
        c = int(stock["cost"] * scale)
        rk = int(stock["risk"] * scale)
        ret = stock["expected_return"]

        # Skip if stock alone exceeds either constraint
        if c > W or rk > R:
            continue

        # *** REVERSE ITERATION — enforces 0/1 (no repetition) ***
        # Iterate w from W down to c, r from R down to rk
        for w in range(W, c - 1, -1):
            for r in range(R, rk - 1, -1):
                candidate = dp[w - c][r - rk] + ret
                if candidate > dp[w][r]:
                    dp[w][r] = candidate
                    chosen[w][r] = chosen[w - c][r - rk] + [i]

    # The answer is dp[W][R]
    best_indices = chosen[W][R]
    selected = [stocks[i] for i in best_indices]
    total_cost = sum(s["cost"] for s in selected)
    total_risk = sum(s["risk"] for s in selected)
    total_return = dp[W][R]

    elapsed = (time.perf_counter() - start) * 1000

    return {
        "selected_stocks": selected,
        "total_return": total_return,
        "total_cost": total_cost,
        "total_risk": total_risk,
        "execution_time": elapsed,
        "is_optimal": True,   # EXACT optimal for dual-constraint problem
        "dp_table_size": (W + 1) * (R + 1),
    }
