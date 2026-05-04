import { FactorLabels, getRating } from '../data/constants';
import { calculateResults } from '../data/scoring';
import { countries } from '../data/countries';
import { buildingTypes } from '../data/buildingTypes';
import { wallMaterials, roofMaterials, foundationMaterials } from '../data/materials';
import { features } from '../data/features';
import './LiveScores.css';

export default function LiveScores({ countryId, buildingTypeId, season, wallId, roofId, foundationId, featureIds }) {
  if (!countryId || !buildingTypeId || !wallId || !roofId || !foundationId) {
    return (
      <div className="live-scores">
        <h3 className="scores-title">📊 Live Score</h3>
        <p className="scores-placeholder">Choose materials to see live score</p>
      </div>
    );
  }

  const results = calculateResults(countryId, buildingTypeId, season, wallId, roofId, foundationId, featureIds || []);

  if (!results) {
    return (
      <div className="live-scores">
        <h3 className="scores-title">📊 Live Score</h3>
        <p className="scores-placeholder">Calculation error</p>
      </div>
    );
  }

  const country = countries.find(c => c.id === countryId);
  const allFactors = Object.entries(results.factorScores);
 
  return (
    <div className="live-scores">
      <h3 className="scores-title">📊 Live Score</h3>

      <div className="overall-live-score">
        <div className="overall-score-ring" style={{ background: `conic-gradient(${getRating(results.overallScore).color} ${results.overallScore * 3.6}deg, #e0e0e0 ${results.overallScore * 3.6}deg)` }}>
          <div className="overall-score-inner">
            <span className="overall-score-number" style={{ color: getRating(results.overallScore).color }}>{results.overallScore}</span>
            <span className="overall-score-label">out of 100</span>
          </div>
        </div>
      </div>

      <div className="factor-bars">
        {allFactors.map(([factor, score]) => {
          const rating = getRating(score);
          const weight = country?.weights?.[factor] || 0;
          const showWeight = weight > 0;
          return (
            <div key={factor} className="factor-bar-row">
              <div className="factor-bar-label">
                <span className="factor-name">{FactorLabels[factor] || factor}</span>
                {showWeight && <span className="factor-weight" style={{ background: rating.color + '22', color: rating.color }}>Weight: {Math.round(weight * 100)}%</span>}
              </div>
              <div className="factor-bar-track">
                <div
                  className="factor-bar-fill"
                  style={{
                    width: `${score}%`,
                    backgroundColor: rating.color,
                    transition: 'width 0.5s ease, background-color 0.3s ease',
                  }}
                />
              </div>
              <span className="factor-bar-score" style={{ color: rating.color }}>{score}</span>
            </div>
          );
        })}
      </div>

      <div className="budget-mini">
        <span className="budget-label">💰 Budget:</span>
        <div className="budget-mini-track">
          <div
            className="budget-mini-fill"
            style={{
              width: `${Math.min(100, results.totalCost / results.budget * 100)}%`,
              background: results.totalCost > results.budget ? '#F44336' : results.totalCost > results.budget * 0.8 ? '#FF9800' : '#4CAF50',
              transition: 'width 0.5s ease',
            }}
          />
        </div>
        <span className="budget-num" style={{ color: results.totalCost > results.budget ? '#F44336' : '#263238' }}>
          {results.totalCost.toLocaleString()} / {results.budget.toLocaleString()} SAR
        </span>
      </div>

      {results.warnings.length > 0 && (
        <div className="live-warnings">
          {results.warnings.slice(0, 2).map((w, i) => (
            <div key={i} className={`live-warning live-warning-${w.type}`}>
              {w.type === 'critical' ? '🔴' : w.type === 'moderate' ? '🟡' : '🔵'} {w.message}
            </div>
          ))}
          {results.warnings.length > 2 && (
            <div className="live-warning-more">+{results.warnings.length - 2} more warnings</div>
          )}
        </div>
      )}
    </div>
  );
}