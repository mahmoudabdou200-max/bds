import { memo } from 'react';
import './BuildingCanvas.css';

// Ultimate CSS-only cartoon animation - no JS libraries!
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

function BuildingCSSUltra({ wallId, roofId, buildingTypeId, damageClass, disasterType, simPhase }) {
  const ws = wallStyles[wallId] || wallStyles.wall_concrete;
  const rs = roofStyles[roofId] || roofStyles.roof_metal;
  const bs = {
    house: { width: 300, height: 240, roofH: 70, doorW: 38, doorH: 70 },
    school: { width: 380, height: 320, roofH: 40, doorW: 50, doorH: 75 },
    hospital: { width: 400, height: 360, roofH: 30, doorW: 55, doorH: 80 },
    emergency_shelter: { width: 280, height: 180, roofH: 50, doorW: 35, doorH: 60 },
    farm_house: { width: 320, height: 220, roofH: 80, doorW: 36, doorH: 68 },
    office_building: { width: 350, height: 400, roofH: 25, doorW: 55, doorH: 80 },
  }[buildingTypeId] || {
    width: 300, height: 240, roofH: 70, doorW: 38, doorH: 70
  };

  const buildingClass = [
    'building-css-ultra',
    damageClass ? `damage-${damageClass}` : '',
    disasterType ? `disaster-${disasterType}` : '',
    simPhase >= 2 ? 'animate' : '',
  ].filter(Boolean).join(' ');

  const roofPath = rs.shape === 'sloped'
    ? `polygon(0% 100%, 50% 0%, 100% 100%)`
    : rs.shape === 'peaked'
    ? `polygon(0% 100%, 25% 20%, 50% 0%, 75% 20%, 100% 100%)`
    : 'none';

  return (
    <div className="css-ultra-wrapper">
      {/* Sky */}
      <div className="css-sky" />

      {/* Ground */}
      <div className="css-ground" />

      {/* Building Container */}
      <div className={buildingClass} style={{
        '--wall-color': ws,
        '--roof-color': rs.fill,
        '--building-width': `${bs.width}px`,
        '--building-height': `${bs.height}px`,
        '--roof-height': `${bs.roofH}px`,
        '--door-width': `${bs.doorW}px`,
        '--door-height': `${bs.doorH}px`,
      }}>
        {/* Walls */}
        <div className="css-wall css-wall-left" />
        <div className="css-wall css-wall-right" />

        {/* Roof */}
        <div className="css-roof" style={{ clipPath: roofPath }} />

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

        {/* Cracks (severe damage) */}
        {damageClass === 'severe' && (
          <>
            <div className="css-crack css-crack-1" />
            <div className="css-crack css-crack-2" />
            <div className="css-crack css-crack-3" />
          </>
        )}

        {/* Debris (severe) */}
        {damageClass === 'severe' && [...Array(6)].map((_, i) => (
          <div key={i} className="css-debris" style={{
            '--debris-delay': `${i * 0.2}s`,
            left: `${20 + i * 12}%`,
          }} />
        ))}
      </div>

      {/* Impact stars */}
      {damageClass === 'severe' && simPhase === 2 && [...Array(4)].map((_, i) => (
        <div key={i} className="css-impact-star" style={{
          '--star-delay': `${i * 0.15}s`,
          '--star-angle': `${i * 90}deg`,
        }} />
      ))}
    </div>
  );
}

export default memo(BuildingCSSUltra);
