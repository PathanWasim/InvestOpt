import { useState, useEffect } from 'react';
import './index.css';
import Dashboard from './pages/Dashboard';
import LivePortfolio from './pages/LivePortfolio';
import { BarChart2, Wifi, Moon, Sun } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState('dataset');
  const [darkMode, setDarkMode] = useState(true);

  // Apply theme class to BOTH <html> and <body> so CSS vars cascade everywhere
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    if (darkMode) {
      html.classList.remove('light-theme');
      body.classList.remove('light-theme');
      html.classList.add('dark-theme');
      body.classList.add('dark-theme');
    } else {
      html.classList.remove('dark-theme');
      body.classList.remove('dark-theme');
      html.classList.add('light-theme');
      body.classList.add('light-theme');
    }
  }, [darkMode]);

  return (
    <div>
      {/* ── Global top bar ── */}
      <div className="sticky top-0 z-50 app-topbar">
        <div className="max-w-screen-2xl mx-auto px-6 py-2 flex items-center justify-between gap-2">

          {/* Mode tabs */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMode('dataset')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                ${mode === 'dataset'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'mode-tab-idle border border-transparent'}`}
            >
              <BarChart2 size={12} />
              Dataset Mode
            </button>
            <button
              onClick={() => setMode('live')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                ${mode === 'live'
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                  : 'mode-tab-idle border border-transparent'}`}
            >
              <Wifi size={12} />
              Live Mode
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold">
                LIVE
              </span>
            </button>
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setDarkMode((d) => !d)}
            className="btn-secondary text-xs py-1.5 px-3 gap-1.5"
          >
            {darkMode ? <Sun size={13} /> : <Moon size={13} />}
            {darkMode ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>

      {/* ── Page content ── */}
      {mode === 'dataset'
        ? <Dashboard />
        : (
          <div className="max-w-screen-2xl mx-auto px-6 py-6">
            <LivePortfolio />
          </div>
        )
      }
    </div>
  );
}
