import { useState, useRef, useCallback } from 'react';
import { Wifi, BarChart2, Loader2, AlertTriangle, CheckCircle, Info, Download } from 'lucide-react';
import AlgorithmSelector from '../components/AlgorithmSelector';
import ResultCard from '../components/ResultCard';
import PortfolioInsights from '../components/PortfolioInsights';
import EfficientFrontier from '../components/EfficientFrontier';
import ComparisonChart from '../components/ComparisonChart';
import MetricsPanel from '../components/MetricsPanel';
import { fetchLivePortfolio, generateReport } from '../api';

const SUGGESTED = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'GOOG', 'META', 'JPM', 'V', 'NFLX'];

export default function LivePortfolio() {
    const [symbolInput, setSymbolInput] = useState('');
    const [budget, setBudget] = useState(500);
    const [riskLimit, setRiskLimit] = useState(50);
    const [algorithm, setAlgorithm] = useState('modified_dp');
    const [compareMode, setCompareMode] = useState(false);

    const [fetchedStocks, setFetchedStocks] = useState([]);
    const [result, setResult] = useState(null);
    const [compareResults, setCompareResults] = useState(null);
    const [optimalReturn, setOptimalReturn] = useState(0);
    const [fetchErrors, setFetchErrors] = useState([]);

    const [loading, setLoading] = useState(false);
    const [reportLoading, setReportLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('result');

    // Debounce ref
    const debounceRef = useRef(null);
    const handleSymbolChange = useCallback((val) => {
        setSymbolInput(val.toUpperCase());
        if (debounceRef.current) clearTimeout(debounceRef.current);
        // Auto-clear error on new input
        debounceRef.current = setTimeout(() => setError(null), 400);
    }, []);

    const addSuggested = (sym) => {
        const current = symbolInput.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
        if (!current.includes(sym)) {
            setSymbolInput([...current, sym].join(', '));
        }
    };

    const handleFetchAndRun = async () => {
        const symbols = symbolInput.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
        if (symbols.length === 0) { setError('Enter at least one stock symbol.'); return; }
        if (symbols.length > 10) { setError('Maximum 10 symbols at once (API rate limit).'); return; }

        setLoading(true);
        setError(null);
        setResult(null);
        setCompareResults(null);
        setFetchedStocks([]);
        setFetchErrors([]);

        try {
            const res = await fetchLivePortfolio({
                symbols,
                budget,
                risk_limit: riskLimit,
                algorithm,
                compare_all: compareMode,
            });
            const data = res.data;
            setFetchedStocks(data.fetched_stocks || []);
            setFetchErrors(data.fetch_errors || []);

            if (compareMode) {
                setCompareResults(data.results || []);
                setOptimalReturn(data.optimal_return || 0);
                setActiveTab('compare');
            } else {
                setResult(data);
                setActiveTab('result');
            }
        } catch (e) {
            const detail = e.response?.data?.detail || e.message || 'Unknown error';
            const isRateLimit = detail.toLowerCase().includes('rate limit') || detail.toLowerCase().includes('limit reached');
            setError(isRateLimit
                ? '⏱ Alpha Vantage rate limit reached (5 req/min). Wait 1 minute or use cached data.'
                : detail
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = async () => {
        if (!fetchedStocks.length || !result) return;
        setReportLoading(true);
        try {
            const res = await generateReport({
                stocks: fetchedStocks,
                budget,
                risk_limit: riskLimit,
                algorithm,
            });
            const report = res.data.report;
            const lines = [
                '═══════════════════════════════════════════════════',
                '   KNAPSACK PORTFOLIO OPTIMIZER — LIVE REPORT',
                '═══════════════════════════════════════════════════',
                `Algorithm      : ${report.display_name}`,
                `Optimal        : ${report.is_optimal ? 'YES' : 'NO'}`,
                `Budget         : $${report.budget}   Risk Limit: ${report.risk_limit}`,
                '',
                '─── Results ───────────────────────────────────────',
                `Total Return   : ${report.total_return?.toFixed(4)}`,
                `Total Cost     : $${report.total_cost?.toFixed(4)}`,
                `Total Risk     : ${report.total_risk?.toFixed(4)}`,
                `Sharpe Ratio   : ${report.sharpe_ratio}`,
                `Exec Time      : ${report.execution_time_ms?.toFixed(3)} ms`,
                `Stocks Selected: ${report.stocks_selected}`,
                '',
                '─── Sector Breakdown ──────────────────────────────',
                ...Object.entries(report.sector_breakdown || {}).map(
                    ([sec, cnt]) => `  ${sec.padEnd(20)} ${cnt} stock${cnt !== 1 ? 's' : ''}`
                ),
                '',
                '─── Selected Stocks ───────────────────────────────',
                'Ticker   Sector              Cost     Return%  Risk%',
                ...(report.selected_stocks || []).map((s) =>
                    `${s.name.padEnd(9)}${(s.sector || '').padEnd(20)}${String(s.cost?.toFixed(2)).padEnd(9)}${String(s.expected_return?.toFixed(2)).padEnd(9)}${s.risk?.toFixed(2)}`
                ),
                '',
                '═══════════════════════════════════════════════════',
                `Generated: ${new Date().toLocaleString()}`,
            ];
            const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `live_report_${algorithm}_${Date.now()}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            setError(e.response?.data?.detail || e.message);
        } finally {
            setReportLoading(false);
        }
    };

    const maxBudget = Math.max(1000, budget + 200);
    const maxRisk = Math.max(200, riskLimit + 50);

    const resultTabs = compareMode
        ? [{ key: 'compare', label: 'Comparison' }, { key: 'frontier', label: 'Efficient Frontier' }]
        : [{ key: 'result', label: 'Result' }, { key: 'insights', label: 'Analytics' }, { key: 'frontier', label: 'Efficient Frontier' }];

    return (
        <div className="space-y-5">
            {/* Header banner */}
            <div className="contribution-banner" style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.08) 0%, rgba(139,92,246,0.08) 100%)', borderColor: 'rgba(14,165,233,0.2)' }}>
                <div className="flex items-start gap-3">
                    <Wifi size={16} className="text-sky-400 mt-0.5 shrink-0" />
                    <div>
                        <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">Live Market Mode — Alpha Vantage</div>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            Returns and risk are computed from <span className="text-sky-400 font-semibold">60 days of historical prices</span> using
                            annualised metrics: <span className="font-mono text-sky-300">return = mean(Δp) × 252</span>,{' '}
                            <span className="font-mono text-sky-300">risk = std(Δp) × √252</span>.
                            Results are <span className="text-emerald-400">cached for 1 hour</span> to respect the 5 req/min rate limit.
                        </p>
                    </div>
                </div>
            </div>

            {/* Symbol input card */}
            <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="section-title">Stock Symbols</h2>
                    {/* Compare toggle */}
                    <div className="flex items-center gap-1 p-1 rounded-xl tab-bar">
                        <button
                            onClick={() => setCompareMode(false)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                ${!compareMode ? 'bg-emerald-500 text-dark-950' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Single Algorithm
                        </button>
                        <button
                            onClick={() => setCompareMode(true)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                ${compareMode ? 'bg-sky-500 text-dark-950' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Compare All
                        </button>
                    </div>
                </div>

                <div className="flex gap-3 mb-3">
                    <input
                        className="input-field flex-1 font-mono uppercase"
                        placeholder="AAPL, TSLA, MSFT, NVDA  (max 10)"
                        value={symbolInput}
                        onChange={(e) => handleSymbolChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleFetchAndRun()}
                    />
                    <button
                        onClick={handleFetchAndRun}
                        disabled={loading || !symbolInput.trim()}
                        className="btn-primary px-5 shrink-0"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Wifi size={16} />}
                        {loading ? 'Fetching...' : compareMode ? 'Fetch & Compare' : 'Fetch & Run'}
                    </button>
                </div>

                {/* Suggested tickers */}
                <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-xs" style={{ color: 'var(--text-faint)' }}>Quick add:</span>
                    {SUGGESTED.map((sym) => (
                        <button
                            key={sym}
                            onClick={() => addSuggested(sym)}
                            className="px-2 py-0.5 rounded-md text-xs font-mono font-semibold transition-colors algo-card-idle"
                            style={{ color: 'var(--text-secondary)' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                        >
                            {sym}
                        </button>
                    ))}
                </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="glass-card p-4">
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Budget (W)</label>
                    <span className="text-2xl font-bold text-sky-400 font-mono block mb-2">${budget}</span>
                    <input type="range" min="50" max={maxBudget} step="10" value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                        className="slider-sky w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--text-faint)' }}><span>$50</span><span>${maxBudget}</span></div>
                </div>
                <div className="glass-card p-4">
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Risk Limit (R)</label>
                    <span className="text-2xl font-bold text-rose-400 font-mono block mb-2">{riskLimit}</span>
                    <input type="range" min="1" max={maxRisk} step="1" value={riskLimit}
                        onChange={(e) => setRiskLimit(Number(e.target.value))}
                        className="slider-rose w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--text-faint)' }}><span>1</span><span>{maxRisk}</span></div>
                </div>
            </div>

            {!compareMode && <AlgorithmSelector selected={algorithm} setSelected={setAlgorithm} />}

            {/* Error banner */}
            {error && (
                <div className={`glass-card p-3 text-sm flex items-start gap-2 ${error.includes('rate limit') || error.includes('⏱')
                    ? 'border-amber-500/40 text-amber-400 bg-amber-500/5'
                    : 'neon-border-rose text-rose-400'
                    }`}>
                    <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                    <div>
                        <div className="font-semibold">{error.includes('rate limit') || error.includes('⏱') ? 'Rate Limit Reached' : 'Error'}</div>
                        <div className="text-xs mt-0.5 opacity-80">{error}</div>
                    </div>
                </div>
            )}

            {/* Partial fetch errors */}
            {fetchErrors.length > 0 && (
                <div className="glass-card p-3 border border-amber-500/30 bg-amber-500/5">
                    <div className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
                        <AlertTriangle size={12} /> Some symbols could not be fetched:
                    </div>
                    <div className="space-y-1">
                        {fetchErrors.map((e) => (
                            <div key={e.symbol} className="text-xs flex items-center gap-2">
                                <span className="font-mono font-bold text-amber-400">{e.symbol}</span>
                                <span className="text-slate-400">{e.error}</span>
                                {e.fallback && <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">rate-limited</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Fetched stocks table */}
            {fetchedStocks.length > 0 && (
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <CheckCircle size={14} className="text-emerald-400" />
                            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>
                                Live Data — {fetchedStocks.length} stock{fetchedStocks.length !== 1 ? 's' : ''} fetched
                            </h3>
                        </div>
                        {result && (
                            <button
                                onClick={handleDownloadReport}
                                disabled={reportLoading}
                                className="btn-secondary text-xs py-1.5 px-3 gap-1.5"
                            >
                                {reportLoading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                                Report
                            </button>
                        )}
                    </div>
                    <div className="table-scroll rounded-xl overflow-hidden card-table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Symbol</th>
                                    <th>Sector</th>
                                    <th>Cost (scaled)</th>
                                    <th>Ann. Return %</th>
                                    <th>Ann. Risk (Vol) %</th>
                                    <th>Sharpe</th>
                                    <th>Return/Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fetchedStocks.map((s) => {
                                    const sharpe = s.risk > 0 ? (s.expected_return / s.risk).toFixed(3) : '—';
                                    const sharpeNum = s.risk > 0 ? s.expected_return / s.risk : 0;
                                    const sharpeColor = sharpeNum >= 1.5 ? 'text-emerald-400' : sharpeNum >= 0.8 ? 'text-amber-400' : 'text-rose-400';
                                    return (
                                        <tr key={s.name}>
                                            <td className="font-mono font-bold text-emerald-400">{s.name}</td>
                                            <td className="text-slate-400 text-xs">{s.sector}</td>
                                            <td className="font-mono text-sky-400">${s.cost?.toFixed(2)}</td>
                                            <td className="font-mono text-emerald-400">{s.expected_return?.toFixed(2)}%</td>
                                            <td className="font-mono text-rose-400">{s.risk?.toFixed(2)}%</td>
                                            <td className={`font-mono font-semibold ${sharpeColor}`}>{sharpe}</td>
                                            <td className="font-mono text-amber-400">
                                                {s.cost > 0 ? (s.expected_return / s.cost).toFixed(3) : '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-[10px] mt-2 flex items-center gap-1" style={{ color: 'var(--text-faint)' }}>
                        <Info size={10} />
                        Cost = latest price ÷ 10 (scaled). Return & Risk are annualised from 60-day daily returns.
                    </p>
                </div>
            )}

            {/* Results */}
            {(result || compareResults) && (
                <div>
                    <div className="flex gap-1 mb-4 p-1 rounded-xl w-fit flex-wrap tab-bar">
                        {resultTabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${activeTab === tab.key ? 'bg-sky-500 text-dark-950' : ''}`}
                                style={activeTab !== tab.key ? { color: 'var(--text-muted)' } : {}}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'result' && result && <ResultCard result={result} />}

                    {activeTab === 'compare' && compareResults && (
                        <div className="space-y-5">
                            <ComparisonChart results={compareResults} optimalReturn={optimalReturn} />
                            <MetricsPanel results={compareResults} optimalReturn={optimalReturn} />
                        </div>
                    )}

                    {activeTab === 'insights' && result && (
                        <PortfolioInsights
                            selectedStocks={result.selected_stocks}
                            totalReturn={result.total_return}
                            totalRisk={result.total_risk}
                        />
                    )}

                    {activeTab === 'frontier' && (
                        <EfficientFrontier stocks={fetchedStocks} budget={budget} />
                    )}
                </div>
            )}
        </div>
    );
}
