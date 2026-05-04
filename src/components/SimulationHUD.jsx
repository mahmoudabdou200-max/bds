import { useMemo } from 'react';

export default function SimulationHUD({ simPhase, phaseProgress, disasterType, country, damageIntensity = 0 }) {
  const disasterInfo = useMemo(() => {
    switch (disasterType) {
      case 'earthquake': return { icon: '🌋', label: 'EARTHQUAKE', mag: '7.5', unit: 'MAG', color: '#795548' };
      case 'flood': return { icon: '🌊', label: 'FLOOD', mag: '15m', unit: 'WAVE', color: '#1565C0' };
      case 'heat_wave': return { icon: '🌡️', label: 'HEAT WAVE', mag: '50°C', unit: 'TEMP', color: '#FF6F00' };
      case 'sandstorm': return { icon: '🏜️', label: 'SANDSTORM', mag: '80km/h', unit: 'WIND', color: '#D4A574' };
      case 'blizzard': return { icon: '❄️', label: 'BLIZZARD', mag: '-40°C', unit: 'TEMP', color: '#90CAF9' };
      case 'typhoon': return { icon: '🌀', label: 'TYPHOON', mag: '250km/h', unit: 'WIND', color: '#607D8B' };
      case 'bushfire': return { icon: '🔥', label: 'BUSHFIRE', mag: '1200°C', unit: 'HEAT', color: '#FF5722' };
      case 'tsunami': return { icon: '🌊', label: 'TSUNAMI', mag: '15m', unit: 'WAVE', color: '#0D47A1' };
      default: return { icon: '⚠️', label: 'DISASTER', mag: '???', unit: '???', color: '#546E7A' };
    }
  }, [disasterType]);

  const getMessage = () => {
    if (simPhase === 0) return { text: 'INITIALIZING...', icon: '🎬' };
    if (simPhase === 1) return { text: `${disasterInfo.icon} ${disasterInfo.label} STRIKES!`, icon: '💥' };
    if (simPhase === 2) return { text: 'ANALYZING STRUCTURAL INTEGRITY...', icon: '🔍' };
    if (simPhase === 3) return { text: 'CALCULATING RESILIENCE SCORES...', icon: '📊' };
    return { text: 'SIMULATION COMPLETE', icon: '✅' };
  };

  const msg = getMessage();

  const intensityPercent = Math.round(damageIntensity * 100);

  return (
    <div className="disaster-simulation" style={{
      background: `linear-gradient(180deg, ${disasterInfo.color}CC, ${disasterInfo.color}FF)`,
      backdropFilter: 'blur(10px)',
    }}>
      {/* Top HUD Bar */}
      <div className="hud-top-bar">
        <div className="hud-left">
          <span className="hud-icon">{disasterInfo.icon}</span>
          <span className="hud-disaster-name">{disasterInfo.label}</span>
          <span className="hud-magnitude">{disasterInfo.mag}</span>
        </div>
        <div className="hud-right">
          <span className="hud-location">📍 {country?.nameEn?.toUpperCase()}</span>
          <span className="hud-rec">⏺ REC</span>
        </div>
      </div>

      {/* Main Message */}
      <div className="disaster-message">
        <span className="msg-icon">{msg.icon}</span>
        <span className="msg-text">{msg.text}</span>
      </div>

      {/* Progress Steps */}
      <div className="disaster-progress">
        <div className={`prog-step ${simPhase >= 1 ? 'done' : ''}`}>
          <span>1</span>
          <label>Disaster</label>
        </div>
        <div className="prog-line">
          <div className="prog-line-fill" style={{ width: simPhase >= 2 ? '100%' : `${phaseProgress}%` }}></div>
        </div>
        <div className={`prog-step ${simPhase >= 2 ? 'done' : ''}`}>
          <span>2</span>
          <label>Damage</label>
        </div>
        <div className="prog-line">
          <div className="prog-line-fill" style={{ width: simPhase >= 3 ? '100%' : `${phaseProgress}%` }}></div>
        </div>
        <div className={`prog-step ${simPhase >= 3 ? 'done' : ''}`}>
          <span>3</span>
          <label>Calculate</label>
        </div>
        <div className="prog-line">
          <div className="prog-line-fill" style={{ width: simPhase >= 4 ? '100%' : `${phaseProgress}%` }}></div>
        </div>
        <div className={`prog-step ${simPhase >= 4 ? 'done' : ''}`}>
          <span>4</span>
          <label>Results</label>
        </div>
      </div>

      {/* Intensity Bar */}
      {simPhase >= 1 && simPhase < 4 && (
        <div className="disaster-intensity-bar">
          <div className="intensity-label">⚠️ INTENSITY</div>
          <div className="intensity-track">
            <div
              className="intensity-fill"
              style={{
                width: `${intensityPercent}%`,
                background: `linear-gradient(90deg, #4CAF50, #FFC107, #FF5722)`,
                boxShadow: `0 0 ${intensityPercent / 10}px rgba(255,87,34,0.5)`,
              }}
            ></div>
          </div>
          <div className="intensity-value">{intensityPercent}%</div>
        </div>
      )}

      {/* Info Box */}
      <div className="disaster-info">
        <h3>🌍 {country?.nameEn} - {disasterInfo.label}</h3>
        <p>{country?.disasterFacts ? Object.values(country.disasterFacts)[0] : 'Testing building resilience against extreme conditions...'}</p>
      </div>

      {/* Bottom HUD Bar */}
      <div className="hud-bottom-bar">
        <span className="hud-fps">60 FPS</span>
        <span className="hud-quality">4K</span>
        <span className="hud-timestamp">{new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
