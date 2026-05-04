import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { countries, getDisasterTypeForCountry } from '../data/countries';
import { buildingTypes } from '../data/buildingTypes';
import { wallMaterials, roofMaterials, foundationMaterials } from '../data/materials';
import { getRating, FactorLabels, Factor } from '../data/constants';
import { calculateResults } from '../data/scoring';
import { badges } from '../data/badges';
import DisasterSimulation from '../components/DisasterSimulation';
import BuildingCanvas from '../components/BuildingCanvas';
import './Results.css';

export default function Results() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const d = state.design;
  const [simPhase, setSimPhase] = useState(0);
  const [saved, setSaved] = useState(false);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [revealStep, setRevealStep] = useState(0);
  const [factorVisible, setFactorVisible] = useState(0);
  const [confetti, setConfetti] = useState([]);
  const mountedRef = useRef(true);
  const rewardsApplied = useRef(false);

  // Compute results immediately so factor scores are available during simulation
  const results = useMemo(() => {
    if (!d.countryId || !d.buildingTypeId || !d.wallId || !d.roofId || !d.foundationId) return null;
    return calculateResults(
      d.countryId, d.buildingTypeId, d.season,
      d.wallId, d.roofId, d.foundationId, d.featureIds
    );
  }, [d.countryId, d.buildingTypeId, d.season, d.wallId, d.roofId, d.foundationId, d.featureIds]);

  const country = countries.find(c => c.id === d.countryId);
  const disasterType = getDisasterTypeForCountry(d.countryId);

  useEffect(() => {
    mountedRef.current = true;

    if (!d.countryId || !d.buildingTypeId || !d.wallId || !d.roofId || !d.foundationId) {
      navigate('/design', { replace: true });
      return;
    }

    const t1 = setTimeout(() => { if (mountedRef.current) setSimPhase(1); }, 500);
    const tp1 = setInterval(() => { if (mountedRef.current) setPhaseProgress(p => Math.min(p + 2, 100)); }, 30);
    const t2 = setTimeout(() => { if (mountedRef.current) { setSimPhase(2); clearInterval(tp1); setPhaseProgress(0); } }, 2500);
    const tp2 = setInterval(() => { if (mountedRef.current) setPhaseProgress(p => Math.min(p + 2, 100)); }, 30);
    const t3 = setTimeout(() => { if (mountedRef.current) { setSimPhase(3); clearInterval(tp2); setPhaseProgress(0); } }, 5000);
    const tp3 = setInterval(() => { if (mountedRef.current) setPhaseProgress(p => Math.min(p + 3, 100)); }, 25);
    const t4 = setTimeout(() => { if (mountedRef.current) { setSimPhase(4); clearInterval(tp3); } }, 7000);

    return () => {
      mountedRef.current = false;
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
      clearInterval(tp1); clearInterval(tp2); clearInterval(tp3);
    };
  }, [d.countryId, d.buildingTypeId, d.wallId, d.roofId, d.foundationId, navigate]);

  // Staggered reveal after simulation ends
  useEffect(() => {
    if (simPhase < 4 || !results) return;

    const end = results.overallScore;
    const dur = 1500;
    const st = Date.now();
    const animate = () => {
      const elapsed = Date.now() - st;
      const progress = Math.min(elapsed / dur, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(end * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

    const s1 = setTimeout(() => setRevealStep(1), 400);
    const s2 = setTimeout(() => setRevealStep(2), 1000);
    const s3 = setTimeout(() => setRevealStep(3), 1600);

    const factorDelay = 1800;
    const factors = [Factor.HEAT, Factor.COLD_SNOW, Factor.WIND, Factor.QUAKE, Factor.WATER, Factor.SUSTAINABILITY, Factor.COST];
    const factorTimers = factors.map((_, i) =>
      setTimeout(() => setFactorVisible(i + 1), factorDelay + i * 250)
    );

    if (results.overallScore >= 70) {
      const count = results.overallScore >= 90 ? 60 : results.overallScore >= 80 ? 40 : 25;
      const pieces = Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 2,
        color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FF69B4', '#FFEAA7', '#DDA0DD'][i % 8],
        size: 6 + Math.random() * 8,
        rotation: Math.random() * 360,
      }));
      setTimeout(() => setConfetti(pieces), 300);
    }

    return () => {
      clearTimeout(s1); clearTimeout(s2); clearTimeout(s3);
      factorTimers.forEach(t => clearTimeout(t));
    };
  }, [simPhase, results]);

  // Rewards
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
    for (const c of countries) {
      if (c.unlockRequirement && !newUnlocked.includes(c.id)) {
        const req = c.unlockRequirement;
        const reqScore = state.profile.bestScores?.[req.country] || 0;
        if (reqScore >= (req.minScore || 40)) {
          newUnlocked.push(c.id);
        }
      }
    }
    dispatch({ type: 'SET_PROFILE', payload: { unlockedCountries: newUnlocked } });
  }, [simPhase, results, dispatch, d, state.profile]);

  // ─── SIMULATION PHASE ───
  if (!results || simPhase < 4) {
    return (
      <DisasterSimulation
        countryId={d.countryId}
        wallId={d.wallId}
        roofId={d.roofId}
        foundationId={d.foundationId}
        featureIds={d.featureIds}
        buildingTypeId={d.buildingTypeId}
        disasterType={disasterType}
        factorScores={results?.factorScores}
        overallScore={results?.overallScore ?? 50}
        simPhase={simPhase}
        phaseProgress={phaseProgress}
        country={country}
      />
    );
  }

  // ─── RESULTS PHASE ───
  const building = buildingTypes.find(b => b.id === d.buildingTypeId);
  const wall = wallMaterials.find(m => m.id === d.wallId);
  const roof = roofMaterials.find(m => m.id === d.roofId);
  const foundation = foundationMaterials.find(m => m.id === d.foundationId);
  const rating = getRating(results.overallScore);
  const orderedFactors = [Factor.HEAT, Factor.COLD_SNOW, Factor.WIND, Factor.QUAKE, Factor.WATER, Factor.SUSTAINABILITY, Factor.COST];
  const survived = results.overallScore >= 70;
  const budgetPct = results.budget > 0 ? (results.totalCost / results.budget * 100).toFixed(0) : '0';

  const handleSave = () => {
    const design = { id: Date.now().toString(), name: `${building?.nameEn} - ${country?.nameEn}`, timestamp: Date.now(), ...d, results };
    dispatch({ type: 'SAVE_DESIGN', payload: design });
    setSaved(true);
  };
  const handleRedesign = () => { dispatch({ type: 'INCREMENT_ATTEMPT' }); navigate('/design'); };
  const handleNew = () => { if (confirm('Start new design?')) { dispatch({ type: 'RESET_DESIGN' }); navigate('/'); } };

  return (
    <div className="results-page">
      {/* CONFETTI */}
      {confetti.length > 0 && <div className="confetti-container">
        {confetti.map(p => (
          <div key={p.id} className="confetti-piece" style={{
            left: `${p.x}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size}px`,
            transform: `rotate(${p.rotation}deg)`,
          }} />
        ))}
      </div>}

      {/* BUILDING VIEW */}
      <div className={`build-view ${revealStep >= 1 ? 'reveal-in' : ''}`}>
        <h3>🏗️ Your Building</h3>
        <BuildingCanvas wallId={d.wallId} roofId={d.roofId} foundationId={d.foundationId} featureIds={d.featureIds} buildingTypeId={d.buildingTypeId} countryId={d.countryId} size="large" />
        <div className="build-info">
          <span>{wall?.icon} {wall?.nameEn}</span>
          <span>{roof?.icon} {roof?.nameEn}</span>
          <span>{foundation?.icon} {foundation?.nameEn}</span>
        </div>
      </div>

      {/* SCORE SECTION */}
      <div className={`score-section ${revealStep >= 2 ? 'reveal-in' : ''}`}>
        {/* VERDICT BANNER */}
        <div className={`verdict-banner ${survived ? 'verdict-survived' : 'verdict-failed'}`}>
          <div className="verdict-icon">{survived ? '🏠✨' : '🏚️💥'}</div>
          <div className="verdict-text">{survived ? 'BUILDING SURVIVED!' : 'BUILDING COLLAPSED!'}</div>
          <div className="verdict-sub">{survived ? 'Your design withstood the disaster!' : 'Your design could not survive the disaster.'}</div>
        </div>

        {/* SCORE CARD */}
        <div className="score-card" style={{ borderColor: rating.color }}>
          <div className="score-emoji">{rating.icon}</div>
          <div className="score-big" style={{ color: rating.color }}>{displayScore}</div>
          <div className="score-label" style={{ color: rating.color }}>{rating.label}</div>
          <div className="score-stars">{'★'.repeat(rating.stars)}{'☆'.repeat(5 - rating.stars)}</div>
          {results.overallScore >= 90 && <div className="score-sparkle">✨ Perfect Design! ✨</div>}
          {results.overallScore >= 50 && results.overallScore < 90 && <div className="score-encouragement">Good effort! Try improving weak areas.</div>}
          {results.overallScore < 50 && <div className="score-encouragement score-encourage-low">Don't give up! Every redesign makes you stronger.</div>}
        </div>

        {/* DETAILS */}
        <div className={`details-list ${revealStep >= 2 ? 'reveal-in' : ''}`}>
          <div className="detail-row"><span>🌍 Country:</span><span>{country?.flagEmoji} {country?.nameEn}</span></div>
          <div className="detail-row"><span>🏢 Building:</span><span>{building?.icon} {building?.nameEn}</span></div>
          <div className="detail-row"><span>💰 Budget:</span><span>{results.totalCost.toLocaleString()} / {results.budget.toLocaleString()} SAR ({budgetPct}%)</span></div>
        </div>

        {/* FACTOR BARS */}
        <h3 className="factor-title">📊 Factor Resilience Scores</h3>
        <div className="factors-list">
          {orderedFactors.map((factor, i) => {
            const score = results.factorScores[factor] ?? 0;
            const r = getRating(score);
            return (
              <div key={factor} className="factor-row" style={{ opacity: i < factorVisible ? 1 : 0, transform: i < factorVisible ? 'translateX(0)' : 'translateX(-20px)', transition: 'all 0.4s ease' }}>
                <span className="factor-name">{FactorLabels[factor] || factor}</span>
                <div className="factor-bar-box">
                  <div className="factor-bar-fill" style={{ width: i < factorVisible ? `${score}%` : '0%', background: r.color }}></div>
                </div>
                <span className="factor-num" style={{ color: r.color }}>{i < factorVisible ? score : ''}</span>
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