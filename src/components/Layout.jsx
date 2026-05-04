import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { buildingTypes } from '../data/buildingTypes';
import { wallMaterials, roofMaterials, foundationMaterials } from '../data/materials';
import { features } from '../data/features';
import './Layout.css';

const steps = [
  { path: '/design', label: 'Workshop' },
  { path: '/design/country', label: 'Country' },
  { path: '/design/building', label: 'Building' },
  { path: '/design/walls', label: 'Walls' },
  { path: '/design/roof', label: 'Roof' },
  { path: '/design/foundation', label: 'Foundation' },
  { path: '/design/features', label: 'Features' },
  { path: '/design/summary', label: 'Summary' },
];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const isDark = state.theme === 'dark';
  const isDesignFlow = location.pathname.startsWith('/design') || location.pathname === '/results';
  const currentStepIndex = steps.findIndex(s => location.pathname.startsWith(s.path));

  const budget = state.design.buildingTypeId
    ? buildingTypes.find(b => b.id === state.design.buildingTypeId)?.budget || 0
    : 0;

  let totalCost = 0;
  if (state.design.wallId) {
    const w = wallMaterials.find(m => m.id === state.design.wallId);
    if (w) totalCost += w.cost;
  }
  if (state.design.roofId) {
    const r = roofMaterials.find(m => m.id === state.design.roofId);
    if (r) totalCost += r.cost;
  }
  if (state.design.foundationId) {
    const f = foundationMaterials.find(m => m.id === state.design.foundationId);
    if (f) totalCost += f.cost;
  }
  for (const fid of state.design.featureIds) {
    const feat = features.find(f => f.id === fid);
    if (feat) totalCost += feat.cost;
  }

  return (
    <div className="app-layout" data-theme={state.theme}>
      <header className="app-header">
        <Link to="/" className="app-logo">🏗️ Building Design Simulator</Link>
        <nav className="header-nav">
          <Link to="/saved">Projects</Link>
          <Link to="/leaderboard">Leaderboard</Link>
          <Link to="/profile">Profile</Link>
          <button
            className="theme-toggle"
            onClick={() => dispatch({ type: 'SET_THEME', payload: isDark ? 'light' : 'dark' })}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </nav>
      </header>

      {isDesignFlow && currentStepIndex >= 0 && (
        <div className="breadcrumb-bar">
          {steps.map((step, i) => (
            <span
              key={step.path}
              className={`breadcrumb-item ${i === currentStepIndex ? 'active' : ''} ${i < currentStepIndex ? 'completed' : ''} ${i > currentStepIndex ? 'disabled' : ''}`}
              role="button"
              tabIndex={i <= currentStepIndex ? 0 : -1}
              onClick={() => { if (i <= currentStepIndex) navigate(step.path); }}
              onKeyDown={e => { if (e.key === 'Enter' && i <= currentStepIndex) navigate(step.path); }}
            >
              <span className="breadcrumb-num">{i + 1}</span>
              <span className="breadcrumb-label">{step.label}</span>
            </span>
          ))}
          {budget > 0 && (
            <div className="budget-display">
              {totalCost.toLocaleString()} / {budget.toLocaleString()} SAR
            </div>
          )}
        </div>
      )}

      <main className="app-main">
        {children}
      </main>

      <footer className="app-footer">
        Building Design Simulator - Educational Version
      </footer>
    </div>
  );
}