import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { buildingTypes } from '../data/buildingTypes';
import './SelectPage.css';

export default function BuildingTypeSelect() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const handleSelect = (typeId) => {
    dispatch({ type: 'SET_BUILDING_TYPE', payload: typeId });
    navigate('/design/walls');
  };

  return (
    <div className="select-page">
      <h1>🏢 Select Building Type</h1>
      <p className="select-subtitle">Each type has special requirements and budget</p>

      <div className="cards-grid">
        {buildingTypes.map(type => (
          <div
            key={type.id}
            className={`select-card ${state.design.buildingTypeId === type.id ? 'selected' : ''}`}
            onClick={() => handleSelect(type.id)}
          >
            <div className="card-flag">{type.icon}</div>
            <h3>{type.nameEn}</h3>
            <p className="card-desc">{type.description}</p>
            <div className="card-difficulty">
              <span className="difficulty-badge" style={{ background: type.difficultyColor }}>
                {type.difficulty}
              </span>
            </div>
            <div className="budget-info">
              💰 Budget: {type.budget.toLocaleString()} SAR
            </div>
            {type.specialRequirements.length > 0 && (
              <div className="requirements-list">
                <strong>Requirements:</strong>
                {type.specialRequirements.map(req => (
                  <div key={req.id} className="req-item">✓ {req.label}</div>
                ))}
              </div>
            )}
            {state.design.buildingTypeId === type.id && (
              <div className="selected-badge">✓ Selected</div>
            )}
          </div>
        ))}
      </div>

      {state.design.buildingTypeId && (
        <div className="action-bar">
          <button className="next-btn" onClick={() => navigate('/design/walls')}>
            Next: Wall Materials →
          </button>
        </div>
      )}
    </div>
  );
}