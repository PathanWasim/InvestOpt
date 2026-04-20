import { useState, useCallback } from 'react';
import { Play, BarChart2, Database, Loader2, ChevronDown, RefreshCw, Info } from 'lucide-react';
import StockTable from '../components/StockTable';
import AlgorithmSelector from '../components/AlgorithmSelector';
import ResultCard from '../components/ResultCard';
import ComparisonChart from '../components/ComparisonChart';
import MetricsPanel from '../components/MetricsPanel';
import { runAlgorithm, compareAlgorithms, getDataset } from '../api';

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
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'compare'
  const [loadingDataset, setLoadingDataset] = useState(false);

  // ── Load preset dataset ──
  const loadDataset = useCallback(async (name) => {
    setLoadingDataset(true);
    setError(null);
    try {
      const res = await getDataset(name);
      const d = res.data;
      setStocks(d.stocks);
      setBudget(d.budget);
      setRiskLimit(d.risk_limit);
    } catch (e) {
      setError(`Failed to load dataset: ${e.message}`);
    } finally {
      setLoadingDataset(false);
    }
  }, []);

  // ── Validate inputs ──
  const validateStocks = () => {
    if (stocks.length === 0) return 'Please add at least one stock.';
    for (const s of stocks) {
      if (!s.name) return 'All stocks must have a ticker name.';
      if (!s.cost || s.cost <= 0) return `Stock "${s.name}" must have a positive cost.`;
      if (!s.expected_return || s.expected_return <= 0) return `Stock "${s.name}" must have a positive return.`;
      if (!s.risk || s.risk <= 0) return `Stock "${s.name}" must have a positive risk score.`;
    }
    return null;
  };

  // ── Run single algorithm ──
  const handleRun = async () => {
    const err = validateStocks();
    if (err) { setError(err); return; }
    setLoading(true);
    setError(null);
    setRunResult(null);
    try {
      const payload = { stocks, budget, risk_limit: riskLimit, algorithm };
      const res = await runAlgorithm(payload);
      setRunResult(res.data);
      setActiveTab('single');
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Compare all algorithms ──
  const handleCompare = async () => {
    const err = validateStocks();
    if (err) { setError(err); return; }
    setComparing(true);
    setError(null);
    setCompareResults(null);
    try {
      const payload = { stocks, budget, risk_limit: riskLimit, algorithm };
      const res = await compareAlgorithms(payload);
      setCompareResults(res.data.results);
      setOptimalReturn(res.data.optimal_return);
      setActiveTab('compare');
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setComparing(false);
    }
  };

  const maxBudget = Math.max(300, budget + 100);
  const maxRisk = Math.max(100, riskLimit + 20);

  return (
    <div className="min-h-screen">
      {/* ── Top Nav ── */}
      <header className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-dark-700/50">
        <div className="max-w-screen-2xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <BarChart2 size={16} className="text-emerald-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-100 leading-tight">Knapsack Portfolio Optimizer</h1>
              <p className="text-[10px] text-slate-500">Multi-Constraint 0/1 Knapsack · DAA Project</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-6 py-6 space-y-5">

        {/* ── Academic Contribution Banner ── */}
        <div className="contribution-banner">
          <div className="flex items-start gap-3">
            <Info size={16} className="text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Academic Contribution</div>
              <p className="text-sm text-slate-300 leading-relaxed">
                "This project extends classical 0/1 knapsack into a{' '}
                <span className="text-emerald-400 font-semibold">multi-constraint optimization problem</span>{' '}
                by incorporating risk as an additional dimension in dynamic programming (state:{' '}
                <span className="font-mono text-emerald-400">dp[w][r]</span>), and introduces{' '}
                <span className="text-violet-400 font-semibold">dual-constraint bounding</span>{' '}
                in Branch & Bound, enabling exact optimal solutions under simultaneous budget and risk constraints."
              </p>
            </div>
          </div>
        </div>

        {/* ── Controls Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Budget slider */}
          <div className="glass-card p-4">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Budget Constraint (W)
            </label>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-bold text-sky-400 font-mono">${budget}</span>
            </div>
            <input
              type="range"
              min="10" max={maxBudget} step="5"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-1.5 bg-dark-600 rounded-full appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                         [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-sky-400 [&::-webkit-slider-thumb]:cursor-pointer
                         [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(56,189,248,0.6)]"
            />
            <div className="flex justify-between text-[10px] text-slate-600 mt-1">
              <span>$10</span><span>${maxBudget}</span>
            </div>
          </div>

          {/* Risk slider */}
          <div className="glass-card p-4">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Risk Limit (R)
            </label>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-bold text-rose-400 font-mono">{riskLimit}</span>
            </div>
            <input
              type="range"
              min="1" max={maxRisk} step="1"
              value={riskLimit}
              onChange={(e) => setRiskLimit(Number(e.target.value))}
              className="w-full h-1.5 bg-dark-600 rounded-full appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                         [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-rose-400 [&::-webkit-slider-thumb]:cursor-pointer
                         [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(244,63,94,0.6)]"
            />
            <div className="flex justify-between text-[10px] text-slate-600 mt-1">
              <span>1</span><span>{maxRisk}</span>
            </div>
          </div>

          {/* Action buttons */}
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

        {/* Error */}
        {error && (
          <div className="glass-card neon-border-rose p-3 text-sm text-rose-400 flex items-center gap-2">
            <span className="text-rose-500">⚠</span> {error}
          </div>
        )}

        {/* ── Algorithm Selector ── */}
        <AlgorithmSelector selected={algorithm} setSelected={setAlgorithm} />

        {/* ── Stock Table ── */}
        <StockTable stocks={stocks} setStocks={setStocks} />

        {/* ── Results Tabs ── */}
        {(runResult || compareResults) && (
          <div>
            <div className="flex gap-1 mb-4 p-1 bg-dark-800 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab('single')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${activeTab === 'single'
                    ? 'bg-emerald-500 text-dark-950'
                    : 'text-slate-400 hover:text-slate-200'}`}
              >
                Single Run
              </button>
              <button
                onClick={() => setActiveTab('compare')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${activeTab === 'compare'
                    ? 'bg-emerald-500 text-dark-950'
                    : 'text-slate-400 hover:text-slate-200'}`}
              >
                Comparison
              </button>
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
          </div>
        )}

        {/* ── Empty State ── */}
        {stocks.length === 0 && (
          <div className="glass-card p-12 text-center animate-fade-in">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Database size={28} className="text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Load a Dataset to Begin</h3>
            <p className="text-sm text-slate-500 mb-5 max-w-md mx-auto">
              Click <strong className="text-slate-300">small</strong>, <strong className="text-slate-300">medium</strong>, or <strong className="text-slate-300">large</strong> in the header to load preset stocks,
              or manually add stocks using the table below.
            </p>
            <div className="flex justify-center gap-3">
              {PRESET_DATASETS.map((name) => (
                <button key={name} onClick={() => loadDataset(name)} className="btn-primary capitalize">
                  {name} Dataset
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-dark-700/40 mt-12 py-6 text-center text-xs text-slate-600">
        Multi-Constraint Knapsack Portfolio Optimizer · DAA Project · FastAPI + React + Recharts
      </footer>
    </div>
  );
}
