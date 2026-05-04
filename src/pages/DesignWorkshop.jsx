import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { countries } from '../data/countries';
import { buildingTypes } from '../data/buildingTypes';
import { wallMaterials, roofMaterials, foundationMaterials } from '../data/materials';
import { features as allFeatures } from '../data/features';
import BuildingCanvas from '../components/BuildingCanvas';
import LiveScores from '../components/LiveScores';
import './DesignWorkshop.css';

export default function DesignWorkshop() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const d = state.design;
  const [activeTab, setActiveTab] = useState('walls');

  const building = buildingTypes.find(b => b.id === d.buildingTypeId);
  const wall = wallMaterials.find(m => m.id === d.wallId);
  const roof = roofMaterials.find(m => m.id === d.roofId);
  const foundation = foundationMaterials.find(m => m.id === d.foundationId);
  const selectedFeatures = allFeatures.filter(f => d.featureIds.includes(f.id));

  const budget = building?.budget || 0;
  let totalCost = 0;
  if (wall) totalCost += wall.cost;
  if (roof) totalCost += roof.cost;
  if (foundation) totalCost += foundation.cost;
  for (const fid of d.featureIds) {
    const f = allFeatures.find(ft => ft.id === fid);
    if (f) totalCost += f.cost;
  }
  const budgetPct = budget > 0 ? (totalCost / budget * 100) : 0;
  const remainingBudget = budget - totalCost;

  const canSimulate = d.countryId && d.buildingTypeId && d.wallId && d.roofId && d.foundationId;

  const handleSelect = (type, id) => {
    if (type === 'wall') dispatch({ type: 'SET_WALL', payload: id });
    else if (type === 'roof') dispatch({ type: 'SET_ROOF', payload: id });
    else if (type === 'foundation') dispatch({ type: 'SET_FOUNDATION', payload: id });
  };

  const toggleFeature = (featId) => {
    const feature = allFeatures.find(f => f.id === featId);
    if (!feature) return;
    
    if (d.featureIds.includes(featId)) {
      dispatch({ type: 'REMOVE_FEATURE', payload: featId });
    } else {
      if (remainingBudget >= feature.cost) {
        dispatch({ type: 'ADD_FEATURE', payload: featId });
      }
    }
  };

  const handleSimulate = () => {
    navigate('/results');
  };

  const getActiveGroup = () => {
    if (activeTab === 'walls') return wallMaterials;
    if (activeTab === 'roof') return roofMaterials;
    if (activeTab === 'foundation') return foundationMaterials;
    return [];
  };

  const canAfford = (cost) => remainingBudget >= cost;

  return (
    <div className="design-workshop">
      <div className="workshop-header">
        <select value={d.countryId || ''} onChange={e => dispatch({ type: 'SET_COUNTRY', payload: e.target.value })}>
          <option value="">🌍 Select Country</option>
          {countries.map(c => <option key={c.id} value={c.id}>{c.flagEmoji} {c.nameEn}</option>)}
        </select>

        <select value={d.buildingTypeId || ''} onChange={e => dispatch({ type: 'SET_BUILDING_TYPE', payload: e.target.value })}>
          <option value="">🏢 Select Building Type</option>
          {buildingTypes.map(b => <option key={b.id} value={b.id}>{b.icon} {b.nameEn}</option>)}
        </select>

        <select value={d.season || 'summer'} onChange={e => dispatch({ type: 'SET_SEASON', payload: e.target.value })}>
          <option value="summer">☀️ Summer</option>
          <option value="winter">❄️ Winter</option>
        </select>
      </div>

      <div className="workshop-main">
        <div className="workshop-canvas-area">
          <BuildingCanvas
            wallId={d.wallId}
            roofId={d.roofId}
            foundationId={d.foundationId}
            featureIds={d.featureIds}
            buildingTypeId={d.buildingTypeId}
            countryId={d.countryId}
            size="large"
          />
          
          <div className="material-chips">
            <button className={`chip ${wall ? 'active' : ''}`} onClick={() => setActiveTab('walls')}>
              {wall ? wall.icon : '🧱'} {wall?.nameEn || 'Wall'}
            </button>
            <button className={`chip ${roof ? 'active' : ''}`} onClick={() => setActiveTab('roof')}>
              {roof ? roof.icon : '🏠'} {roof?.nameEn || 'Roof'}
            </button>
            <button className={`chip ${foundation ? 'active' : ''}`} onClick={() => setActiveTab('foundation')}>
              {foundation ? foundation.icon : '🏗️'} {foundation?.nameEn || 'Foundation'}
            </button>
          </div>

          <div className="budget-info">
            <span>💰 {totalCost.toLocaleString()} / {budget.toLocaleString()} SAR ({budgetPct.toFixed(0)}%)</span>
            <div className="budget-bar">
              <div className="budget-fill" style={{ 
                width: `${Math.min(budgetPct, 100)}%`, 
                background: budgetPct > 100 ? '#F44336' : budgetPct > 80 ? '#FF9800' : '#4CAF50' 
              }}></div>
            </div>
            {remainingBudget > 0 && (
              <span className="remaining">Available: {remainingBudget.toLocaleString()} SAR</span>
            )}
          </div>

          <LiveScores
            countryId={d.countryId}
            buildingTypeId={d.buildingTypeId}
            season={d.season}
            wallId={d.wallId}
            roofId={d.roofId}
            foundationId={d.foundationId}
            featureIds={d.featureIds}
          />
        </div>

        <div className="workshop-palette">
          <div className="palette-tabs">
            <button className={`tab ${activeTab === 'walls' ? 'active' : ''}`} onClick={() => setActiveTab('walls')}>🧱 Walls</button>
            <button className={`tab ${activeTab === 'roof' ? 'active' : ''}`} onClick={() => setActiveTab('roof')}>🏠 Roof</button>
            <button className={`tab ${activeTab === 'foundation' ? 'active' : ''}`} onClick={() => setActiveTab('foundation')}>🏗️ Foundation</button>
            <button className={`tab ${activeTab === 'features' ? 'active' : ''}`} onClick={() => setActiveTab('features')}>🔧 Features ({d.featureIds.length})</button>
          </div>

          <div className="palette-items">
            {activeTab === 'features' && (
              <div className="features-section">
                <p className="features-info">Select features within your remaining budget: <strong>{remainingBudget.toLocaleString()} SAR</strong></p>
                <div className="features-grid">
                  {allFeatures.map(feat => {
                    const isSelected = d.featureIds.includes(feat.id);
                    const affordable = canAfford(feat.cost);
                    return (
                      <button
                        key={feat.id}
                        className={`feature-card ${isSelected ? 'selected' : ''} ${!affordable && !isSelected ? 'disabled' : ''}`}
                        onClick={() => toggleFeature(feat.id)}
                        disabled={!affordable && !isSelected}
                      >
                        <span className="feat-icon">{feat.icon}</span>
                        <span className="feat-name">{feat.nameEn}</span>
                        <span className="feat-cost">{feat.cost.toLocaleString()} SAR</span>
                        {isSelected && <span className="check">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab !== 'features' && (
              <div className="materials-list">
                {getActiveGroup().map(mat => (
                  <button
                    key={mat.id}
                    className={`mat-card ${(activeTab === 'walls' && d.wallId === mat.id) || (activeTab === 'roof' && d.roofId === mat.id) || (activeTab === 'foundation' && d.foundationId === mat.id) ? 'selected' : ''}`}
                    onClick={() => handleSelect(activeTab === 'walls' ? 'wall' : activeTab === 'roof' ? 'roof' : 'foundation', mat.id)}
                  >
                    <span className="mat-icon">{mat.icon}</span>
                    <span className="mat-name">{mat.nameEn}</span>
                    <span className="mat-cost">{mat.cost.toLocaleString()} SAR</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <button className="simulate-btn" onClick={handleSimulate} disabled={!canSimulate}>
        🧪 Test My Building
      </button>
    </div>
  );
}