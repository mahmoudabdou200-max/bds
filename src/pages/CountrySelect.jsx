import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { countries, Season, SeasonLabels } from '../data/countries';
import StarRating from '../components/ScoreDisplay';
import './SelectPage.css';

export default function CountrySelect() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const handleSelect = (countryId) => {
    dispatch({ type: 'SET_COUNTRY', payload: countryId });
  };

  const handleSeasonToggle = (season) => {
    dispatch({ type: 'SET_SEASON', payload: season });
  };

  return (
    <div className="select-page">
      <h1>🌍 Select Country</h1>
      <p className="select-subtitle">Each country has different environmental challenges</p>

      <div className="season-toggle">
        <span>Season:</span>
        {Object.values(Season).map(s => (
          <button
            key={s}
            className={`toggle-btn ${state.design.season === s ? 'active' : ''}`}
            onClick={() => handleSeasonToggle(s)}
          >
            {SeasonLabels[s]}
          </button>
        ))}
      </div>

      <div className="cards-grid">
        {countries.map(country => {
          const isLocked = country.unlockRequirement && !state.profile.unlockedCountries?.includes(country.id);
          const requiredCountry = countries.find(c => c.id === country.unlockRequirement?.country);
          return (
            <div
              key={country.id}
              className={`select-card ${isLocked ? 'locked' : ''} ${state.design.countryId === country.id ? 'selected' : ''}`}
              onClick={() => !isLocked && handleSelect(country.id)}
            >
              {isLocked && <div className="lock-overlay">🔒 Score {country.unlockRequirement?.minScore || 40}+ in {requiredCountry?.nameEn || 'an easier country'} first</div>}
              <div className="card-flag">{country.flagEmoji}</div>
              <h3>{country.nameEn}</h3>
              <p className="card-desc">{country.description}</p>
              <div className="card-difficulty">
                <span className="difficulty-badge" style={{ background: country.difficultyColor }}>
                  {country.difficulty}
                </span>
              </div>
              <div className="card-challenges">
                {Object.entries(country.challenges).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([key, val]) => (
                  <div key={key} className="challenge-row">
                    <span className="challenge-name">{getChallengeLabel(key)}</span>
                    <StarRating count={val} size="small" />
                  </div>
                ))}
              </div>
              {state.design.countryId === country.id && (
                <div className="selected-badge">✓ Selected</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="action-bar">
          <button className="next-btn" onClick={() => navigate('/design/building')} disabled={!state.design.countryId}>
            Next: Building Type →
          </button>
          {!state.design.countryId && <p className="required-hint">⚠️ Please select a country to continue</p>}
        </div>
    </div>
  );
}

function getChallengeLabel(key) {
  const labels = {
    heat: 'Heat',
    coldSnow: 'Cold/Snow',
    wind: 'Wind',
    quake: 'Earthquake',
    water: 'Water',
    sustainability: 'Sustainability',
    sandstorms: 'Sandstorms',
    humidity: 'Humidity',
    waterScarcity: 'Water Scarcity',
    rain: 'Rain',
  };
  return labels[key] || key;
}