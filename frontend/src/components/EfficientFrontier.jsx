import { useState } from 'react';
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine, Label, Line, LineChart,
} from 'recharts';
import { TrendingUp, Loader2, Info } from 'lucide-react';
import { fetchEfficientFrontier } from '../api';

// ── Custom dot renderer ──
const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (!payload) return null;

    if (payload.is_optimal) {
        return (
            <g>
                <circle cx={cx} cy={cy} r={14} fill="#10b981" fillOpacity={0.15} />
                <circle cx={cx} cy={cy} r={7} fill="#10b981" />
                <text x={cx} y={cy - 14} textAnchor="middle" fill="#34d399" fontSize={10} fontWeight="bold">
                    ★ Optimal
                </text>
            </g>
        );
    }
    if (payload.is_dominated) {
        return <circle cx={cx} cy={cy} r={3} fill="#475569" fillOpacity={0.5} />;
    }
    if (payload.is_efficient) {
        return <circle cx={cx} cy={cy} r={5} fill="#38bdf8" fillOpacity={0.9} />;
    }
    return <circle cx={cx} cy={cy} r={2.5} fill="#334155" fillOpacity={0.6} />;
};

// ── Tooltip ──
const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    if (!d) return null;
    return (
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-3 text-xs shadow-2xl min-w-[160px]">
            {d.is_optimal && <div className="text-emerald-400 font-bold mb-1.5">⭐ Optimal Portfolio</div>}
            {d.is_dominated && <div className="text-slate-500 mb-1.5 italic">Dominated</div>}
            {d.is_efficient && !d.is_optimal && <div className="text-sky-400 font-semibold mb-1.5">Efficient</div>}
            <div className="space-y-0.5">
                <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Return</span>
                    <span className="text-emerald-400 font-mono font-semibold">{d.return?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Risk</span>
                    <span className="text-rose-400 font-mono font-semibold">{d.risk?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Sharpe</span>
                    <span className="text-amber-400 font-mono font-semibold">{d.sharpe?.toFixed(3)}</span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Stocks</span>
                    <span className="text-slate-300 font-mono">{d.stocks_count}</span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Cost</span>
                    <span className="text-sky-400 font-mono">${d.cost?.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

export default function EfficientFrontier({ stocks, budget }) {
    const [allPoints, setAllPoints] = useState([]);
    const [efficientPoints, setEfficientPoints] = useState([]);
    const [optimalPoint, setOptimalPoint] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [generated, setGenerated] = useState(false);

    const handleGenerate = async () => {
        if (!stocks?.length) { setError('Load stocks first.'); return; }
        setLoading(true);
        setError(null);
        try {
            const res = await fetchEfficientFrontier({ stocks, budget, samples: 45 });
            const d = res.data;
            setAllPoints(d.all_points || []);
            setEfficientPoints(d.efficient_points || []);
            setOptimalPoint(d.optimal_point || null);
            setStats({ total: d.total_points, efficient: d.efficient_count });
            setGenerated(true);
        } catch (e) {
            setError(e.response?.data?.detail || e.message);
        } finally {
            setLoading(false);
        }
    };

    // Combine for scatter: dominated grey, efficient blue, optimal green
    const scatterData = allPoints;

    return (
        <div className="glass-card p-5 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="section-title">Efficient Frontier</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Risk–Return tradeoff across all feasible portfolio combinations
                    </p>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={loading || !stocks?.length}
                    className="btn-primary text-xs py-2 px-4"
                >
                    {loading
                        ? <Loader2 size={14} className="animate-spin" />
                        : <TrendingUp size={14} />}
                    {loading ? 'Computing...' : generated ? 'Recompute' : 'Generate Frontier'}
                </button>
            </div>

            {error && (
                <div className="text-rose-400 text-xs mb-3 p-2.5 bg-rose-500/10 rounded-lg border border-rose-500/20 flex items-center gap-2">
                    <span>⚠</span> {error}
                </div>
            )}

            {!generated && !loading && (
                <div className="flex flex-col items-center justify-center h-52 text-slate-500 gap-2">
                    <TrendingUp size={32} className="opacity-20" />
                    <p className="text-sm">Click "Generate Frontier" to compute the efficient frontier</p>
                    <p className="text-xs text-slate-600">Runs Modified DP across a grid of budget × risk combinations</p>
                </div>
            )}

            {loading && (
                <div className="flex flex-col items-center justify-center h-52 gap-3">
                    <Loader2 size={28} className="animate-spin text-emerald-400" />
                    <p className="text-sm text-slate-400">Computing portfolios across constraint grid…</p>
                </div>
            )}

            {generated && !loading && allPoints.length > 0 && (
                <>
                    {/* Stats row */}
                    {stats && (
                        <div className="flex gap-4 mb-4 text-xs">
                            <span className="text-slate-500">
                                <span className="text-slate-300 font-semibold">{stats.total}</span> portfolios computed
                            </span>
                            <span className="text-slate-500">
                                <span className="text-sky-400 font-semibold">{stats.efficient}</span> on efficient frontier
                            </span>
                            {optimalPoint && (
                                <span className="text-slate-500">
                                    Optimal Sharpe: <span className="text-emerald-400 font-semibold font-mono">{optimalPoint.sharpe?.toFixed(3)}</span>
                                </span>
                            )}
                        </div>
                    )}

                    <ResponsiveContainer width="100%" height={320}>
                        <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-card)" />
                            <XAxis
                                type="number"
                                dataKey="risk"
                                name="Risk"
                                tick={{ fontSize: 10, fill: '#64748b' }}
                                axisLine={false}
                                tickLine={false}
                                domain={['auto', 'auto']}
                            >
                                <Label value="Risk (Annualised Volatility %)" offset={-15} position="insideBottom" fill="#64748b" fontSize={10} />
                            </XAxis>
                            <YAxis
                                type="number"
                                dataKey="return"
                                name="Return"
                                tick={{ fontSize: 10, fill: '#64748b' }}
                                axisLine={false}
                                tickLine={false}
                                domain={['auto', 'auto']}
                            >
                                <Label value="Expected Return %" angle={-90} position="insideLeft" fill="#64748b" fontSize={10} dy={60} />
                            </YAxis>
                            <Tooltip content={<CustomTooltip />} />

                            {/* All points (dominated = grey, efficient = blue, optimal = green) */}
                            <Scatter data={scatterData} shape={<CustomDot />} />

                            {/* Vertical reference at optimal */}
                            {optimalPoint && (
                                <ReferenceLine
                                    x={optimalPoint.risk}
                                    stroke="#10b981"
                                    strokeDasharray="4 4"
                                    strokeWidth={1}
                                    label={{ value: 'Max Sharpe', fill: '#10b981', fontSize: 9, position: 'top' }}
                                />
                            )}
                        </ScatterChart>
                    </ResponsiveContainer>

                    {/* Legend */}
                    <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-dark-600/40 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <span>Optimal (max Sharpe)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-sky-400" />
                            <span>Efficient (non-dominated)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-slate-600" />
                            <span>Dominated</span>
                        </div>
                        <div className="ml-auto flex items-center gap-1 text-slate-600">
                            <Info size={11} />
                            <span>A dominates B if return_A ≥ return_B and risk_A ≤ risk_B</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
