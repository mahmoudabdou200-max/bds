import { useApp } from '../context/AppContext';
import './Results.css';

export default function Leaderboard() {
  const { state } = useApp();
  const designs = state.savedDesigns || [];
  const sorted = [...designs]
    .filter(d => d.results?.overallScore)
    .sort((a, b) => b.results.overallScore - a.results.overallScore)
    .slice(0, 10);

  return (
    <div className="summary-page">
      <h1>🏆 Leaderboard</h1>
      <p className="select-subtitle">Top scores across all designs</p>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏆</div>
          <p>No results yet. Be the first to test your building!</p>
          <button className="next-btn" onClick={() => window.location.href = '/'}>
            🚀 Start New Design
          </button>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#E3F2FD' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>#</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Design</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Score</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((d, i) => (
                <tr key={d.id} style={{ borderBottom: '1px solid #E0E0E0' }}>
                  <td style={{ padding: '12px', fontWeight: 700 }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</td>
                  <td style={{ padding: '12px' }}>{d.name}</td>
                  <td style={{ padding: '12px', fontWeight: 700, color: d.results.overallScore >= 70 ? '#4CAF50' : d.results.overallScore >= 50 ? '#FFC107' : '#F44336' }}>{d.results.overallScore}/100</td>
                  <td style={{ padding: '12px', color: '#78909C' }}>{new Date(d.timestamp).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}