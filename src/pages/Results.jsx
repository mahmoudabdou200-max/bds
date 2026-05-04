import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { countries, getDisasterTypeForCountry } from '../data/countries';
import { buildingTypes } from '../data/buildingTypes';
import { wallMaterials, roofMaterials, foundationMaterials } from '../data/materials';
import { features } from '../data/features';
import { getRating, FactorLabels, Factor } from '../data/constants';
import { calculateResults, generateComments } from '../data/scoring';
import { badges } from '../data/badges';
import BuildingCanvas from '../components/BuildingCanvas';
import './Results.css';

export default function Results() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const d = state.design;
  const [results, setResults] = useState(null);
  const [simPhase, setSimPhase] = useState(0);
  const [saved, setSaved] = useState(false);
  const mountedRef = useRef(true);
  const rewardsApplied = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    
    if (!d.countryId || !d.buildingTypeId || !d.wallId || !d.roofId || !d.foundationId) {
      navigate('/design', { replace: true });
      return;
    }

    const res = calculateResults(
      d.countryId, d.buildingTypeId, d.season,
      d.wallId, d.roofId, d.foundationId, d.featureIds
    );
    
    if (mountedRef.current) setResults(res);

    const t1 = setTimeout(() => { if (mountedRef.current) setSimPhase(1); }, 500);
    const t2 = setTimeout(() => { if (mountedRef.current) setSimPhase(2); }, 2500);
    const t3 = setTimeout(() => { if (mountedRef.current) setSimPhase(3); }, 5000);
    const t4 = setTimeout(() => { if (mountedRef.current) setSimPhase(4); }, 7000);
    
    return () => { mountedRef.current = false; clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [d, navigate]);

  useEffect(() => {
    if (simPhase < 4 || !results || rewardsApplied.current) return;
    rewardsApplied.current = true;

    const xpEarned = Math.max(10, Math.round(results.overallScore * 1.5));
    dispatch({ type: 'ADD_XP', payload: xpEarned });

    dispatch({
      type: 'SET_PROFILE',
      payload: {
        totalSimulations: state.profile.totalSimulations + 1,
        bestScores: {
          ...state.profile.bestScores,
          [d.countryId]: Math.max(state.profile.bestScores?.[d.countryId] || 0, results.overallScore),
        },
        bestSustainability: Math.max(state.profile.bestSustainability, results.factorScores[Factor.SUSTAINABILITY] || 0),
        bestQuakeJapan: d.countryId === 'japan' ? Math.max(state.profile.bestQuakeJapan, results.factorScores[Factor.QUAKE] || 0) : state.profile.bestQuakeJapan,
        bestColdCanada: d.countryId === 'canada' ? Math.max(state.profile.bestColdCanada, results.factorScores[Factor.COLD_SNOW] || 0) : state.profile.bestColdCanada,
        bestWaterNetherlands: d.countryId === 'netherlands' ? Math.max(state.profile.bestWaterNetherlands, results.factorScores[Factor.WATER] || 0) : state.profile.bestWaterNetherlands,
        perfectScoreCount: results.overallScore >= 100 ? state.profile.perfectScoreCount + 1 : state.profile.perfectScoreCount,
      },
    });

    const hardCountries = ['japan', 'netherlands', 'usa_california', 'indonesia', 'philippines'];
    if (hardCountries.includes(d.countryId) && results.overallScore >= 90) {
      dispatch({ type: 'SET_PROFILE', payload: { bestHardCountryScore: Math.max(state.profile.bestHardCountryScore, results.overallScore) } });
    }

    const budgetPct = results.budget > 0 ? (results.totalCost / results.budget) : 1;
    if (budgetPct >= 0.95 && budgetPct <= 1.05) {
      dispatch({ type: 'SET_PROFILE', payload: { withinBudget5Pct: true } });
    }
    if (budgetPct <= 0.5) {
      dispatch({ type: 'SET_PROFILE', payload: { underBudget50Pct: true } });
    }

    const elapsed = d.startTime ? (Date.now() - d.startTime) / 1000 : Infinity;
    dispatch({ type: 'SET_PROFILE', payload: { fastestDesign: Math.min(state.profile.fastestDesign, elapsed) } });
    dispatch({ type: 'SET_PROFILE', payload: { maxRedesigns: Math.max(state.profile.maxRedesigns, d.attemptNumber) } });

    for (const badge of badges) {
      if (badge.condition({ ...state.profile, totalSimulations: state.profile.totalSimulations + 1 })) {
        dispatch({ type: 'ADD_BADGE', payload: badge.id });
      }
    }

    const newUnlocked = [...(state.profile.unlockedCountries || ['saudi'])];
    for (const country of countries) {
      if (country.unlockRequirement && !newUnlocked.includes(country.id)) {
        const req = country.unlockRequirement;
        const reqScore = state.profile.bestScores?.[req.country] || 0;
        if (reqScore >= (req.minScore || 40)) {
          newUnlocked.push(country.id);
        }
      }
    }
    dispatch({ type: 'SET_PROFILE', payload: { unlockedCountries: newUnlocked } });
  }, [simPhase, results, dispatch, d, state.profile]);

  if (!results || simPhase < 4) {
    const country = countries.find(c => c.id === d.countryId);
    const disasterType = getDisasterTypeForCountry(d.countryId);
    
    const getDisasterMessage = () => {
      if (simPhase === 0) return '🧪 Initializing simulation...';
      if (simPhase === 1) {
        switch(disasterType) {
          case 'earthquake': return '🌋 MAJOR EARTHQUAKE! 7.5 MAGNITUDE!';
          case 'flood': return '🌊 CATASTROPHIC FLOODING!';
          case 'heat_wave': return '🌡️ EXTREME HEAT WAVE 50°C!';
          case 'sandstorm': return '🏜️ MASSIVE SANDSTORM!';
          case 'blizzard': return '❄️ SEVERE BLIZZARD -40°C!';
          case 'typhoon': return '🌀 SUPER TYPHOON 250km/h!';
          case 'bushfire': return '🔥 CATASTROPHIC BUSHFIRE!';
          case 'tsunami': return '🌊 TSUNAMI WARNING 15m WAVES!';
          default: return '⚠️ SIMULATING DISASTER...';
        }
      }
      if (simPhase === 2) return '💥 Analyzing structural damage...';
      if (simPhase === 3) return '📊 Calculating resilience...';
      return '⏳ Please wait...';
    };

    const getDisasterColor = () => {
      switch(disasterType) {
        case 'earthquake': return 'linear-gradient(180deg, #795548, #4E342E)';
        case 'flood': return 'linear-gradient(180deg, #1565C0, #0D47A1)';
        case 'heat_wave': return 'linear-gradient(180deg, #FF6F00, #E65100)';
        case 'sandstorm': return 'linear-gradient(180deg, #D4A574, #A1887F)';
        case 'blizzard': return 'linear-gradient(180deg, #90CAF9, #42A5F5)';
        case 'typhoon': return 'linear-gradient(180deg, #607D8B, #37474F)';
        case 'bushfire': return 'linear-gradient(180deg, #FF5722, #BF360C)';
        case 'tsunami': return 'linear-gradient(180deg, #0D47A1, #002171)';
        default: return 'linear-gradient(180deg, #546E7A, #37474F)';
      }
    };
    
    return (
      <div className="results-page">
        <div className="disaster-simulation" style={{ background: getDisasterColor() }}>
          <div className="sim-building-area">
            <BuildingCanvas
              wallId={d.wallId}
              roofId={d.roofId}
              foundationId={d.foundationId}
              featureIds={d.featureIds}
              buildingTypeId={d.buildingTypeId}
              countryId={d.countryId}
              size="large"
            />
            
            {/* Disaster Effects Overlay */}
            {simPhase >= 1 && (
              <div className={`disaster-overlay disaster-${disasterType}`}>
                {disasterType === 'earthquake' && (
                  <>
                    <div className="quake-shake"></div>
                    <div className="cracks"></div>
                  </>
                )}
                {disasterType === 'flood' && (
                  <div className="flood-water"></div>
                )}
                {disasterType === 'heat_wave' && (
                  <div className="heat-flames"></div>
                )}
                {disasterType === 'sandstorm' && (
                  <div className="sand-particles"></div>
                )}
                {disasterType === 'blizzard' && (
                  <div className="snow-blizzard"></div>
                )}
                {disasterType === 'typhoon' && (
                  <div className="wind-destroy"></div>
                )}
                {disasterType === 'bushfire' && (
                  <div className="fire-spread"></div>
                )}
                {disasterType === 'tsunami' && (
                  <div className="tsunami-wave"></div>
                )}
              </div>
            )}
            
            <div className="disaster-message">
              {getDisasterMessage()}
            </div>
            
            <div className="disaster-progress">
              <div className={`prog-step ${simPhase >= 1 ? 'done' : ''}`}>
                <span>1</span><label>Disaster</label>
              </div>
              <div className="prog-line"></div>
              <div className={`prog-step ${simPhase >= 2 ? 'done' : ''}`}>
                <span>2</span><label>Damage</label>
              </div>
              <div className="prog-line"></div>
              <div className={`prog-step ${simPhase >= 3 ? 'done' : ''}`}>
                <span>3</span><label>Calculate</label>
              </div>
              <div className="prog-line"></div>
              <div className={`prog-step ${simPhase >= 4 ? 'done' : ''}`}>
                <span>4</span><label>Results</label>
              </div>
            </div>
          </div>
          
          <div className="disaster-info">
            <h3>🌍 {country?.nameEn} - {disasterType.toUpperCase().replace('_', ' ')} SIMULATION</h3>
            <p>{country?.disasterFacts ? Object.values(country.disasterFacts)[0] : 'Testing building resilience...'}</p>
          </div>
        </div>
      </div>
    );
  }

  const country = countries.find(c => c.id === d.countryId);
  const building = buildingTypes.find(b => b.id === d.buildingTypeId);
  const wall = wallMaterials.find(m => m.id === d.wallId);
  const roof = roofMaterials.find(m => m.id === d.roofId);
  const foundation = foundationMaterials.find(m => m.id === d.foundationId);
  const rating = getRating(results.overallScore);
  const orderedFactors = [Factor.HEAT, Factor.COLD_SNOW, Factor.WIND, Factor.QUAKE, Factor.WATER, Factor.SUSTAINABILITY, Factor.COST];

  const handleSave = () => {
    const design = { id: Date.now().toString(), name: `${building?.nameEn} - ${country?.nameEn}`, timestamp: Date.now(), ...d, results };
    dispatch({ type: 'SAVE_DESIGN', payload: design });
    setSaved(true);
  };

  const handleRedesign = () => { dispatch({ type: 'INCREMENT_ATTEMPT' }); navigate('/design'); };
  const handleNew = () => { if (confirm('Start new design?')) { dispatch({ type: 'RESET_DESIGN' }); navigate('/'); }};

  const budgetPct = results.budget > 0 ? (results.totalCost / results.budget * 100).toFixed(0) : '0';

  return (
    <div className="results-page">
      <div className="build-view">
        <h3>🏗️ Your Building</h3>
        <BuildingCanvas wallId={d.wallId} roofId={d.roofId} foundationId={d.foundationId} featureIds={d.featureIds} buildingTypeId={d.buildingTypeId} countryId={d.countryId} size="large" />
        <div className="build-info">
          <span>{wall?.icon} {wall?.nameEn}</span>
          <span>{roof?.icon} {roof?.nameEn}</span>
          <span>{foundation?.icon} {foundation?.nameEn}</span>
        </div>
      </div>

      <div className="score-section">
        <div className="score-card" style={{ borderColor: rating.color }}>
          <div className="score-big" style={{ color: rating.color }}>{results.overallScore}</div>
          <div className="score-label" style={{ color: rating.color }}>{rating.label}</div>
          <div className="score-stars">{'★'.repeat(rating.stars)}{'☆'.repeat(5 - rating.stars)}</div>
        </div>

        <div className="details-list">
          <div className="detail-row"><span>🌍 Country:</span><span>{country?.flagEmoji} {country?.nameEn}</span></div>
          <div className="detail-row"><span>🏢 Building:</span><span>{building?.icon} {building?.nameEn}</span></div>
          <div className="detail-row"><span>💰 Budget:</span><span>{results.totalCost.toLocaleString()} / {results.budget.toLocaleString()} SAR ({budgetPct}%)</span></div>
        </div>

        <h3 className="factor-title">📊 Factor Resilience Scores</h3>
        <div className="factors-list">
          {orderedFactors.map(factor => {
            const score = results.factorScores[factor] ?? 0;
            const r = getRating(score);
            return (
              <div key={factor} className="factor-row">
                <span className="factor-name">{FactorLabels[factor] || factor}</span>
                <div className="factor-bar-box"><div className="factor-bar-fill" style={{ width: `${score}%`, background: r.color }}></div></div>
                <span className="factor-num" style={{ color: r.color }}>{score}</span>
              </div>
            );
          })}
        </div>

        {results.warnings?.length > 0 && (
          <div className="warnings-box">
            <h4>⚠️ Warnings</h4>
            {results.warnings.map((w, i) => <div key={i} className="warn-item">{w.message}</div>)}
          </div>
        )}

        <div className="btn-row">
          <button className="btn-edit" onClick={handleRedesign}>✏️ Edit</button>
          <button className="btn-save" onClick={handleSave} disabled={saved}>{saved ? '✓ Saved' : '💾 Save'}</button>
          <button className="btn-new" onClick={handleNew}>➕ New</button>
        </div>
      </div>
    </div>
  );
}