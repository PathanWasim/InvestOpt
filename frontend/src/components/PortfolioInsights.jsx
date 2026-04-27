import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList,
} from 'recharts';
import { Shield, TrendingUp, PieChart as PieIcon, BarChart2, Download, Star } from 'lucide-react';

const PIE_COLORS = [
    '#10b981', '#38bdf8', '#a78bfa', '#fbbf24', '#f43f5e',
    '#34d399', '#818cf8', '#fb923c', '#22d3ee', '#e879f9',
];

const CustomPieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const pct = payload[0].percent ? (payload[0].percent * 100).toFixed(1) : '—';
    return (
        <div className="glass-card p-3 text-xs shadow-2xl" style={{ minWidth: 140 }}>
            <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{payload[0].name}</div>
            <div className="text-emerald-400">{payload[0].value} stock{payload[0].value !== 1 ? 's' : ''}</div>
            <div style={{ color: 'var(--text-muted)' }}>{pct}% of portfolio</div>
        </div>
    );
};

const CustomBarTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    const totalRisk = d?._totalRisk || 1;
    const pct = totalRisk > 0 ? ((d?.risk / totalRisk) * 100).toFixed(1) : '—';
    return (
        <div className="glass-card p-3 text-xs shadow-2xl" style={{ minWidth: 150 }}>
            <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{d?.name}</div>
            <div className="text-rose-400">Risk: {d?.risk?.toFixed(2)} ({pct}%)</div>
            <div className="text-emerald-400">Return: {d?.return?.toFixed(2)}</div>
            <div className="text-amber-400">Sharpe: {d?.risk > 0 ? (d?.return / d?.risk).toFixed(3) : '—'}</div>
        </div>
    );
};

