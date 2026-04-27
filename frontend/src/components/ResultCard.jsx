import { TrendingUp, DollarSign, Shield, Clock, CheckCircle, XCircle, Star } from 'lucide-react';

const ALGO_META = {
  brute: { label: 'Brute Force', color: 'amber', badge: 'Optimal Solution' },
  greedy: { label: 'Greedy', color: 'rose', badge: 'Heuristic Solution' },
  dp: { label: 'Standard DP', color: 'sky', badge: 'Heuristic Solution' },
  modified_dp: { label: 'Modified DP ⭐', color: 'emerald', badge: 'Optimal Solution' },
  bnb: { label: 'Branch & Bound', color: 'violet', badge: 'Optimal Solution' },
};

const COLOR_TEXT = {
  amber: 'text-amber-400', rose: 'text-rose-400', sky: 'text-sky-400',
  emerald: 'text-emerald-400', violet: 'text-violet-400',
};

const MetricBox = ({ icon: Icon, label, value, sub, colorClass = 'text-emerald-400', borderClass = '' }) => (
  <div className={`metric-card ${borderClass}`}>
    <Icon size={14} className={colorClass} />
    <div className={`text-xl font-bold font-mono ${colorClass}`}>{value}</div>
    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
    {sub && <div className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{sub}</div>}
  </div>
);

// Constraint utilization bar
const UtilBar = ({ label, value, color }) => (
  <div className="flex items-center gap-2 text-xs">
    <span className="w-28 shrink-0" style={{ color: 'var(--text-muted)' }}>{label}</span>
    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-card)' }}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${Math.min(value || 0, 100)}%` }}
      />
    </div>
    <span className="font-mono w-10 text-right" style={{ color: 'var(--text-secondary)' }}>{value?.toFixed(1)}%</span>
  </div>
);

export default function ResultCard({ result }) {
  if (!result) return null;

  const meta = ALGO_META[result.algorithm] || { label: result.algorithm, color: 'slate', badge: 'Result' };
  const isOptimal = result.is_optimal;
  const colorText = COLOR_TEXT[meta.color] || 'text-slate-400';

  const sharpe = result.sharpe_ratio ?? 0;
  const sharpeColor = sharpe >= 1.5 ? 'text-emerald-400' : sharpe >= 0.8 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className={`glass-card p-5 animate-slide-up ${isOptimal ? 'neon-border-emerald' : 'neon-border-rose'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className={`section-title ${colorText}`}>{meta.label}</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {result.selected_stocks?.length || 0} stocks selected
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Optimal / Heuristic badge */}
          <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border
            ${isOptimal
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'}`}>
            {isOptimal ? <CheckCircle size={11} /> : <Star size={11} />}
            {meta.badge}
          </span>
          {!isOptimal && (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border bg-rose-500/10 text-rose-400 border-rose-500/30">
              <XCircle size={11} />
              Not Optimal
            </span>
          )}
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        <MetricBox
          icon={TrendingUp} label="Total Return"
          value={result.total_return?.toFixed(2)}
          colorClass="text-emerald-400"
        />
        <MetricBox
          icon={DollarSign} label="Total Cost"
          value={`$${result.total_cost?.toFixed(2)}`}
          colorClass="text-sky-400"
        />
        <MetricBox
          icon={Shield} label="Total Risk"
          value={result.total_risk?.toFixed(2)}
          colorClass="text-rose-400"
        />
        <MetricBox
          icon={Star} label="Sharpe Ratio"
          value={sharpe.toFixed(3)}
          colorClass={sharpeColor}
          sub={sharpe >= 1.5 ? 'Excellent' : sharpe >= 0.8 ? 'Good' : 'Low'}
          borderClass={sharpe >= 1.5 ? 'border border-emerald-500/30' : sharpe >= 0.8 ? 'border border-amber-500/30' : ''}
        />
        <MetricBox
          icon={Clock} label="Exec Time"
          value={`${result.execution_time?.toFixed(3)}ms`}
          colorClass="text-amber-400"
          sub={result.nodes_explored != null ? `${result.nodes_explored} nodes` : result.dp_table_size != null ? `${result.dp_table_size?.toLocaleString()} cells` : undefined}
        />
      </div>

      {/* Constraint utilization */}
      {(result.budget_utilization != null || result.risk_utilization != null) && (
        <div className="mb-5 space-y-2 p-3 rounded-xl sharpe-box-bg">
          <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
            Constraint Utilization
          </div>
          {result.budget_utilization != null && (
            <UtilBar label="Budget used" value={result.budget_utilization} color="bg-sky-500" />
          )}
          {result.risk_utilization != null && (
            <UtilBar label="Risk used" value={result.risk_utilization} color="bg-rose-500" />
          )}
        </div>
      )}

      {/* Selected stocks */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Selected Portfolio
        </div>
        {result.selected_stocks?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {result.selected_stocks.map((s) => (
              <div key={s.id ?? s.name} className="stock-chip flex items-center gap-2 px-3 py-1.5">
                <span className="font-mono font-bold text-sm text-emerald-400">{s.name}</span>
                {s.sector && (
                  <span className="text-[10px] rounded px-1"
                    style={{ color: 'var(--text-faint)', border: '1px solid var(--border-card)' }}>
                    {s.sector}
                  </span>
                )}
                <span className="text-xs text-emerald-400 font-semibold">+{s.expected_return?.toFixed(1)}</span>
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>/ ${s.cost?.toFixed(1)}</span>
                <span className="text-xs text-rose-400">r:{s.risk?.toFixed(1)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
            No stocks selected — constraints may be too tight.
          </p>
        )}
      </div>
    </div>
  );
}
