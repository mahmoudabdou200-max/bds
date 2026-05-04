import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { features } from '../data/features';
import { buildingTypes } from '../data/buildingTypes';
import { wallMaterials, roofMaterials, foundationMaterials } from '../data/materials';
import './SelectPage.css';

export default function FeaturesSelect() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const selectedIds = state.design.featureIds;

  const buildingType = buildingTypes.find(b => b.id === state.design.buildingTypeId);
  const budget = buildingType?.budget || 0;

  let totalCost = 0;
  if (state.design.wallId) { const m = wallMaterials.find(w => w.id === state.design.wallId); if (m) totalCost += m.cost; }
  if (state.design.roofId) { const m = roofMaterials.find(r => r.id === state.design.roofId); if (m) totalCost += m.cost; }
  if (state.design.foundationId) { const m = foundationMaterials.find(f => f.id === state.design.foundationId); if (m) totalCost += m.cost; }
  for (const fid of selectedIds) { const f = features.find(ft => ft.id === fid); if (f) totalCost += f.cost; }

  const budgetPercent = budget > 0 ? (totalCost / budget * 100) : 0;
  const budgetColor = budgetPercent > 100 ? '#F44336' : budgetPercent > 80 ? '#FF9800' : '#4CAF50';

  const getConflicts = (featureId) => {
    const feat = features.find(f => f.id === featureId);
    if (!feat) return [];
    const conflicts = [...feat.conflicts];
    if (featureId === 'feat_solar_panels' && state.design.roofId === 'roof_flat_concrete') {
      conflicts.push('roof_flat_concrete');
    }
    return conflicts;
  };

  const isConflict = (featureId) => {
    const conflicts = getConflicts(featureId);
    return conflicts.some(c => selectedIds.includes(c) || c === state.design.roofId || c === state.design.wallId);
  };

  const handleToggle = (featureId) => {
    const feat = features.find(f => f.id === featureId);
    if (!feat) return;

    if (selectedIds.includes(featureId)) {
      dispatch({ type: 'TOGGLE_FEATURE', payload: featureId });
      return;
    }

    const conflicts = getConflicts(featureId);
    const activeConflict = conflicts.find(c => selectedIds.includes(c));
    if (activeConflict) return;

    if (feat.conflicts.includes('roof_flat_concrete') && state.design.roofId === 'roof_flat_concrete') return;

    dispatch({ type: 'TOGGLE_FEATURE', payload: featureId });
  };

  const categories = ['windows', 'insulation', 'shading', 'energy', 'water', 'ventilation', 'structural'];
  const categoryLabels = {
    windows: '🪟 Windows',
    insulation: '🧥 Insulation',
    shading: '⛱️ Shading',
    energy: '🔋 Energy',
    water: '💧 Water',
    ventilation: '💨 Ventilation',
    structural: '🔩 Structural',
  };

  return (
    <div className="select-page">
      <h1>🔧 Select Features</h1>
      <p className="select-subtitle">Add features to improve building performance (optional)</p>

      <div className="budget-bar-container" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontWeight: 600 }}>Budget</span>
          <span style={{ color: budgetColor, fontWeight: 600 }}>{totalCost.toLocaleString()} / {budget.toLocaleString()} SAR ({budgetPercent.toFixed(0)}%)</span>
        </div>
        <div style={{ background: '#E0E0E0', borderRadius: '8px', height: '12px', overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(budgetPercent, 100)}%`, background: budgetColor, height: '100%', borderRadius: '8px', transition: 'width 0.3s' }} />
        </div>
      </div>

      {categories.map(cat => {
        const catFeatures = features.filter(f => f.category === cat);
        if (catFeatures.length === 0) return null;
        return (
          <div key={cat} style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#263238', marginBottom: '12px' }}>{categoryLabels[cat]}</h3>
            <div className="feature-grid">
              {catFeatures.map(feat => {
                const isSelected = selectedIds.includes(feat.id);
                const hasConflict = isConflict(feat.id);
                return (
                  <div
                    key={feat.id}
                    className={`feature-card ${isSelected ? 'selected' : ''} ${hasConflict ? 'conflict' : ''}`}
                    onClick={() => handleToggle(feat.id)}
                  >
                    <div className="feature-card-header">
                      <span className="feature-card-icon">{feat.icon}</span>
                      <span className="feature-card-name">{feat.nameEn}</span>
                    </div>
                    <div className="feature-card-cost">💰 {feat.cost.toLocaleString()} SAR</div>
                    <p className="feature-card-desc">{feat.description}</p>
                    <div className="feature-effects">
                      {Object.entries(feat.effects).map(([key, val]) => {
                        if (val === 0) return null;
                        return (
                          <span key={key} className={`effect-tag ${val > 0 ? 'effect-positive' : 'effect-negative'}`}>
                            {val > 0 ? '+' : ''}{val} {getFactorLabel(key)}
                          </span>
                        );
                      })}
                    </div>
                    {hasConflict && (
                      <div className="conflict-warning">⚠️ Conflicts with another selection</div>
                    )}
                    {isSelected && (
                      <div className="selected-check">✓ Selected</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="action-bar">
          <button className="next-btn" onClick={() => navigate('/design/summary')}>
            Review Summary →
          </button>
      </div>
    </div>
  );
}

function getFactorLabel(key) {
  const labels = {
    heat: 'Heat',
    coldSnow: 'Cold',
    wind: 'Wind',
    quake: 'Earthquake',
    water: 'Water',
    sustainability: 'Sustainability',
  };
  return labels[key] || key;
}