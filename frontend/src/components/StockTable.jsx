import { useState } from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';

const SECTORS = ['Technology', 'Finance', 'Healthcare', 'E-Commerce', 'Energy', 'Defense', 'Biotech', 'SaaS', 'Cloud', 'Semiconductors', 'Streaming', 'EV', 'General'];

const defaultStock = (id) => ({
  id,
  name: '',
  cost: '',
  expected_return: '',
  risk: '',
  sector: 'Technology',
});

export default function StockTable({ stocks, setStocks }) {
  const handleChange = (idx, field, value) => {
    setStocks((prev) =>
      prev.map((s, i) =>
        i === idx ? { ...s, [field]: field === 'name' || field === 'sector' ? value : Number(value) } : s
      )
    );
  };

  const addRow = () => {
    const newId = stocks.length > 0 ? Math.max(...stocks.map((s) => s.id)) + 1 : 1;
    setStocks((prev) => [...prev, defaultStock(newId)]);
  };

  const removeRow = (idx) => {
    setStocks((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="glass-card p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="section-title">Stock Universe</h2>
          <p className="text-xs text-slate-500 mt-0.5">{stocks.length} stock{stocks.length !== 1 ? 's' : ''} loaded</p>
        </div>
        <button onClick={addRow} className="btn-secondary text-xs gap-1.5">
          <Plus size={14} />
          Add Stock
        </button>
      </div>

      <div className="table-scroll rounded-xl overflow-hidden border border-dark-600/50">
        <table className="data-table">
          <thead className="sticky top-0 bg-dark-800">
            <tr>
              <th>#</th>
              <th>Ticker</th>
              <th>Sector</th>
              <th>Cost ($)</th>
              <th>Return ($)</th>
              <th>Risk Score</th>
              <th>Ratio</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock, idx) => {
              const ratio = stock.cost > 0 ? (stock.expected_return / stock.cost).toFixed(2) : '—';
              return (
                <tr key={stock.id} className="group">
                  <td className="text-slate-500 font-mono text-xs">{idx + 1}</td>
                  <td>
                    <input
                      className="input-field py-1.5 font-mono font-semibold uppercase"
                      value={stock.name}
                      placeholder="AAPL"
                      onChange={(e) => handleChange(idx, 'name', e.target.value.toUpperCase())}
                    />
                  </td>
                  <td>
                    <div className="relative">
                      <select
                        className="input-field py-1.5 pr-7 appearance-none"
                        value={stock.sector}
                        onChange={(e) => handleChange(idx, 'sector', e.target.value)}
                      >
                        {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                  </td>
                  <td>
                    <input
                      className="input-field py-1.5 w-20"
                      type="number"
                      min="1"
                      value={stock.cost}
                      placeholder="0"
                      onChange={(e) => handleChange(idx, 'cost', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="input-field py-1.5 w-20 text-emerald-400"
                      type="number"
                      min="1"
                      value={stock.expected_return}
                      placeholder="0"
                      onChange={(e) => handleChange(idx, 'expected_return', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="input-field py-1.5 w-20 text-rose-400"
                      type="number"
                      min="1"
                      value={stock.risk}
                      placeholder="0"
                      onChange={(e) => handleChange(idx, 'risk', e.target.value)}
                    />
                  </td>
                  <td>
                    <span className={`font-mono text-xs font-bold ${Number(ratio) >= 1.5 ? 'text-emerald-400' : Number(ratio) >= 1 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {ratio}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => removeRow(idx)}
                      className="btn-danger py-1.5 px-2 opacity-0 group-hover:opacity-100"
                      title="Remove"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {stocks.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p className="text-sm">No stocks loaded. Load a dataset or add rows manually.</p>
          </div>
        )}
      </div>
    </div>
  );
}
