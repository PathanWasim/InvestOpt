import { ChevronDown, Zap, Brain, GitBranch, TrendingUp, Cpu } from 'lucide-react';

const ALGORITHMS = [
  {
    key: 'brute',
    label: 'Brute Force',
    complexity: 'O(2ⁿ)',
    icon: Cpu,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    desc: 'Exhaustive search — guaranteed optimal but exponential time',
    optimal: true,
    warning: 'Only feasible for n ≤ 20',
  },
  {
    key: 'greedy',
    label: 'Greedy (Ratio Sort)',
    complexity: 'O(n log n)',
    icon: Zap,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    desc: 'Selects stocks by return/cost ratio — fast but NOT optimal',
    optimal: false,
    warning: 'May fail significantly!',
  },
  {
    key: 'dp',
    label: 'Standard DP (1D)',
    complexity: 'O(nW)',
    icon: Brain,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    desc: 'Classical 0/1 Knapsack DP — budget constraint only',
    optimal: false,
    warning: 'Ignores risk in state space',
  },
  {
    key: 'modified_dp',
    label: 'Modified DP (2D) ⭐',
    complexity: 'O(nWR)',
    icon: Brain,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    desc: 'Main contribution: dual-constraint 2D DP state space dp[w][r]',
    optimal: true,
    highlight: true,
  },
  {
    key: 'bnb',
    label: 'Branch & Bound',
    complexity: 'Exp (pruned)',
    icon: GitBranch,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    desc: 'Best-first search with dual-constraint fractional relaxation',
    optimal: true,
  },
];

export default function AlgorithmSelector({ selected, setSelected }) {
  const current = ALGORITHMS.find((a) => a.key === selected);

  return (
    <div className="glass-card p-5 animate-fade-in">
      <h2 className="section-title mb-4">Select Algorithm</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">
        {ALGORITHMS.map((algo) => {
          const Icon = algo.icon;
          const isSelected = selected === algo.key;
          return (
            <button
              key={algo.key}
              onClick={() => setSelected(algo.key)}
              className={`relative p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer algo-card
                ${isSelected
                  ? `${algo.bg} ${algo.border} ${algo.highlight ? 'ring-1 ring-emerald-500/50' : ''}`
                  : 'algo-card-idle'}
              `}
            >
              {algo.highlight && isSelected && (
                <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-dark-950 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  MAIN
                </div>
              )}
              <div className={`flex items-center gap-1.5 mb-2 ${isSelected ? algo.color : 'text-slate-400'}`}>
                <Icon size={14} />
                <span className="font-mono text-xs font-semibold">{algo.complexity}</span>
              </div>
              <div className={`text-xs font-semibold mb-1 ${isSelected ? 'text-slate-100' : 'text-slate-300'}`}>
                {algo.label}
              </div>
              <div className="text-[10px] text-slate-500 leading-relaxed">{algo.desc}</div>
              {algo.warning && (
                <div className="mt-1.5 text-[9px] text-amber-500/80 font-medium">{algo.warning}</div>
              )}
              {algo.optimal !== undefined && (
                <div className={`mt-2 text-[9px] font-semibold ${algo.optimal ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {algo.optimal ? '✓ OPTIMAL' : '✗ NOT OPTIMAL'}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {current && (
        <div className="mt-3 p-3 rounded-xl text-xs algo-info-bar">
          <span className="algo-info-label">Selected: </span>
          <span className={`font-semibold ${current.color}`}>{current.label}</span>
          <span className="algo-info-desc ml-2">— {current.desc}</span>
        </div>
      )}
    </div>
  );
}