function exportCSV(stocks, totalReturn, totalRisk, sharpe) {
    const header = 'Ticker,Sector,Cost,Expected Return,Risk,Sharpe';
    const rows = stocks.map((s) =>
        `${s.name},${s.sector || 'General'},${s.cost},${s.expected_return},${s.risk},${s.risk > 0 ? (s.expected_return / s.risk).toFixed(3) : 0}`
    );
    const summary = `\n\nPortfolio Total,,,,\nTotal Return,,,${totalReturn?.toFixed(4)},,\nTotal Risk,,,${totalRisk?.toFixed(4)},,\nSharpe Ratio,,,${sharpe},,`;
    const csv = [header, ...rows, summary].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

export default function PortfolioInsights({ selectedStocks, totalReturn, totalRisk }) {
    if (!selectedStocks || selectedStocks.length === 0) return null;

    const sectorMap = {};
    selectedStocks.forEach((s) => {
        const sec = s.sector || 'General';
        sectorMap[sec] = (sectorMap[sec] || 0) + 1;
    });
    const sectorData = Object.entries(sectorMap).map(([name, value]) => ({ name, value }));

    const riskData = selectedStocks.map((s) => ({
        name: s.name,
        risk: s.risk,
        return: s.expected_return,
        _totalRisk: totalRisk,
        riskPct: totalRisk > 0 ? parseFloat(((s.risk / totalRisk) * 100).toFixed(1)) : 0,
    }));

    const sharpe = totalRisk > 0 ? (totalReturn / totalRisk).toFixed(3) : '—';
    const sharpeNum = totalRisk > 0 ? totalReturn / totalRisk : 0;
    const diversification = new Set(selectedStocks.map((s) => s.sector)).size;

    const sharpeColorClass = sharpeNum >= 1.5 ? 'text-emerald-400' : sharpeNum >= 0.8 ? 'text-amber-400' : 'text-rose-400';
    const sharpeLabel = sharpeNum >= 1.5 ? 'Excellent' : sharpeNum >= 0.8 ? 'Good' : 'Low';
    const sharpeBorder = sharpeNum >= 1.5 ? 'border-emerald-500/40' : sharpeNum >= 0.8 ? 'border-amber-500/40' : 'border-rose-500/40';
    const sharpeBoxBg = sharpeNum >= 1.5
        ? 'rgba(16,185,129,0.06)' : sharpeNum >= 0.8
            ? 'rgba(251,191,36,0.06)' : 'rgba(244,63,94,0.06)';
    const sharpeBoxBorder = sharpeNum >= 1.5
        ? 'rgba(16,185,129,0.25)' : sharpeNum >= 0.8
            ? 'rgba(251,191,36,0.25)' : 'rgba(244,63,94,0.25)';

    return (
        <div className="glass-card p-5 animate-fade-in space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="section-title">Portfolio Analytics</h2>
                <button
                    onClick={() => exportCSV(selectedStocks, totalReturn, totalRisk, sharpe)}
                    className="btn-secondary text-xs py-1.5 px-3 gap-1.5"
                >
                    <Download size={12} />
                    Export CSV
                </button>
            </div>

            {/* Summary metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="metric-card">
                    <TrendingUp size={14} className="text-emerald-400" />
                    <div className="text-xl font-bold font-mono text-emerald-400">{totalReturn?.toFixed(2)}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Return</div>
                </div>
                <div className="metric-card">
                    <Shield size={14} className="text-rose-400" />
                    <div className="text-xl font-bold font-mono text-rose-400">{totalRisk?.toFixed(2)}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Risk</div>
                </div>
                <div className={`metric-card border ${sharpeBorder}`}>
                    <div className="flex items-center gap-1">
                        <Star size={13} className={sharpeColorClass} />
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Sharpe Ratio</span>
                    </div>
                    <div className={`text-xl font-bold font-mono ${sharpeColorClass}`}>{sharpe}</div>
                    <div className={`text-[10px] font-semibold ${sharpeColorClass}`}>{sharpeLabel}</div>
                </div>
                <div className="metric-card">
                    <PieIcon size={14} className="text-violet-400" />
                    <div className="text-xl font-bold font-mono text-violet-400">{diversification}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Sectors ({selectedStocks.length} stocks)</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Sector Pie */}
                <div>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                        Sector Allocation
                    </div>
                    <ResponsiveContainer width="100%" height={230}>
                        <PieChart>
                            <Pie
                                data={sectorData}
                                cx="50%" cy="50%"
                                innerRadius={55} outerRadius={88}
                                paddingAngle={3}
                                dataKey="value"
                                animationBegin={0}
                                animationDuration={600}
                            >
                                {sectorData.map((_, i) => (
                                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomPieTooltip />} />
                            <Legend
                                iconType="circle" iconSize={8}
                                formatter={(v) => (
                                    <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{v}</span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Risk Contribution Bar */}
                <div>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                        Risk Contribution per Stock (% of total)
                    </div>
                    <ResponsiveContainer width="100%" height={230}>
                        <BarChart data={riskData} margin={{ top: 15, right: 10, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-card)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                                axisLine={false} tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                                axisLine={false} tickLine={false}
                                tickFormatter={(v) => `${v}%`}
                            />
                            <Tooltip content={<CustomBarTooltip />} />
                            <Bar dataKey="riskPct" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={44} animationDuration={600}>
                                <LabelList
                                    dataKey="riskPct" position="top"
                                    formatter={(v) => `${v}%`}
                                    style={{ fontSize: 9, fill: 'var(--text-secondary)' }}
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Sharpe interpretation */}
            <div
                className="p-3 rounded-xl text-xs"
                style={{ background: sharpeBoxBg, border: `1px solid ${sharpeBoxBorder}` }}
            >
                <span className={`font-semibold ${sharpeColorClass}`}>Sharpe Ratio {sharpe}</span>
                <span className="ml-2" style={{ color: 'var(--text-secondary)' }}>
                    {sharpeNum >= 1.5
                        ? '— Excellent risk-adjusted return. Portfolio is well-optimized.'
                        : sharpeNum >= 0.8
                            ? '— Acceptable risk-adjusted return. Consider tightening risk constraints.'
                            : '— Low risk-adjusted return. The portfolio carries high risk relative to return.'}
                </span>
            </div>
        </div>
    );
}
