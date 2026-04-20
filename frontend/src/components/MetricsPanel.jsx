import { CheckCircle, XCircle, AlertTriangle, Clock, TrendingUp, Minus } from 'lucide-react';

const ALGO_DISPLAY = {
  brute:       { label: 'Brute Force',        complexity: 'O(2ⁿ)',    color: 'amber'   },
  greedy:      { label: 'Greedy',             complexity: 'O(n log n)', color: 'rose'  },
  dp:          { label: 'Standard DP (1D)',   complexity: 'O(nW)',    color: 'sky'     },
  modified_dp: { label: 'Modified DP ⭐ (2D)', complexity: 'O(nWR)',  color: 'emerald' },
  bnb:         { label: 'Branch & Bound',     complexity: 'Exp (pruned)', color: 'violet'},
};

const COLOR_MAP = {
  amber:   { badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',   text: 'text-amber-400'   },
  rose:    { badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',       text: 'text-rose-400'    },
  sky:     { badge: 'bg-sky-500/15 text-sky-400 border-sky-500/30',           text: 'text-sky-400'     },
  emerald: { badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', text: 'text-emerald-400' },
  violet:  { badge: 'bg-violet-500/15 text-violet-400 border-violet-500/30', text: 'text-violet-400'  },
};

const GapBar = ({ gap }) => {
  if (gap == null) return <span className="text-slate-500 text-xs">—</span>;
  const pct = Math.min(gap, 100);
  const color = gap === 0 ? 'bg-emerald-500' : gap < 10 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-dark-600 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-mono font-semibold ${gap === 0 ? 'text-emerald-400' : gap < 10 ? 'text-amber-400' : 'text-rose-400'}`}>
        {gap.toFixed(1)}%
      </span>
    </div>
  );
};

export default function MetricsPanel({ results, optimalReturn }) {
  if (!results || results.length === 0) return null;

  const greedyResult = results.find((r) => r.algorithm === 'greedy');
  const optimalResult = results.find((r) => r.is_optimal && !r.skipped && r.algorithm === 'modified_dp')
    || results.find((r) => r.is_optimal && !r.skipped);
  const greedyGap = greedyResult && optimalReturn > 0
    ? ((optimalReturn - greedyResult.total_return) / optimalReturn * 100).toFixed(1)
    : null;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Academic Summary Table */}
      <div className="glass-card p-5">
        <h2 className="section-title mb-4">Academic Analysis — Algorithm Report</h2>
        <div className="table-scroll rounded-xl overflow-hidden border border-dark-600/40">
          <table className="data-table">
            <thead className="sticky top-0 bg-dark-800">
              <tr>
                <th>Algorithm</th>
                <th>Complexity</th>
                <th>Return ($)</th>
                <th>Cost ($)</th>
                <th>Risk</th>
                <th>Time (ms)</th>
                <th>Optimal?</th>
                <th>Optimality Gap</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => {
                const meta = ALGO_DISPLAY[r.algorithm] || { label: r.algorithm, complexity: '—', color: 'slate' };
                const cm = COLOR_MAP[meta.color] || COLOR_MAP.sky;
                return (
                  <tr
                    key={r.algorithm}
                    className={r.algorithm === 'modified_dp' ? 'bg-emerald-500/5' : ''}
                  >
                    <td>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${cm.badge}`}>
                          {meta.label}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`font-mono text-xs font-semibold ${cm.text}`}>
                        {meta.complexity}
                      </span>
                    </td>
                    <td>
                      {r.skipped ? (
                        <span className="text-slate-500 text-xs italic">Skipped</span>
                      ) : (
                        <span className="font-mono font-semibold text-emerald-400">
                          ${r.total_return?.toFixed(1)}
                        </span>
                      )}
                    </td>
                    <td className="font-mono text-sky-400">${r.total_cost?.toFixed(1) ?? '—'}</td>
                    <td className="font-mono text-rose-400">{r.total_risk?.toFixed(1) ?? '—'}</td>
                    <td>
                      {r.execution_time >= 0
                        ? <span className="font-mono text-amber-400">{r.execution_time?.toFixed(3)}</span>
                        : <span className="text-slate-500 text-xs">—</span>}
                    </td>
                    <td>
                      {r.is_optimal
                        ? <CheckCircle size={14} className="text-emerald-400" />
                        : <XCircle size={14} className="text-rose-400" />}
                    </td>
                    <td className="min-w-[120px]">
                      <GapBar gap={r.optimality_gap} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Greedy Failure Highlight */}
      {greedyResult && greedyGap && Number(greedyGap) > 0 && (
        <div className="glass-card neon-border-rose p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-rose-400 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-rose-400 text-sm mb-1">⚠ Greedy Failure Demonstrated</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The Greedy algorithm achieved <span className="text-rose-400 font-semibold">${greedyResult.total_return?.toFixed(1)}</span> vs
                the optimal <span className="text-emerald-400 font-semibold">${optimalReturn?.toFixed(1)}</span>.
                This is a <span className="text-rose-400 font-bold">{greedyGap}% suboptimality gap</span> — proving
                that return/cost ratio sorting does not solve the multi-constraint 0/1 Knapsack problem optimally.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modified DP Highlight */}
      {optimalResult && optimalResult.algorithm === 'modified_dp' && (
        <div className="glass-card neon-border-emerald p-4">
          <div className="flex items-start gap-3">
            <CheckCircle size={18} className="text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-emerald-400 text-sm mb-1">⭐ Modified DP Achieves Optimality</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The 2D Dynamic Programming approach (<span className="font-mono text-emerald-400">dp[w][r]</span>) achieves
                the exact optimal return of <span className="text-emerald-400 font-semibold">${optimalResult.total_return?.toFixed(1)}</span> by
                extending the classical knapsack state space to incorporate <em>both</em> budget and risk constraints simultaneously.
                This is the central academic contribution of this system.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
