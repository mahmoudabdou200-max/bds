import { memo } from 'react';
import './BuildingCanvas.css';

// Extreme CSS cartoon animations - no JS needed!
const wallStyles = {
  wall_concrete: '#B0BEC5',
  wall_brick: '#EF9A9A',
  wall_wood: '#BCAAA4',
  wall_steel: '#90A4AE',
  wall_recycled: '#C8E6C9',
};

const roofStyles = {
  roof_metal: { fill: '#78909C', shape: 'sloped' },
  roof_tiled: { fill: '#FF8A65', shape: 'peaked' },
  roof_flat_concrete: { fill: '#B0BEC5', shape: 'flat' },
  roof_solar: { fill: '#42A5F5', shape: 'sloped' },
};

function BuildingExtremeCSS({ wallId, roofId, buildingTypeId, damageClass, disasterType, simPhase }) {
  const ws = wallStyles[wallId] || wallStyles.wall_concrete;
  const rs = roofStyles[roofId] || roofStyles.roof_metal;
  
  const buildingClass = [
    'css-extreme-building',
    damageClass ? `damage-${damageClass}` : '',
    disasterType ? `disaster-${disasterType}` : '',
    simPhase >= 2 ? 'animate-building' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="css-extreme-wrapper">
      {/* Sky with animated gradient */}
      <div className={`css-sky ${simPhase >= 2 ? 'darken' : ''}`} />

      {/* Ground */}
      <div className="css-ground" />

      {/* Building with EXTREME effects */}
      <div className={buildingClass} style={{
        '--wall-color': ws,
        '--roof-color': rs.fill,
      }}>
        {/* Left Wall */}
        <div className="css-wall css-wall-left" />

        {/* Right Wall */}
        <div className="css-wall css-wall-right" />

        {/* Roof */}
        <div className={`css-roof ${rs.shape}`} />

        {/* Door */}
        <div className="css-door">
          <div className="css-door-handle" />
        </div>

        {/* Windows */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="css-window" style={{
            left: `${30 + (i % 2) * 60}%`,
            top: `${30 + Math.floor(i / 2) * 35}%`,
          }} />
        ))}

        {/* Cracks for severe damage */}
        {damageClass === 'severe' && (
          <>
            <div className="css-crack css-crack-1" />
            <div className="css-crack css-crack-2" />
            <div className="css-crack css-crack-3" />
          </>
        )}
      </div>

      {/* Impact Stars */}
      {damageClass === 'severe' && simPhase === 2 && (
        <>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="css-impact-star" style={{
              animationDelay: `${i * 0.15}s`,
              '--star-angle': `${i * 60}deg`,
            }} />
          ))}
        </>
      )}

      {/* Debris */}
      {damageClass === 'severe' && (
        <>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="css-debris" style={{
              animationDelay: `${i * 0.2}s`,
              left: `${20 + i * 10}%`,
            }} />
          ))}
        </>
      )}
    </div>
  );
}

export default memo(BuildingExtremeCSS);
