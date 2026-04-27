import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine, LabelList,
} from 'recharts';
import { CheckCircle, XCircle } from 'lucide-react';

const COLORS = {
  brute: '#fbbf24',
  greedy: '#f43f5e',
  dp: '#38bdf8',
  modified_dp: '#10b981',
  bnb: '#a78bfa',
};

const LABELS = {
  brute: 'Brute Force',
  greedy: 'Greedy',
  dp: 'Standard DP',
  modified_dp: 'Modified DP ⭐',
  bnb: 'Branch & Bound',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const sharpeColor = d.sharpe >= 1.5 ? '#10b981' : d.sharpe >= 0.8 ? '#fbbf24' : '#f43f5e';
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl p-3 text-xs shadow-2xl min-w-[170px]">
      <div className="font-semibold text-slate-100 mb-2 flex items-center gap-1.5">
        {d.optimal
          ? <CheckCircle size={11} className="text-emerald-400" />
          : <XCircle size={11} className="text-rose-400" />}
        {d.name}
      </div>
      <div className="space-y-0.5">
        <div className="flex justify-between gap-3">
          <span className="text-slate-400">Return</span>
          <span className="text-emerald-400 font-mono font-semibold">{d.return?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-400">Cost</span>
          <span className="text-sky-400 font-mono">${d.cost?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-400">Risk</span>
          <span className="text-rose-400 font-mono">{d.risk?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-400">Sharpe</span>
          <span className="font-mono font-semibold" style={{ color: sharpeColor }}>{d.sharpe?.toFixed(3)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-400">Time</span>
          <span className="text-amber-400 font-mono">{d.time?.toFixed(3)}ms</span>
        </div>
        {d.gap != null && (
          <div className="flex justify-between gap-3 pt-1 border-t border-dark-600 mt-1">
            <span className="text-slate-400">Gap</span>
            <span className={`font-mono font-semibold ${d.gap === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {d.gap}%
            </span>
          </div>
        )}
        {d.skipped && <div className="text-slate-500 italic pt-1">Skipped (n &gt; 20)</div>}
      </div>
    </div>
  );
};

const TimeTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl p-3 text-xs shadow-2xl">
      <div className="font-semibold text-slate-100 mb-1">{d.name}</div>
      <div className="text-amber-400 font-mono">{d.time?.toFixed(4)} ms</div>
    </div>
  );
};

const SharpeTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const color = d.sharpe >= 1.5 ? '#10b981' : d.sharpe >= 0.8 ? '#fbbf24' : '#f43f5e';
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl p-3 text-xs shadow-2xl">
      <div className="font-semibold text-slate-100 mb-1">{d.name}</div>
      <div className="font-mono font-semibold" style={{ color }}>
        Sharpe: {d.sharpe?.toFixed(3)}
      </div>
      <div className="text-slate-400 text-[10px] mt-0.5">
        {d.sharpe >= 1.5 ? 'Excellent' : d.sharpe >= 0.8 ? 'Good' : 'Low'}
      </div>
    </div>
  );
};

export default function ComparisonChart({ results, optimalReturn }) {
  if (!results || results.length === 0) return null;

  const data = results
    .filter((r) => !r.skipped)
    .map((r) => ({
      key: r.algorithm,
      name: LABELS[r.algorithm] || r.algorithm,
      return: r.total_return,
      cost: r.total_cost,
      risk: r.total_risk,
      time: r.execution_time,
      gap: r.optimality_gap,
      sharpe: r.sharpe_ratio ?? 0,
      optimal: r.is_optimal,
      skipped: r.skipped,
    }));

  const timeData = results
    .filter((r) => !r.skipped && r.execution_time >= 0)
    .map((r) => ({
      key: r.algorithm,
      name: LABELS[r.algorithm] || r.algorithm,
      time: r.execution_time,
    }));

  const sharpeData = results
    .filter((r) => !r.skipped)
    .map((r) => ({
      key: r.algorithm,
      name: LABELS[r.algorithm] || r.algorithm,
      sharpe: r.sharpe_ratio ?? 0,
    }));

  const getSharpeColor = (v) => v >= 1.5 ? '#10b981' : v >= 0.8 ? '#fbbf24' : '#f43f5e';

  return (
    <div className="glass-card p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-1">
        <h2 className="section-title">Algorithm Comparison</h2>
        <span className="text-xs text-slate-500">
          Optimal: <span className="text-emerald-400 font-mono font-semibold">{optimalReturn?.toFixed(2)}</span>
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-5">
        Side-by-side performance across return, execution time, and Sharpe ratio
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* ── Return Chart ── */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Total Return
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-card)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              {optimalReturn > 0 && (
                <ReferenceLine
                  y={optimalReturn}
                  stroke="#10b981" strokeDasharray="4 4" strokeWidth={1.5}
                  label={{ value: 'Optimal', fill: '#10b981', fontSize: 9, position: 'insideTopRight' }}
                />
              )}
              <Bar dataKey="return" radius={[5, 5, 0, 0]} maxBarSize={55} animationDuration={600}>
                {data.map((entry) => (
                  <Cell key={entry.key} fill={COLORS[entry.key] || '#64748b'} />
                ))}
                <LabelList
                  dataKey="return" position="top"
                  formatter={(v) => v?.toFixed(1)}
                  style={{ fontSize: 9, fill: '#94a3b8' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Execution Time Chart ── */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Execution Time (ms)
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={timeData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-card)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => v < 0.01 ? v.toFixed(4) : v.toFixed(2)} />
              <Tooltip content={<TimeTooltip />} />
              <Bar dataKey="time" radius={[5, 5, 0, 0]} maxBarSize={55} animationDuration={600}>
                {timeData.map((entry) => (
                  <Cell key={entry.key} fill={COLORS[entry.key] || '#64748b'} />
                ))}
                <LabelList
                  dataKey="time" position="top"
                  formatter={(v) => `${v?.toFixed(2)}ms`}
                  style={{ fontSize: 9, fill: '#94a3b8' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Sharpe Ratio Chart (full width) ── */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Sharpe Ratio (Return ÷ Risk) — Higher is better
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={sharpeData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-card)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<SharpeTooltip />} />
            {/* Reference lines for Sharpe quality */}
            <ReferenceLine y={1.5} stroke="#10b981" strokeDasharray="3 3" strokeWidth={1}
              label={{ value: 'Excellent (1.5)', fill: '#10b981', fontSize: 9, position: 'insideTopRight' }} />
            <ReferenceLine y={0.8} stroke="#fbbf24" strokeDasharray="3 3" strokeWidth={1}
              label={{ value: 'Good (0.8)', fill: '#fbbf24', fontSize: 9, position: 'insideTopRight' }} />
            <Bar dataKey="sharpe" radius={[5, 5, 0, 0]} maxBarSize={55} animationDuration={600}>
              {sharpeData.map((entry) => (
                <Cell key={entry.key} fill={getSharpeColor(entry.sharpe)} />
              ))}
              <LabelList
                dataKey="sharpe" position="top"
                formatter={(v) => v?.toFixed(3)}
                style={{ fontSize: 9, fill: '#94a3b8' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-dark-600/40">
        {Object.entries(LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS[key] }} />
            <span className="text-xs text-slate-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
