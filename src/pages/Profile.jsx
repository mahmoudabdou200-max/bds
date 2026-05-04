import { useApp } from '../context/AppContext';
import { getLevel } from '../context/AppContext';
import { badges } from '../data/badges';
import './Results.css';

export default function Profile() {
  const { state } = useApp();
  const profile = state.profile;
  const level = getLevel(profile.xp);
  const levelTitles = { 1: 'Building Trainee', 5: 'Junior Engineer', 10: 'Expert Designer', 15: 'Professional Engineer', 20: 'Legendary Engineer' };
  const currentTitle = Object.entries(levelTitles).reverse().find(([l]) => level >= Number(l))?.[1] || 'Building Trainee';

  return (
    <div className="summary-page">
      <h1>👤 Profile</h1>

      <div className="overall-score-section" style={{ borderColor: '#1976D2' }}>
        <div className="overall-score-circle" style={{ borderColor: '#1976D2' }}>
          <div className="score-number" style={{ color: '#1976D2' }}>{level}</div>
          <div className="score-rating-label" style={{ color: '#1976D2' }}>{currentTitle}</div>
          <div className="score-out-of" style={{ color: '#546E7A' }}>
            {profile.xp.toLocaleString()} XP
          </div>
        </div>
        <div className="overall-info">
          <div><strong>Name:</strong> {profile.name || 'Student'}</div>
          <div><strong>Simulations:</strong> {profile.totalSimulations}</div>
          <div><strong>Countries Unlocked:</strong> {profile.unlockedCountries?.length || 1}</div>
        </div>
      </div>

      <h2 style={{ color: '#263238', margin: '32px 0 16px' }}>🏆 Badges</h2>
      <div className="cards-grid">
        {badges.map(badge => {
          const isEarned = profile.badges?.includes(badge.id);
          return (
            <div key={badge.id} className={`select-card ${isEarned ? 'selected' : ''}`} style={{ opacity: isEarned ? 1 : 0.4, cursor: 'default' }}>
              <div className="card-flag" style={{ fontSize: '2rem' }}>{badge.icon}</div>
              <h3>{badge.nameEn}</h3>
              <p className="card-desc">{badge.description}</p>
              <div style={{ fontSize: '0.8rem', color: '#78909C' }}>+200 XP</div>
              {isEarned && <div className="selected-badge">✓ Earned</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}