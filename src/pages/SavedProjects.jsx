import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Results.css';

export default function SavedProjects() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const designs = state.savedDesigns || [];

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this design?')) {
      dispatch({ type: 'DELETE_DESIGN', payload: id });
    }
  };

  return (
    <div className="summary-page">
      <h1>📁 Saved Projects</h1>
      <p className="select-subtitle">All your saved designs</p>

      {designs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No saved projects yet.</p>
          <button className="next-btn" onClick={() => navigate('/design/country')}>
            🚀 Start New Design
          </button>
        </div>
      ) : (
        <div className="cards-grid">
          {designs.map(design => (
            <div key={design.id} className="select-card" style={{ cursor: 'default' }}>
              <div className="card-flag">{design.buildingTypeId === 'house' ? '🏠' : design.buildingTypeId === 'school' ? '🏫' : '🏥'}</div>
              <h3>{design.name}</h3>
              <div className="card-desc">
                {new Date(design.timestamp).toLocaleDateString()}
              </div>
              <div className="card-desc">
                Overall Score: <strong>{design.results?.overallScore || '—'}</strong>/100
              </div>
              <div className="card-desc">
                Cost: {design.results?.totalCost?.toLocaleString() || '—'} SAR
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button className="action-btn secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => handleDelete(design.id)}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}