import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine, LabelList,
} from 'recharts';

const COLORS = {
  brute:       '#fbbf24',
  greedy:      '#f43f5e',
  dp:          '#38bdf8',
  modified_dp: '#10b981',
  bnb:         '#a78bfa',
};

const LABELS = {
  brute:       'Brute Force',
  greedy:      'Greedy',
  dp:          'Standard DP',
  modified_dp: 'Modified DP ⭐',
  bnb:         'Branch & Bound',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl p-3 text-xs shadow-2xl">
      <div className="font-semibold text-slate-100 mb-2">{d.name}</div>
      <div className="flex flex-col gap-1">
        <span className="text-emerald-400">Return: ${d.return?.toFixed(1)}</span>
        <span className="text-sky-400">Cost: ${d.cost?.toFixed(1)}</span>
        <span className="text-rose-400">Risk: {d.risk?.toFixed(1)}</span>
        <span className="text-amber-400">Time: {d.time?.toFixed(3)}ms</span>
        {d.gap != null && (
          <span className={d.gap === 0 ? 'text-emerald-400' : 'text-rose-400'}>
            Optimality Gap: {d.gap}%
          </span>
        )}
        {d.skipped && <span className="text-slate-500 italic">Skipped (n too large)</span>}
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
      optimal: r.is_optimal,
      skipped: r.skipped,
    }));

  // Time chart data
  const timeData = results
    .filter((r) => !r.skipped && r.execution_time >= 0)
    .map((r) => ({
      key: r.algorithm,
      name: LABELS[r.algorithm] || r.algorithm,
      time: r.execution_time,
    }));

  return (
    <div className="glass-card p-5 animate-fade-in">
      <h2 className="section-title mb-1">Algorithm Comparison</h2>
      <p className="text-xs text-slate-500 mb-5">
        Optimal reference: <span className="text-emerald-400 font-mono font-semibold">${optimalReturn?.toFixed(1)}</span>
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Returns Bar Chart */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Total Return by Algorithm
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              {optimalReturn > 0 && (
                <ReferenceLine
                  y={optimalReturn}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{ value: 'Optimal', fill: '#10b981', fontSize: 10, position: 'insideTopRight' }}
                />
              )}
              <Bar dataKey="return" radius={[6, 6, 0, 0]} maxBarSize={60}>
                {data.map((entry) => (
                  <Cell key={entry.key} fill={COLORS[entry.key] || '#64748b'} />
                ))}
                <LabelList
                  dataKey="return"
                  position="top"
                  formatter={(v) => `$${v?.toFixed(0)}`}
                  style={{ fontSize: 10, fill: '#94a3b8' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Execution Time Chart */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Execution Time (ms)
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={timeData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v.toFixed(2)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="time" radius={[6, 6, 0, 0]} maxBarSize={60}>
                {timeData.map((entry) => (
                  <Cell key={entry.key} fill={COLORS[entry.key] || '#64748b'} />
                ))}
                <LabelList
                  dataKey="time"
                  position="top"
                  formatter={(v) => `${v?.toFixed(2)}ms`}
                  style={{ fontSize: 9, fill: '#94a3b8' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
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
