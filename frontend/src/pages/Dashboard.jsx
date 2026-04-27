import { useState, useCallback } from 'react';
import { Play, BarChart2, Database, Loader2, Info, Download, FileText } from 'lucide-react';
import StockTable from '../components/StockTable';
import AlgorithmSelector from '../components/AlgorithmSelector';
import ResultCard from '../components/ResultCard';
import ComparisonChart from '../components/ComparisonChart';
import MetricsPanel from '../components/MetricsPanel';
import PortfolioInsights from '../components/PortfolioInsights';
import EfficientFrontier from '../components/EfficientFrontier';
import { runAlgorithm, compareAlgorithms, getDataset, generateReport } from '../api';

const PRESET_DATASETS = ['small', 'medium', 'large'];

export default function Dashboard() {
  const [stocks, setStocks] = useState([]);
  const [budget, setBudget] = useState(100);
  const [riskLimit, setRiskLimit] = useState(30);
  const [algorithm, setAlgorithm] = useState('modified_dp');

  const [runResult, setRunResult] = useState(null);
  const [compareResults, setCompareResults] = useState(null);
  const [optimalReturn, setOptimalReturn] = useState(0);

  const [loading, setLoading] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('single');
  const [loadingDataset, setLoadingDataset] = useState(false);

  const loadDataset = useCallback(async (name) => {
    setLoadingDataset(true);
    setError(null);
    try {
      const res = await getDataset(name);
      const d = res.data;
      setStocks(d.stocks);
      setBudget(d.budget);
      setRiskLimit(d.risk_limit);
      setRunResult(null);
      setCompareResults(null);
    } catch (e) {
      setError(`Failed to load dataset: ${e.message}`);
    } finally {
      setLoadingDataset(false);
    }
  }, []);

  const validateStocks = () => {
    if (stocks.length === 0) return 'Please add at least one stock.';
    for (const s of stocks) {
      if (!s.name) return 'All stocks must have a ticker name.';
      if (!s.cost || s.cost <= 0) return `"${s.name}" must have a positive cost.`;
      if (!s.expected_return || s.expected_return <= 0) return `"${s.name}" must have a positive return.`;
      if (!s.risk || s.risk <= 0) return `"${s.name}" must have a positive risk score.`;
    }
    return null;
  };

  const handleRun = async () => {
    const err = validateStocks();
    if (err) { setError(err); return; }
    setLoading(true);
    setError(null);
    setRunResult(null);
    try {
      const res = await runAlgorithm({ stocks, budget, risk_limit: riskLimit, algorithm });
      setRunResult(res.data);
      setActiveTab('single');
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    const err = validateStocks();
    if (err) { setError(err); return; }
    setComparing(true);
    setError(null);
    setCompareResults(null);
    try {
      const res = await compareAlgorithms({ stocks, budget, risk_limit: riskLimit, algorithm });
      setCompareResults(res.data.results);
      setOptimalReturn(res.data.optimal_return);
      setActiveTab('compare');
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setComparing(false);
    }
  };

  const handleDownloadReport = async () => {
    const err = validateStocks();
    if (err) { setError(err); return; }
    setReportLoading(true);
    setError(null);
    try {
      const res = await generateReport({ stocks, budget, risk_limit: riskLimit, algorithm });
      const r = res.data.report;

      // Build professional text report
      const divider = '═'.repeat(55);
      const thin = '─'.repeat(55);
      const now = new Date().toLocaleString();

      const lines = [
        divider,
        '   KNAPSACK PORTFOLIO OPTIMIZER — ANALYSIS REPORT',
        divider,
        `  Generated  : ${now}`,
        `  Algorithm  : ${r.display_name}`,
        `  Optimal    : ${r.is_optimal ? '✓ YES (Exact Solution)' : '✗ NO (Heuristic)'}`,
        divider,
        '',
        '  CONSTRAINTS',
        thin,
        `  Budget Limit   : $${r.budget}`,
        `  Risk Limit     : ${r.risk_limit}`,
        '',
        '  RESULTS',
        thin,
        `  Total Return   : ${r.total_return?.toFixed(4)}`,
        `  Total Cost     : $${r.total_cost?.toFixed(4)}`,
        `  Total Risk     : ${r.total_risk?.toFixed(4)}`,
        `  Sharpe Ratio   : ${r.sharpe_ratio ?? '—'}`,
        `  Budget Used    : ${r.budget_utilization ?? '—'}%`,
        `  Risk Used      : ${r.risk_utilization ?? '—'}%`,
        `  Execution Time : ${r.execution_time_ms?.toFixed(3)} ms`,
        `  Stocks Selected: ${r.stocks_selected}`,
        '',
        '  SECTOR BREAKDOWN',
        thin,
        ...Object.entries(r.sector_breakdown || {}).map(
          ([sec, cnt]) => `  ${sec.padEnd(22)} ${cnt} stock${cnt !== 1 ? 's' : ''}`
        ),
        '',
        '  SELECTED PORTFOLIO',
        thin,
        `  ${'Ticker'.padEnd(8)} ${'Sector'.padEnd(18)} ${'Cost'.padEnd(8)} ${'Return'.padEnd(9)} ${'Risk'.padEnd(8)} Sharpe`,
        `  ${'-'.repeat(60)}`,
        ...(r.selected_stocks || []).map((s) => {
          const sharpe = s.risk > 0 ? (s.expected_return / s.risk).toFixed(3) : '—';
          return `  ${s.name.padEnd(8)} ${(s.sector || '').padEnd(18)} ${String(s.cost?.toFixed(2)).padEnd(8)} ${String(s.expected_return?.toFixed(2)).padEnd(9)} ${String(s.risk?.toFixed(2)).padEnd(8)} ${sharpe}`;
        }),
        '',
        '  SHARPE INTERPRETATION',
        thin,
        `  Sharpe ${r.sharpe_ratio >= 1.5
          ? '≥ 1.5 → Excellent risk-adjusted return'
          : r.sharpe_ratio >= 0.8
            ? '≥ 0.8 → Acceptable risk-adjusted return'
            : '< 0.8 → Low risk-adjusted return — consider tighter constraints'}`,
        '',
        divider,
        '  Multi-Constraint 0/1 Knapsack Portfolio Optimizer v2.1',
        '  DAA Project · FastAPI + React + Recharts',
        divider,
      ];

      const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio_report_${r.algorithm}_${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setReportLoading(false);
    }
  };

  const maxBudget = Math.max(300, budget + 100);
  const maxRisk = Math.max(100, riskLimit + 20);

  const resultTabs = [
    { key: 'single', label: 'Single Run' },
    { key: 'compare', label: 'Comparison' },
    { key: 'insights', label: 'Analytics' },
    { key: 'frontier', label: 'Frontier' },
  ];

  return (
    <div className="min-h-screen">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 app-topbar">
        <div className="max-w-screen-2xl mx-auto px-6 py-3.5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <BarChart2 size={16} className="text-emerald-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight" style={{ color: 'var(--text-heading)' }}>Knapsack Portfolio Optimizer</h1>
              <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>Multi-Constraint 0/1 Knapsack · DAA Project</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_DATASETS.map((name) => (
              <button
                key={name}
                onClick={() => loadDataset(name)}
                disabled={loadingDataset}
                className="btn-secondary text-xs py-1.5 px-3 capitalize"
              >
                {loadingDataset ? <Loader2 size={12} className="animate-spin" /> : <Database size={12} />}
                {name}
              </button>
            ))}
            <button
              onClick={handleDownloadReport}
              disabled={reportLoading || stocks.length === 0}
              className="btn-secondary text-xs py-1.5 px-3 text-violet-400 border-violet-500/30 hover:border-violet-400/60"
            >
              {reportLoading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
              Report
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-6 py-6 space-y-5">

        {/* ── Academic Banner ── */}
        <div className="contribution-banner">
          <div className="flex items-start gap-3">
            <Info size={16} className="text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                Academic Contribution
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                This project extends classical 0/1 knapsack into a{' '}
                <span className="text-emerald-400 font-semibold">multi-constraint optimization problem</span>{' '}
                by incorporating risk as an additional DP dimension (state:{' '}
                <span className="font-mono text-emerald-400">dp[w][r]</span>), and introduces{' '}
                <span className="text-violet-400 font-semibold">dual-constraint bounding</span>{' '}
                in Branch & Bound — enabling exact optimal solutions under simultaneous budget and risk constraints.
              </p>
            </div>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Budget */}
          <div className="glass-card p-4">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
              Budget Constraint (W)
            </label>
            <span className="text-2xl font-bold text-sky-400 font-mono block mb-2">${budget}</span>
            <input
              type="range" min="10" max={maxBudget} step="5" value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="slider-sky w-full h-1.5 rounded-full appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--text-faint)' }}>
              <span>$10</span><span>${maxBudget}</span>
            </div>
          </div>

          {/* Risk */}
          <div className="glass-card p-4">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
              Risk Limit (R)
            </label>
            <span className="text-2xl font-bold text-rose-400 font-mono block mb-2">{riskLimit}</span>
            <input
              type="range" min="1" max={maxRisk} step="1" value={riskLimit}
              onChange={(e) => setRiskLimit(Number(e.target.value))}
              className="slider-rose w-full h-1.5 rounded-full appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--text-faint)' }}>
              <span>1</span><span>{maxRisk}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="glass-card p-4 flex flex-col gap-3 justify-center">
            <button
              onClick={handleRun}
              disabled={loading || stocks.length === 0}
              className="btn-primary w-full text-sm"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
              {loading ? 'Running...' : 'Run Algorithm'}
            </button>
            <button
              onClick={handleCompare}
              disabled={comparing || stocks.length === 0}
              className="btn-secondary w-full text-sm"
            >
              {comparing ? <Loader2 size={16} className="animate-spin" /> : <BarChart2 size={16} />}
              {comparing ? 'Comparing...' : 'Compare All Algorithms'}
            </button>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="glass-card neon-border-rose p-3 text-sm text-rose-400 flex items-center gap-2 animate-fade-in">
            <span className="text-rose-500 text-base">⚠</span>
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-rose-500 hover:text-rose-300 text-lg leading-none">×</button>
          </div>
        )}

        <AlgorithmSelector selected={algorithm} setSelected={setAlgorithm} />
        <StockTable stocks={stocks} setStocks={setStocks} />

        {/* ── Results ── */}
        {(runResult || compareResults) && (
          <div className="animate-fade-in">
            <div className="flex gap-1 mb-4 p-1 rounded-xl w-fit flex-wrap tab-bar">
              {resultTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${activeTab === tab.key
                      ? 'bg-emerald-500 text-dark-950'
                      : 'hover:text-primary-var'}`}
                  style={activeTab !== tab.key ? { color: 'var(--text-muted)' } : {}}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'single' && runResult && (
              <ResultCard result={runResult} />
            )}

            {activeTab === 'compare' && compareResults && (
              <div className="space-y-5">
                <ComparisonChart results={compareResults} optimalReturn={optimalReturn} />
                <MetricsPanel results={compareResults} optimalReturn={optimalReturn} />
              </div>
            )}

            {activeTab === 'insights' && runResult && (
              <PortfolioInsights
                selectedStocks={runResult.selected_stocks}
                totalReturn={runResult.total_return}
                totalRisk={runResult.total_risk}
              />
            )}

            {activeTab === 'frontier' && (
              <EfficientFrontier stocks={stocks} budget={budget} />
            )}
          </div>
        )}

        {/* ── Empty state ── */}
        {stocks.length === 0 && (
          <div className="glass-card p-12 text-center animate-fade-in">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Database size={28} className="text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-heading)' }}>Load a Dataset to Begin</h3>
            <p className="text-sm mb-5 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
              Click <strong style={{ color: 'var(--text-secondary)' }}>small</strong>,{' '}
              <strong style={{ color: 'var(--text-secondary)' }}>medium</strong>, or{' '}
              <strong style={{ color: 'var(--text-secondary)' }}>large</strong> to load preset stocks,
              or switch to <strong className="text-sky-400">Live Mode</strong> for real market data.
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              {PRESET_DATASETS.map((name) => (
                <button key={name} onClick={() => loadDataset(name)} className="btn-primary capitalize">
                  {name} Dataset
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="mt-12 py-6 text-center text-xs" style={{ borderTop: '1px solid var(--border-card)', color: 'var(--text-faint)' }}>
        Multi-Constraint Knapsack Portfolio Optimizer v2.1 · DAA Project · FastAPI + React + Recharts
      </footer>
    </div>
  );
}
