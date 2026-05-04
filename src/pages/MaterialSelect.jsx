import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { wallMaterials, roofMaterials, foundationMaterials } from '../data/materials';
import { countries } from '../data/countries';
import StarRating from '../components/ScoreDisplay';
import './SelectPage.css';

export function WallSelect() {
  return <MaterialSelect category="wall" materials={wallMaterials} nextPath="/design/roof" title="🧱 Select Wall Material" subtitle="Walls are the first line of defense" />;
}

export function RoofSelect() {
  return <MaterialSelect category="roof" materials={roofMaterials} nextPath="/design/foundation" title="🏠 Select Roof Material" subtitle="Roof protects from above" />;
}

export function FoundationSelect() {
  return <MaterialSelect category="foundation" materials={foundationMaterials} nextPath="/design/features" title="🏗️ Select Foundation" subtitle="Foundation supports the entire building" />;
}

function MaterialSelect({ category, materials, nextPath, title, subtitle }) {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const selectedId = category === 'wall' ? state.design.wallId
    : category === 'roof' ? state.design.roofId
    : state.design.foundationId;

  const dispatchType = category === 'wall' ? 'SET_WALL'
    : category === 'roof' ? 'SET_ROOF'
    : 'SET_FOUNDATION';

  const country = countries.find(c => c.id === state.design.countryId);
  const factorLabels = {
    heat: 'Heat',
    coldSnow: 'Cold/Snow',
    wind: 'Wind',
    quake: 'Earthquake',
    water: 'Water',
    sustainability: 'Sustainability',
  };

  return (
    <div className="select-page">
      <h1>{title}</h1>
      <p className="select-subtitle">{subtitle}</p>

      <div className="cards-grid">
        {materials.map(mat => {
          const isRecommended = country && mat.recommendedFor?.includes(country?.id);
          return (
            <div
              key={mat.id}
              className={`select-card ${selectedId === mat.id ? 'selected' : ''}`}
              onClick={() => {
                dispatch({ type: dispatchType, payload: mat.id });
              }}
            >
              {isRecommended && <span className="recommended-tag">⭐ Recommended for {country?.nameEn}</span>}
              <div className="card-flag">{mat.icon}</div>
              <h3>{mat.nameEn}</h3>
              <p className="card-desc">{mat.description}</p>
              <div className="material-cost">💰 {mat.cost.toLocaleString()} SAR</div>
              <div className="card-challenges">
                {Object.entries(mat.properties).filter(([k]) => k !== 'groundStability').map(([key, val]) => (
                  <div key={key} className="challenge-row">
                    <span className="challenge-name">{factorLabels[key] || key}</span>
                    <StarRating count={val} size="small" />
                  </div>
                ))}
              </div>
              {selectedId === mat.id && (
                <div className="selected-badge">✓ Selected</div>
              )}
            </div>
          );
        })}
      </div>

      {selectedId && (
        <div className="action-bar">
          <button className="next-btn" onClick={() => navigate(nextPath)}>
            Next →
          </button>
        </div>
      )}
      {!selectedId && (
        <div className="action-bar">
          <button className="next-btn" disabled>
            Next →
          </button>
          <p className="required-hint">⚠️ Please select a material to continue</p>
        </div>
      )}
    </div>
  );
}