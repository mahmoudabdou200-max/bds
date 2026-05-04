import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { countries, SeasonLabels } from '../data/countries';
import { buildingTypes } from '../data/buildingTypes';
import { wallMaterials, roofMaterials, foundationMaterials } from '../data/materials';
import { features } from '../data/features';
import { calculateResults } from '../data/scoring';
import './Results.css';
import './SelectPage.css';

export default function DesignSummary() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const d = state.design;

  const country = countries.find(c => c.id === d.countryId);
  const building = buildingTypes.find(b => b.id === d.buildingTypeId);
  const wall = wallMaterials.find(m => m.id === d.wallId);
  const roof = roofMaterials.find(m => m.id === d.roofId);
  const foundation = foundationMaterials.find(m => m.id === d.foundationId);
  const selectedFeatures = features.filter(f => d.featureIds.includes(f.id));

  const totalCost = [wall, roof, foundation, ...selectedFeatures].reduce((sum, item) => sum + (item?.cost || 0), 0);
  const budget = building?.budget || 0;
  const budgetPercent = budget > 0 ? (totalCost / budget * 100) : 0;

  const canSimulate = d.countryId && d.buildingTypeId && d.wallId && d.roofId && d.foundationId;

  const runSimulation = () => {
    const results = calculateResults(
      d.countryId, d.buildingTypeId, d.season,
      d.wallId, d.roofId, d.foundationId, d.featureIds
    );
    dispatch({ type: 'SET_RESULTS', payload: results });
    dispatch({ type: 'START_TIMER' });
    navigate('/results');
  };

  return (
    <div className="summary-page">
      <h1>📋 Design Summary</h1>
      <p className="select-subtitle">Review your choices before running simulation</p>

      <div className="summary-grid">
        <div className="summary-card">
          <h3>🌍 Country</h3>
          <div className="summary-value">{country?.flagEmoji} {country?.nameEn}</div>
          <div className="summary-detail">Season: {SeasonLabels[d.season]}</div>
        </div>

        <div className="summary-card">
          <h3>🏢 Building Type</h3>
          <div className="summary-value">{building?.icon} {building?.nameEn}</div>
          <div className="summary-detail">Budget: {budget.toLocaleString()} SAR</div>
        </div>

        <div className="summary-card">
          <h3>🧱 Walls</h3>
          <div className="summary-value">{wall?.icon} {wall?.nameEn}</div>
          <div className="summary-detail">{wall?.cost.toLocaleString()} SAR</div>
        </div>

        <div className="summary-card">
          <h3>🏠 Roof</h3>
          <div className="summary-value">{roof?.icon} {roof?.nameEn}</div>
          <div className="summary-detail">{roof?.cost.toLocaleString()} SAR</div>
        </div>

        <div className="summary-card">
          <h3>🏗️ Foundation</h3>
          <div className="summary-value">{foundation?.icon} {foundation?.nameEn}</div>
          <div className="summary-detail">{foundation?.cost.toLocaleString()} SAR</div>
        </div>

        <div className="summary-card">
          <h3>🔧 Features</h3>
          <div className="summary-value">
            {selectedFeatures.length > 0
              ? selectedFeatures.map(f => f.icon).join(' ')
              : 'No features added'}
          </div>
          <div className="summary-detail">
            {selectedFeatures.map(f => f.cost).reduce((a, b) => a + b, 0).toLocaleString()} SAR
          </div>
        </div>
      </div>

      <div className="budget-summary" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>💰 Budget</span>
          <span style={{ fontWeight: 700, color: budgetPercent > 100 ? '#F44336' : budgetPercent > 80 ? '#FF9800' : '#4CAF50', fontSize: '1.1rem' }}>
            {totalCost.toLocaleString()} / {budget.toLocaleString()} SAR ({budgetPercent.toFixed(0)}%)
          </span>
        </div>
        <div style={{ background: '#E0E0E0', borderRadius: '12px', height: '20px', overflow: 'hidden' }}>
          <div style={{
            width: `${Math.min(budgetPercent, 100)}%`,
            background: budgetPercent > 100 ? '#F44336' : budgetPercent > 80 ? '#FF9800' : '#4CAF50',
            height: '100%',
            borderRadius: '12px',
            transition: 'width 0.3s',
          }} />
        </div>
        {budgetPercent > 100 && (
          <div style={{ color: '#F44336', fontWeight: 600, marginTop: '8px' }}>
            ⚠️ Over budget by {(budgetPercent - 100).toFixed(0)}%
          </div>
        )}
      </div>

      {building?.specialRequirements?.length > 0 && (
        <div className="requirements-check" style={{ marginBottom: '24px' }}>
          <h3>✅ Special Requirements</h3>
          {building.specialRequirements.map(req => (
            <div key={req.id} className="req-check-item">
              {req.label}
            </div>
          ))}
        </div>
      )}

      <div className="action-bar">
        <button className="next-btn primary-btn" onClick={runSimulation} disabled={!canSimulate}>
          🧪 Test My Building
        </button>
      </div>
    </div>
  );
}