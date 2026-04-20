import { TrendingUp, DollarSign, Shield, Clock, CheckCircle, XCircle } from 'lucide-react';
import { clsx } from 'clsx';

const ALGO_META = {
  brute:       { label: 'Brute Force',        color: 'amber'   },
  greedy:      { label: 'Greedy',             color: 'rose'    },
  dp:          { label: 'Standard DP',        color: 'sky'     },
  modified_dp: { label: 'Modified DP ⭐',     color: 'emerald' },
  bnb:         { label: 'Branch & Bound',     color: 'violet'  },
};

const MetricBox = ({ icon: Icon, label, value, sub, color = 'emerald' }) => (
  <div className={`metric-card neon-border-${color === 'rose' ? 'rose' : 'emerald'}`}>
    <div className={`text-${color}-400 mb-1`}><Icon size={16} /></div>
    <div className="text-xl font-bold text-slate-100 font-mono">{value}</div>
    <div className="text-xs text-slate-400">{label}</div>
    {sub && <div className="text-[10px] text-slate-500">{sub}</div>}
  </div>
);

export default function ResultCard({ result }) {
  if (!result) return null;

  const meta = ALGO_META[result.algorithm] || { label: result.algorithm, color: 'slate' };
  const isOptimal = result.is_optimal;

  return (
    <div className={`glass-card p-5 animate-slide-up ${isOptimal ? 'neon-border-emerald' : 'neon-border-rose'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="section-title">{meta.label} — Result</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {result.selected_stocks?.length || 0} stocks selected
          </p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
          ${isOptimal
            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
          }`}>
          {isOptimal ? <CheckCircle size={12} /> : <XCircle size={12} />}
          {isOptimal ? 'OPTIMAL' : 'SUBOPTIMAL'}
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <MetricBox
          icon={TrendingUp}
          label="Total Return"
          value={`$${result.total_return?.toFixed(1)}`}
          color="emerald"
        />
        <MetricBox
          icon={DollarSign}
          label="Total Cost"
          value={`$${result.total_cost?.toFixed(1)}`}
          color="sky"
        />
        <MetricBox
          icon={Shield}
          label="Total Risk"
          value={result.total_risk?.toFixed(1)}
          color={result.total_risk > 0 ? 'rose' : 'emerald'}
        />
        <MetricBox
          icon={Clock}
          label="Exec Time"
          value={`${result.execution_time?.toFixed(3)}ms`}
          sub={result.nodes_explored != null ? `${result.nodes_explored} nodes` : undefined}
          color="amber"
        />
      </div>

      {/* Selected stocks */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Selected Portfolio
        </div>
        {result.selected_stocks && result.selected_stocks.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {result.selected_stocks.map((s) => (
              <div
                key={s.id ?? s.name}
                className="flex items-center gap-2 px-3 py-1.5 bg-dark-700/60 border border-dark-600/50 rounded-lg"
              >
                <span className="font-mono font-bold text-sm text-emerald-400">{s.name}</span>
                <span className="text-xs text-slate-400">{s.sector}</span>
                <span className="text-xs text-emerald-400 font-semibold">+${s.expected_return}</span>
                <span className="text-xs text-slate-500">/ ${s.cost}</span>
                <span className="text-xs text-rose-400">risk:{s.risk}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No stocks selected — constraints may be too tight.</p>
        )}
      </div>

      {result.dp_table_size != null && (
        <div className="mt-3 text-[10px] text-slate-500 font-mono">
          DP table size: {result.dp_table_size?.toLocaleString()} cells
        </div>
      )}
    </div>
  );
}
