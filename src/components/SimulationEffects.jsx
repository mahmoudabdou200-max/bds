import { useState, useEffect } from 'react';
import { getRating } from '../data/constants';
import BuildingCanvas from './BuildingCanvas';
import './SimulationEffects.css';

export default function SimulationEffects({
  countryId,
  buildingTypeId,
  wallId,
  roofId,
  foundationId,
  featureIds,
  factorScores,
  overallScore,
  isAnimating = false,
}) {
  const [phase, setPhase] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (!isAnimating) return;
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 1500);
    const t3 = setTimeout(() => setPhase(3), 2500);
    const t4 = setTimeout(() => setPhase(4), 3500);
    const t5 = setTimeout(() => setShowResult(true), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, [isAnimating]);

  const heatScore = factorScores?.heat ?? 50;
  const coldScore = factorScores?.coldSnow ?? 50;
  const windScore = factorScores?.wind ?? 50;
  const quakeScore = factorScores?.quake ?? 50;
  const waterScore = factorScores?.water ?? 50;
  const sustainScore = factorScores?.sustainability ?? 50;

  const getDamageLevel = (score) => {
    if (score >= 70) return 'safe';
    if (score >= 50) return 'minor';
    if (score >= 30) return 'moderate';
    return 'severe';
  };

  return (
    <div className={`sim-effects-wrapper ${isAnimating ? 'animating' : ''} phase-${phase}`}>
      {/* ENVIRONMENTAL DISASTER EFFECTS */}
      {/* EARTHQUAKE */}
      {(countryId === 'japan') && (
        <div className={`disaster-overlay earthquake-overlay ${phase >= 1 ? 'active' : ''}`}>
          <div className="quake-shake">
            {/* Seismic waves from ground */}
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="seismic-wave" style={{ animationDelay: `${i * 0.3}s`, bottom: `${10 + i * 8}%` }} />
            ))}
            {/* Ground crack lines */}
            <svg className="ground-cracks" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,10 L15,8 L30,12 L45,5 L55,15 L70,7 L85,11 L100,9" fill="none" stroke="#795548" strokeWidth="0.5" />
              <path d="M5,15 L20,14 L35,16 L50,12 L65,17 L80,14 L95,15" fill="none" stroke="#5D4037" strokeWidth="0.3" opacity="0.6" />
            </svg>
            {/* Falling debris */}
            {phase >= 2 && Array.from({ length: 12 }).map((_, i) => (
              <div key={`debris${i}`} className="falling-debris" style={{
                left: `${10 + (i * 7) % 80}%`,
                animationDelay: `${(i * 0.15) % 2}s`,
                width: `${4 + (i % 3) * 3}px`,
                height: `${4 + (i % 2) * 4}px`,
              }} />
            ))}
          </div>
          {/* Damage indicator */}
          {phase >= 3 && quakeScore < 50 && (
            <div className={`damage-flash ${getDamageLevel(quakeScore)}`}>
              {quakeScore < 30 && <div className="crack-overlay" />}
            </div>
          )}
        </div>
      )}

      {/* FLOOD */}
      {(countryId === 'netherlands' || countryId === 'brazil') && (
        <div className={`disaster-overlay flood-overlay ${phase >= 1 ? 'active' : ''}`}>
          {/* Rising water */}
          <div className="flood-water" style={{ height: phase >= 2 ? `${Math.max(15, 50 - waterScore * 0.4)}%` : '0%' }}>
            {/* Waves */}
            <svg className="flood-waves" viewBox="0 0 200 20" preserveAspectRatio="none">
              <path d="M0,10 Q25,5 50,10 Q75,15 100,10 Q125,5 150,10 Q175,15 200,10 L200,20 L0,20 Z" fill="#42A5F5" opacity="0.6">
                <animate attributeName="d" values="M0,10 Q25,5 50,10 Q75,15 100,10 Q125,5 150,10 Q175,15 200,10 L200,20 L0,20 Z;M0,12 Q25,7 50,12 Q75,17 100,12 Q125,7 150,12 Q175,17 200,12 L200,20 L0,20 Z;M0,10 Q25,5 50,10 Q75,15 100,10 Q125,5 150,10 Q175,15 200,10 L200,20 L0,20 Z" dur="3s" repeatCount="indefinite" />
              </path>
              <path d="M0,8 Q30,4 60,8 Q90,12 120,8 Q150,4 180,8 Q200,12 200,8 L200,20 L0,20 Z" fill="#64B5F6" opacity="0.4">
                <animate attributeName="d" values="M0,8 Q30,4 60,8 Q90,12 120,8 Q150,4 180,8 Q200,12 200,8 L200,20 L0,20 Z;M0,10 Q30,6 60,10 Q90,14 120,10 Q150,6 180,10 Q200,14 200,10 L200,20 L0,20 Z;M0,8 Q30,4 60,8 Q90,12 120,8 Q150,4 180,8 Q200,12 200,8 L200,20 L0,20 Z" dur="2.5s" repeatCount="indefinite" />
              </path>
            </svg>
            {/* Splash particles */}
            {phase >= 2 && Array.from({ length: 8 }).map((_, i) => (
              <div key={`splash${i}`} className="water-splash" style={{ left: `${15 + i * 10}%`, animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
          {/* Heavy rain */}
          <div className="heavy-rain">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={`hrain${i}`} className="rain-drop-heavy" style={{ left: `${(i * 2.5) % 100}%`, animationDelay: `${(i * 0.05) % 1}s` }} />
            ))}
          </div>
          {/* Wind lines */}
          {countryId === 'netherlands' && (
            <div className="storm-wind">
              {[0, 1, 2, 3].map(i => (
                <div key={`wind${i}`} className="wind-line" style={{ top: `${20 + i * 20}%`, animationDelay: `${i * 0.4}s` }}>
                  <span className="wind-arrow">⟫⟫</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* HEAT / SANDSTORM */}
      {countryId === 'saudi' && (
        <div className={`disaster-overlay heat-overlay ${phase >= 1 ? 'active' : ''}`}>
          {/* Intense sun */}
          <div className="intense-sun">
            <div className="sun-core" />
            <div className="sun-rays">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="sun-ray" style={{ transform: `rotate(${i * 30}deg)` }} />
              ))}
            </div>
            <div className="sun-pulse" />
          </div>
          {/* Heat shimmer overlay */}
          <div className="heat-shimmer">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`shimmer${i}`} className="heat-wave-line" style={{ bottom: `${5 + i * 12}%`, animationDelay: `${i * 0.3}s` }} />
            ))}
          </div>
          {/* Sandstorm particles */}
          {phase >= 2 && (
            <div className="sandstorm">
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={`sand${i}`} className="sand-particle" style={{
                  top: `${(i * 4) % 80}%`,
                  animationDuration: `${1 + (i % 3) * 0.5}s`,
                  animationDelay: `${(i * 0.08) % 2}s`,
                  width: `${3 + (i % 3) * 2}px`,
                  height: `${3 + (i % 2) * 2}px`,
                }} />
              ))}
            </div>
          )}
          {/* Heat damage to building */}
          {phase >= 3 && heatScore < 50 && (
            <div className={`heat-damage ${getDamageLevel(heatScore)}`}>
              <div className="heat-blur-overlay" />
            </div>
          )}
        </div>
      )}

      {/* SNOW / FREEZE */}
      {countryId === 'canada' && (
        <div className={`disaster-overlay freeze-overlay ${phase >= 1 ? 'active' : ''}`}>
          {/* Heavy snowfall */}
          <div className="heavy-snow">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={`snow${i}`} className="snowflake-heavy" style={{
                left: `${(i * 2.8) % 100}%`,
                animationDuration: `${3 + (i % 4) * 1}s`,
                animationDelay: `${(i * 0.07) % 3}s`,
                width: `${4 + (i % 3) * 3}px`,
                height: `${4 + (i % 3) * 3}px`,
              }}>
                {i % 3 === 0 ? '❄' : i % 3 === 1 ? '•' : '✦'}
              </div>
            ))}
          </div>
          {/* Frost overlay */}
          <div className="frost-overlay" />
          {/* Ice crystals on edges */}
          {phase >= 2 && (
            <div className="ice-crystals">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={`ice${i}`} className="ice-crystal" style={{
                  left: `${10 + i * 12}%`,
                  animationDelay: `${i * 0.2}s`,
                }} />
              ))}
            </div>
          )}
          {/* Frozen ground */}
          <div className="frozen-ground" />
          {/* Cold damage */}
          {phase >= 3 && coldScore < 50 && (
            <div className={`cold-damage ${getDamageLevel(coldScore)}`} />
          )}
        </div>
      )}

      {/* RAIN (Japan, Brazil) */}
      {(countryId === 'japan' || countryId === 'brazil') && countryId !== 'netherlands' && (
        <div className={`disaster-overlay rain-overlay ${phase >= 1 ? 'active' : ''}`}>
          <div className="moderate-rain">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={`mrain${i}`} className="rain-drop-mod" style={{
                left: `${(i * 3.3) % 100}%`,
                animationDuration: `${0.5 + (i % 5) * 0.15}s`,
                animationDelay: `${(i * 0.04) % 1}s`,
              }} />
            ))}
          </div>
          {/* Puddles */}
          {phase >= 2 && (
            <div className="puddles">
              {[0, 1, 2, 3].map(i => (
                <div key={`puddle${i}`} className="puddle" style={{ left: `${15 + i * 22}%` }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* BUILDING DAMAGE OVERLAY */}
      <div className="building-damage-layer">
        {/* Cracks from earthquake */}
        {quakeScore < 50 && phase >= 2 && (
          <div className="crack-container" style={{ animationDuration: quakeScore < 30 ? '0.08s' : '0.15s' }}>
            <svg className="wall-cracks" viewBox="0 0 200 300" preserveAspectRatio="xMidYMid meet">
              {/* Major crack from bottom */}
              <path d="M100,300 L95,260 L105,240 L90,200 L100,180 L85,150 L95,120" stroke={quakeScore < 30 ? '#D32F2F' : '#FF8A65'} strokeWidth={quakeScore < 30 ? '3' : '2'} fill="none" opacity={quakeScore < 30 ? '0.8' : '0.5'}>
                {phase >= 3 && <animate attributeName="strokeWidth" values="2;4;2" dur="0.3s" repeatCount="indefinite" />}
              </path>
              {/* Branch cracks */}
              <path d="M95,260 L75,250 L65,240" stroke={quakeScore < 30 ? '#D32F2F' : '#FF8A65'} strokeWidth="1.5" fill="none" opacity="0.6" />
              <path d="M100,180 L120,170 L135,165" stroke={quakeScore < 30 ? '#D32F2F' : '#FF8A65'} strokeWidth="1.5" fill="none" opacity="0.5" />
              <path d="M85,150 L70,140 L60,130" stroke={quakeScore < 30 ? '#D32F2F' : '#FF8A65'} strokeWidth="1" fill="none" opacity="0.4" />
              {/* Window cracks */}
              <path d="M60,100 L65,105 L58,115" stroke={quakeScore < 30 ? '#D32F2F' : '#FF8A65'} strokeWidth="1.5" fill="none" opacity="0.7" />
              <path d="M140,95 L135,100 L142,110" stroke={quakeScore < 30 ? '#D32F2F' : '#FF8A65'} strokeWidth="1.5" fill="none" opacity="0.7" />
            </svg>
          </div>
        )}

        {/* Water damage from flood */}
        {waterScore < 50 && phase >= 2 && (
          <div className="water-damage-container">
            <svg className="water-damage-svg" viewBox="0 0 200 300" preserveAspectRatio="xMidYMid meet">
              {/* Water line on wall */}
              <rect x="0" y={200 + (waterScore / 50) * 60} width="200" height={100 - (waterScore / 50) * 60} fill="#42A5F5" opacity="0.3">
                <animate attributeName="y" values={`${200 + (waterScore / 50) * 60};${195 + (waterScore / 50) * 60};${200 + (waterScore / 50) * 60}`} dur="3s" repeatCount="indefinite" />
              </rect>
              {/* Water stain line */}
              <line x1="0" y1={200 + (waterScore / 50) * 60} x2="200" y2={200 + (waterScore / 50) * 60} stroke="#1565C0" strokeWidth="2" opacity="0.5" />
              {/* Dripping marks */}
              <circle cx="40" cy={200 + (waterScore / 50) * 50} r="3" fill="#42A5F5" opacity="0.4">
                <animate attributeName="cy" values={`${200 + (waterScore / 50) * 50};${210 + (waterScore / 50) * 50};${200 + (waterScore / 50) * 50}`} dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="120" cy={200 + (waterScore / 50) * 55} r="2.5" fill="#42A5F5" opacity="0.4">
                <animate attributeName="cy" values={`${200 + (waterScore / 50) * 55};${212 + (waterScore / 50) * 55};${200 + (waterScore / 50) * 55}`} dur="2.5s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>
        )}

        {/* Heat damage - warped/melting effect */}
        {heatScore < 50 && phase >= 2 && countryId === 'saudi' && (
          <div className="heat-container">
            <svg className="heat-damage-svg" viewBox="0 0 200 300" preserveAspectRatio="xMidYMid meet">
              {/* Heat distortion lines */}
              {[0, 1, 2, 3, 4].map(i => (
                <path key={`hline${i}`} d={`M0,${80 + i * 40} Q50,${75 + i * 40} 100,${80 + i * 40} Q150,${85 + i * 40} 200,${80 + i * 40}`} stroke="#FF9800" strokeWidth="1" fill="none" opacity="0.3">
                  <animate attributeName="d" values={`M0,${80 + i * 40} Q50,${75 + i * 40} 100,${80 + i * 40} Q150,${85 + i * 40} 200,${80 + i * 40};M0,${82 + i * 40} Q50,${77 + i * 40} 100,${82 + i * 40} Q150,${87 + i * 40} 200,${82 + i * 40};M0,${80 + i * 40} Q50,${75 + i * 40} 100,${80 + i * 40} Q150,${85 + i * 40} 200,${80 + i * 40}`} dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                </path>
              ))}
              {/* Sun beating indicator */}
              <circle cx="170" cy="30" r="20" fill="#FF6F00" opacity="0.6">
                <animate attributeName="r" values="18;25;18" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>
        )}

        {/* Ice/frost on building */}
        {coldScore < 50 && phase >= 2 && countryId === 'canada' && (
          <div className="ice-container">
            <svg className="ice-damage-svg" viewBox="0 0 200 300" preserveAspectRatio="xMidYMid meet">
              {/* Frost on walls */}
              <rect x="0" y="0" width="200" height="300" fill="url(#frostGrad)" opacity={coldScore < 30 ? '0.25' : '0.12'} />
              <defs>
                <linearGradient id="frostGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="white" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="#E3F2FD" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="white" stopOpacity="0.5" />
                </linearGradient>
              </defs>
              {/* Frost patterns on edges */}
              <path d="M0,0 L0,30 Q5,20 10,30 Q15,15 20,28 Q25,12 30,25 L30,0 Z" fill="white" opacity="0.6" />
              <path d="M170,0 L170,25 Q175,15 180,28 Q185,10 190,22 Q195,8 200,20 L200,0 Z" fill="white" opacity="0.6" />
              {/* Icicles */}
              <path d="M20,0 L18,20 L25,15 L22,25 L15,20 L20,0" fill="#B3E5FC" opacity="0.7" />
              <path d="M80,0 L78,15 L82,12 L80,22 L76,18 L80,0" fill="#B3E5FC" opacity="0.6" />
              <path d="M140,0 L138,18 L142,14 L140,28 L136,20 L140,0" fill="#B3E5FC" opacity="0.7" />
              <path d="M180,0 L178,12 L182,10 L180,20 L176,16 L180,0" fill="#B3E5FC" opacity="0.5" />
              {/* Ice on windows */}
              <rect x="40" y="60" width="30" height="40" fill="#E3F2FD" opacity="0.4" rx="2" />
              <rect x="120" y="60" width="30" height="40" fill="#E3F2FD" opacity="0.4" rx="2" />
              <rect x="40" y="140" width="30" height="40" fill="#E3F2FD" opacity="0.3" rx="2" />
              <rect x="120" y="140" width="30" height="40" fill="#E3F2FD" opacity="0.3" rx="2" />
            </svg>
          </div>
        )}

        {/* Wind damage - leaning/bowing */}
        {windScore < 40 && phase >= 2 && (
          <div className="wind-damage-container" style={{ transform: `skewX(${windScore < 30 ? 4 : 2}deg)` }}>
            <svg className="wind-arrows-svg" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet">
              {Array.from({ length: 5 }).map((_, i) => (
                <g key={`war${i}`} opacity={`${0.3 + i * 0.1}`}>
                  <path d={`M${-10 + i * 40},30 L${15 + i * 40},25 M${15 + i * 40},25 L${10 + i * 40},18 M${15 + i * 40},25 L${10 + i * 40},32`} stroke="#78909C" strokeWidth="3" fill="none">
                    <animate attributeName="opacity" values="0.3;0.7;0.3" dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
                  </path>
                  <path d={`M${-10 + i * 40},60 L${15 + i * 40},55 M${15 + i * 40},55 L${10 + i * 40},48 M${15 + i * 40},55 L${10 + i * 40},62`} stroke="#78909C" strokeWidth="2" fill="none">
                    <animate attributeName="opacity" values="0.2;0.5;0.2" dur={`${1.8 + i * 0.2}s`} repeatCount="indefinite" />
                  </path>
                </g>
              ))}
            </svg>
          </div>
        )}
      </div>

      {/* PEOPLE FIGURES */}
      <div className="people-layer">
        {/* Person reacting to earthquake */}
        {countryId === 'japan' && phase >= 2 && (
          <div className="people-container">
            {/* Person crouching under desk */}
            <svg className="person person-quake" viewBox="0 0 50 60">
              {/* Desk */}
              <rect x="5" y="25" width="40" height="5" fill="#8D6E63" />
              <rect x="8" y="30" width="4" height="25" fill="#6D4C41" />
              <rect x="38" y="30" width="4" height="25" fill="#6D4C41" />
              {/* Person crouching */}
              <circle cx="20" cy="38" r="6" fill="#FFCC80" stroke="#E65100" strokeWidth="1" />
              <path d="M14,44 Q17,52 20,54 Q23,52 26,44" fill="#1976D2" stroke="#0D47A1" strokeWidth="0.5" />
              <circle cx="20" cy="36" r="5" fill="#FFCC80" />
              {/* Fear expression */}
              <circle cx="18" cy="35" r="1" fill="#333" />
              <circle cx="22" cy="35" r="1" fill="#333" />
              <path d="M17,38 Q20,40 23,38" stroke="#333" strokeWidth="0.5" fill="none" />
              {/* Sweat drop */}
              <circle cx="26" cy="33" r="1.5" fill="#42A5F5" opacity="0.7">
                <animate attributeName="cy" values="33;31;33" dur="1s" repeatCount="indefinite" />
              </circle>
            </svg>
            {/* Person running outside */}
            <svg className="person person-running" viewBox="0 0 40 50">
              <circle cx="18" cy="8" r="6" fill="#FFCC80" />
              <path d="M12,14 L18,18 L24,14 L20,28 L18,30" fill="#F44336" />
              <path d="M10,28 L15,35 L18,30 L21,35 L26,28" fill="#1565C0" stroke="#0D47A1" strokeWidth="0.5" />
              <path d="M16,33 L13,42" stroke="#333" strokeWidth="2" />
              <path d="M20,33 L23,41" stroke="#333" strokeWidth="2" />
              {/* Panic expression */}
              <circle cx="16" cy="7" r="1" fill="#333" />
              <circle cx="21" cy="7" r="1" fill="#333" />
              <ellipse cx="19" cy="10" rx="2" ry="1.5" fill="#333" />
              <animateTransform attributeName="transform" type="translate" values="0,0;5,-2;0,0" dur="0.5s" repeatCount="indefinite" />
            </svg>
          </div>
        )}

        {/* Person in flood */}
        {(countryId === 'netherlands' || countryId === 'brazil') && phase >= 2 && (
          <div className="people-container people-flood">
            <svg className="person person-flood" viewBox="0 0 50 70">
              {/* Person standing in water */}
              <circle cx="25" cy="10" r="7" fill="#FFCC80" />
              <path d="M18,17 L25,25 L32,17 L30,35 L20,35 Z" fill="#1976D2" />
              {/* Arms raised */}
              <path d="M18,20 L8,15" stroke="#FFCC80" strokeWidth="3" fill="none" />
              <path d="M32,20 L42,15" stroke="#FFCC80" strokeWidth="3" fill="none" />
              {/* Legs in water */}
              <path d="M22,35 L20,45" stroke="#1565C0" strokeWidth="3" />
              <path d="M28,35 L30,45" stroke="#1565C0" strokeWidth="3" />
              {/* Water line on body */}
              <rect x="15" y="38" width="20" height="20" fill="#42A5F5" opacity="0.4" />
              {/* Worried face */}
              <circle cx="23" cy="8" r="1" fill="#333" />
              <circle cx="27" cy="8" r="1" fill="#333" />
              <path d="M22,11 Q25,13 28,11" stroke="#333" strokeWidth="0.5" fill="none" />
              {/* Wavy hair from water */}
              <path d="M18,6 Q20,3 23,6 Q26,3 29,6 Q32,3 34,7" stroke="#5D4037" strokeWidth="1.5" fill="none" />
              <animateTransform attributeName="transform" type="translate" values="0,0;2,-1;0,0;-2,-1;0,0" dur="2s" repeatCount="indefinite" />
            </svg>
          </div>
        )}

        {/* Person in heat */}
        {countryId === 'saudi' && phase >= 2 && (
          <div className="people-container people-heat">
            <svg className="person person-heat" viewBox="0 0 45 65">
              {/* Person fanning themselves */}
              <circle cx="22" cy="10" r="7" fill="#FFCC80" />
              <path d="M15,17 L22,25 L29,17 L27,38 L17,38 Z" fill="#FFF9C4" />
              {/* Legs */}
              <path d="M19,38 L17,52" stroke="#5D4037" strokeWidth="3" />
              <path d="M25,38 L27,52" stroke="#5D4037" strokeWidth="3" />
              {/* Arm fanning */}
              <path d="M15,20 L5,15 L2,10" stroke="#FFCC80" strokeWidth="3" fill="none" />
              {/* Fan/paper */}
              <rect x="0" y="6" width="10" height="12" rx="2" fill="#FFECB3" stroke="#FFB300" strokeWidth="0.5">
                <animateTransform attributeName="transform" type="rotate" values="-10,2,10;10,2,10;-10,2,10" dur="0.6s" repeatCount="indefinite" />
              </rect>
              {/* Sweat drops */}
              <circle cx="28" cy="8" r="1.5" fill="#42A5F5" opacity="0.7">
                <animate attributeName="cy" values="8;12;8" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="30" cy="6" r="1" fill="#42A5F5" opacity="0.5">
                <animate attributeName="cy" values="6;10;6" dur="1.8s" repeatCount="indefinite" />
              </circle>
              {/* Squinting face */}
              <line x1="19" y1="9" x2="21" y2="9" stroke="#333" strokeWidth="1.5" />
              <line x1="23" y1="9" x2="25" y2="9" stroke="#333" strokeWidth="1.5" />
              <path d="M19,12 Q22,14 25,12" stroke="#333" strokeWidth="0.5" fill="none" />
            </svg>
            {/* Thermometer */}
            <svg className="thermometer" viewBox="0 0 20 80">
              <rect x="6" y="5" width="8" height="55" rx="4" fill="white" stroke="#B0BEC5" strokeWidth="1" />
              <rect x="8" y={50 - heatScore * 0.35} width="4" height={5 + heatScore * 0.35} rx="2" fill="#F44336">
                <animate attributeName="height" values={`${5 + heatScore * 0.3};${5 + heatScore * 0.4};${5 + heatScore * 0.3}`} dur="2s" repeatCount="indefinite" />
              </rect>
              <circle cx="10" cy="67" r="8" fill="#F44336" />
              <text x="10" y="78" textAnchor="middle" fontSize="6" fill="#F44336">🌡️</text>
            </svg>
          </div>
        )}

        {/* Person in snow */}
        {countryId === 'canada' && phase >= 2 && (
          <div className="people-container people-snow">
            <svg className="person person-cold" viewBox="0 0 50 65">
              {/* Person bundled up */}
              <circle cx="25" cy="10" r="7" fill="#FFCC80" />
              {/* Hat */}
              <path d="M17,8 Q25,0 33,8 Q35,4 25,2 Q15,4 17,8" fill="#D32F2F" />
              <rect x="15" y="6" width="20" height="4" rx="2" fill="#D32F2F" />
              {/* Puffer jacket */}
              <path d="M14,17 Q12,22 12,30 L12,40 L38,40 L38,30 Q38,22 36,17 L32,17 L29,17 Q25,22 21,17 L18,17 Z" fill="#1565C0" />
              {/* Arms crossed */}
              <path d="M14,22 L8,28 L22,28" stroke="#1565C0" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M36,22 L42,28 L28,28" stroke="#1565C0" strokeWidth="4" fill="none" strokeLinecap="round" />
              {/* Legs */}
              <path d="M19,40 L17,55" stroke="#37474F" strokeWidth="4" />
              <path d="M31,40 L33,55" stroke="#37474F" strokeWidth="4" />
              {/* Boots */}
              <rect x="13" y="53" width="8" height="5" rx="2" fill="#5D4037" />
              <rect x="29" y="53" width="8" height="5" rx="2" fill="#5D4037" />
              {/* Cold face - teeth chattering */}
              <circle cx="23" cy="9" r="1" fill="#333" />
              <circle cx="27" cy="9" r="1" fill="#333" />
              <path d="M22,13 L23,14 L24,13" stroke="#333" strokeWidth="0.5" fill="none">
                <animate attributeName="d" values="M22,13 L23,14 L24,13;M22,13 L23,12 L24,13;M22,13 L23,14 L24,13" dur="0.3s" repeatCount="indefinite" />
              </path>
              {/* Breath cloud */}
              <ellipse cx="30" cy="14" rx="5" ry="3" fill="white" opacity="0.4">
                <animate attributeName="rx" values="3;6;3" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.5;0.3" dur="2s" repeatCount="indefinite" />
                <animate attributeName="cx" values="30;35;30" dur="3s" repeatCount="indefinite" />
              </ellipse>
              {/* Shivering body */}
              <animateTransform attributeName="transform" type="translate" values="0,0;1,-1;-1,1;0,0" dur="0.3s" repeatCount="indefinite" />
            </svg>
          </div>
        )}
      </div>

      {/* RESULT OVERLAY */}
      {showResult && (
        <div className="result-overlay">
          <div className="result-card" style={{ borderColor: getRating(overallScore).color }}>
            <div className="result-number" style={{ color: getRating(overallScore).color }}>{overallScore}</div>
            <div className="result-label" style={{ color: getRating(overallScore).color }}>{getRating(overallScore).label}</div>
            <div className="result-stars">{'★'.repeat(getRating(overallScore).stars)}{'☆'.repeat(5 - getRating(overallScore).stars)}</div>
          </div>
        </div>
      )}
    </div>
  );
}