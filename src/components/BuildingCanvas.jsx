import { memo } from 'react';
import './BuildingCanvas.css';

export const SVGW = 500, SVGH = 600, GROUND = 480;
export const WL_CONST = 100, WR_CONST = 400;
export const WW_CONST = WR_CONST - WL_CONST;
export const MX_CONST = (WL_CONST + WR_CONST) / 2;

const wallStyles = {
  wall_concrete: { fill1: '#B0BEC5', fill2: '#90A4AE', line: '#78909C', pattern: 'blocks', label: 'Concrete' },
  wall_brick: { fill1: '#EF9A9A', fill2: '#E57373', line: '#C62828', pattern: 'bricks', label: 'Brick' },
  wall_wood: { fill1: '#BCAAA4', fill2: '#A1887F', line: '#6D4C41', pattern: 'planks', label: 'Wood' },
  wall_steel: { fill1: '#B0BEC5', fill2: '#78909C', line: '#455A64', pattern: 'steelpanels', label: 'Steel' },
  wall_recycled: { fill1: '#C8E6C9', fill2: '#A5D6A7', line: '#66BB6A', pattern: 'grid', label: 'Recycled' },
};

const roofStyles = {
  roof_metal: { fill: '#78909C', line: '#546E7A', shape: 'sloped', label: 'Metal' },
  roof_tiled: { fill: '#FF8A65', line: '#E64A19', shape: 'peaked', label: 'Tiled' },
  roof_flat_concrete: { fill: '#B0BEC5', line: '#78909C', shape: 'flat', label: 'Flat' },
  roof_solar: { fill: '#42A5F5', line: '#1565C0', shape: 'sloped', label: 'Solar', glow: true },
};

const foundStyles = {
  found_deep_concrete: { fill: '#78909C', line: '#455A64', type: 'deep', label: 'Deep' },
  found_elevated: { fill: '#A1887F', line: '#5D4037', type: 'elevated', label: 'Elevated' },
  found_standard: { fill: '#B0BEC5', line: '#78909C', type: 'standard', label: 'Standard' },
};

const buildingShapes = {
  house: { floors: 1, wallH: 240, roofExtra: 70, doorW: 38, doorH: 70, winRows: 2, winCols: 2 },
  school: { floors: 2, wallH: 320, roofExtra: 40, doorW: 50, doorH: 75, winRows: 3, winCols: 4 },
  hospital: { floors: 3, wallH: 360, roofExtra: 30, doorW: 55, doorH: 80, winRows: 4, winCols: 4, cross: true },
  emergency_shelter: { floors: 1, wallH: 180, roofExtra: 50, doorW: 35, doorH: 60, winRows: 1, winCols: 2 },
  farm_house: { floors: 1, wallH: 220, roofExtra: 80, doorW: 36, doorH: 68, winRows: 2, winCols: 2, barn: true },
  office_building: { floors: 4, wallH: 400, roofExtra: 25, doorW: 55, doorH: 80, winRows: 5, winCols: 5 },
};

const BuildingCanvasInner = memo(function BuildingCanvas({ wallId, roofId, foundationId, featureIds, countryId, buildingTypeId, size = 'large', damageClass }) {
  const ws = wallStyles[wallId] || wallStyles.wall_concrete;
  const rs = roofStyles[roofId] || roofStyles.roof_metal;
  const fs = foundStyles[foundationId] || foundStyles.found_standard;
  const bs = buildingShapes[buildingTypeId] || buildingShapes.house;

  const s = size === 'large' ? 1 : size === 'medium' ? 0.75 : 0.55;

  const hasSmallWin = featureIds?.includes('feat_small_windows');
  const hasLargeWin = featureIds?.includes('feat_large_windows');
  const hasMixedWin = hasSmallWin && hasLargeWin;
  const hasInsulation = featureIds?.includes('feat_thermal_insulation');
  const hasShading = featureIds?.includes('feat_shading');
  const hasSolar = featureIds?.includes('feat_solar_panels');
  const hasRainTank = featureIds?.includes('feat_rainwater');
  const hasVent = featureIds?.includes('feat_cross_ventilation');
  const hasStruts = featureIds?.includes('feat_reinforcement');

  const WT = bs.wallH * s;
  const W = SVGW * s;
  const H = SVGH * s;
  const G = GROUND * s;
  const WL = 100 * s;
  const WR = 400 * s;
  const WW = WR - WL;
  const MX = (WL + WR) / 2;
  const WT_TOP = G - WT;
  const FND_H = fs.type === 'deep' ? 50 * s : fs.type === 'elevated' ? 35 * s : 22 * s;
  const ROOF_H = bs.roofExtra * s;

  const getWindowSize = (row, col) => {
    if (hasMixedWin) {
      const isLarge = (row + col) % 2 === 0;
      return isLarge
        ? { w: 50 * s, h: 56 * s }
        : { w: 22 * s, h: 26 * s };
    }
    if (hasSmallWin) return { w: 22 * s, h: 26 * s };
    if (hasLargeWin) return { w: 50 * s, h: 56 * s };
    return { w: 34 * s, h: 40 * s };
  };

  return (
    <div className={`building-canvas building-canvas-${size}${damageClass ? ` shake-${damageClass}` : ''}`}>
      <svg viewBox={`0 0 ${W} ${H + 60 * s}`} className="building-svg" style={{ width: '100%', maxWidth: W }}>
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#64B5F6" />
            <stop offset="60%" stopColor="#BBDEFB" />
            <stop offset="100%" stopColor="#E1F5FE" />
          </linearGradient>
          <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#66BB6A" />
            <stop offset="100%" stopColor="#388E3C" />
          </linearGradient>
          <linearGradient id="roadGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#616161" />
            <stop offset="100%" stopColor="#424242" />
          </linearGradient>
          {countryId === 'saudi' && (
            <linearGradient id="desertGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#DEB887" />
              <stop offset="100%" stopColor="#C4A35A" />
            </linearGradient>
          )}
          {/* Wall Patterns */}
          <pattern id="pBrick" width="24" height="12" patternUnits="userSpaceOnUse" patternTransform={`scale(${s})`}>
            <rect width="24" height="12" fill={ws.fill1} />
            <rect x="0.5" y="0.5" width="10.5" height="5" rx="0.5" fill={ws.fill2} stroke={ws.line} strokeWidth="0.4" />
            <rect x="12.5" y="5.5" width="10.5" height="5" rx="0.5" fill={ws.fill2} stroke={ws.line} strokeWidth="0.4" />
          </pattern>
          <pattern id="pBlocks" width="36" height="18" patternUnits="userSpaceOnUse" patternTransform={`scale(${s})`}>
            <rect width="36" height="18" fill={ws.fill1} />
            <line x1="0" y1="9" x2="36" y2="9" stroke={ws.line} strokeWidth="0.8" />
            <line x1="18" y1="0" x2="18" y2="9" stroke={ws.line} strokeWidth="0.8" />
            <line x1="9" y1="9" x2="9" y2="18" stroke={ws.line} strokeWidth="0.6" />
            <line x1="27" y1="9" x2="27" y2="18" stroke={ws.line} strokeWidth="0.6" />
          </pattern>
          <pattern id="pPlanks" width="48" height="10" patternUnits="userSpaceOnUse" patternTransform={`scale(${s})`}>
            <rect width="48" height="10" fill={ws.fill1} />
            <line x1="0" y1="5" x2="48" y2="5" stroke={ws.line} strokeWidth="1.2" />
            <line x1="0" y1="0" x2="48" y2="0" stroke={ws.line} strokeWidth="0.3" />
          </pattern>
          <pattern id="pSteelPanels" width="60" height="70" patternUnits="userSpaceOnUse" patternTransform={`scale(${s})`}>
            <rect width="60" height="70" fill={ws.fill1} />
            <line x1="30" y1="0" x2="30" y2="70" stroke={ws.line} strokeWidth="2" />
            <line x1="0" y1="35" x2="60" y2="35" stroke={ws.line} strokeWidth="0.8" />
            <line x1="15" y1="0" x2="15" y2="70" stroke={ws.line} strokeWidth="0.4" />
            <line x1="45" y1="0" x2="45" y2="70" stroke={ws.line} strokeWidth="0.4" />
          </pattern>
          <pattern id="pGrid" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform={`scale(${s})`}>
            <rect width="18" height="18" fill={ws.fill1} />
            <line x1="0" y1="9" x2="18" y2="9" stroke={ws.line} strokeWidth="0.6" />
            <line x1="9" y1="0" x2="9" y2="18" stroke={ws.line} strokeWidth="0.6" />
            <circle cx="4.5" cy="4.5" r="1.5" fill={ws.line} opacity="0.3" />
            <circle cx="13.5" cy="13.5" r="1.5" fill={ws.line} opacity="0.3" />
          </pattern>
          {/* Roof tile pattern */}
          <pattern id="pTile" width="16" height="12" patternUnits="userSpaceOnUse" patternTransform={`scale(${s})`}>
            <rect width="16" height="12" fill={rs.fill} />
            <path d="M0,6 Q4,2 8,6 Q12,10 16,6" stroke={rs.line} strokeWidth="0.8" fill="none" />
          </pattern>
        </defs>

        {/* ===== SKY ===== */}
        <rect x="0" y="0" width={W} height={H + 60 * s} fill="url(#skyGrad)" />

        {/* ===== SUN ===== */}
        <g className="sun-group">
          <circle cx={W * 0.87} cy={60 * s} r={32 * s} fill="#FFF9C4" opacity="0.3">
            <animate attributeName="r" values={`${32 * s};${40 * s};${32 * s}`} dur="6s" repeatCount="indefinite" />
          </circle>
          <circle cx={W * 0.87} cy={60 * s} r={22 * s} fill="#FFD54F" />
          <circle cx={W * 0.87} cy={60 * s} r={16 * s} fill="#FFC107" />
        </g>

        {/* ===== CLOUDS ===== */}
        <g className="cloud-group">
          <g className="cloud cloud-1" opacity="0.7">
            <ellipse cx={W * 0.25} cy={55 * s} rx={35 * s} ry={16 * s} fill="white" />
            <ellipse cx={W * 0.28} cy={48 * s} rx={25 * s} ry={14 * s} fill="white" />
            <ellipse cx={W * 0.22} cy={50 * s} rx={18 * s} ry={12 * s} fill="white" />
          </g>
          <g className="cloud cloud-2" opacity="0.5">
            <ellipse cx={W * 0.65} cy={80 * s} rx={28 * s} ry={13 * s} fill="white" />
            <ellipse cx={W * 0.67} cy={74 * s} rx={20 * s} ry={10 * s} fill="white" />
          </g>
        </g>

        {/* ===== COUNTRY-SPECIFIC BACKGROUND EFFECTS ===== */}
        {countryId === 'saudi' && (
          <g className="desert-bg">
            <rect x="0" y={G} width={W} height={H - G + 60 * s} fill="url(#desertGrad)" />
            {/* Sand dunes */}
            <path d={`M0,${G + 20 * s} Q${W * 0.2},${G - 15 * s} ${W * 0.4},${G + 10 * s} Q${W * 0.6},${G - 30 * s} ${W * 0.8},${G + 5 * s} Q${W * 0.9},${G - 10 * s} ${W},${G + 15 * s} L${W},${H + 60 * s} L0,${H + 60 * s} Z`} fill="#D4A574" opacity="0.6" />
            {/* Heat shimmer lines */}
            {Array.from({ length: 6 }).map((_, i) => (
              <path key={`heat${i}`} d={`M${20 * s + i * 70 * s},${G - 5 * s} Q${40 * s + i * 70 * s},${G - 20 * s} ${60 * s + i * 70 * s},${G - 5 * s}`} fill="none" stroke="#FFAB00" strokeWidth={1.5 * s} opacity="0.3">
                <animate attributeName="opacity" values="0.1;0.4;0.1" dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" />
                <animate attributeName="d" values={`M${20 * s + i * 70 * s},${G - 5 * s} Q${40 * s + i * 70 * s},${G - 20 * s} ${60 * s + i * 70 * s},${G - 5 * s};M${20 * s + i * 70 * s},${G - 8 * s} Q${40 * s + i * 70 * s},${G - 28 * s} ${60 * s + i * 70 * s},${G - 8 * s};M${20 * s + i * 70 * s},${G - 5 * s} Q${40 * s + i * 70 * s},${G - 20 * s} ${60 * s + i * 70 * s},${G - 5 * s}`} dur={`${3 + i * 0.4}s`} repeatCount="indefinite" />
              </path>
            ))}
          </g>
        )}

        {countryId === 'canada' && (
          <g className="snow-bg">
            {/* Snow on ground */}
            <ellipse cx={W / 2} cy={G + 5 * s} rx={W / 2 + 20 * s} ry={18 * s} fill="white" opacity="0.7" />
            {/* Snow mounds */}
            <ellipse cx={W * 0.2} cy={G + 8 * s} rx={50 * s} ry={10 * s} fill="white" opacity="0.5" />
            <ellipse cx={W * 0.75} cy={G + 6 * s} rx={45 * s} ry={8 * s} fill="white" opacity="0.5" />
            {/* Snowflakes */}
            {Array.from({ length: 20 }).map((_, i) => {
              const snowCx = ((i * 29 + 7) * s) % W;
              const snowR = (1.5 + (i % 3)) * s;
              return (
                <circle key={`snow${i}`} cx={snowCx} cy={0} r={snowR} fill="white" opacity={0.6 + (i % 3) * 0.1}>
                  <animate attributeName="cy" from={`${-20 * s}`} to={`${H + 60 * s}`} dur={`${3 + i * 0.2}s`} begin={`${i * 0.15}s`} repeatCount="indefinite" />
                </circle>
              );
            })}
          </g>
        )}

        {(countryId === 'japan' || countryId === 'netherlands' || countryId === 'brazil') && (
          <g className="rain-bg">
            {/* Rain drops */}
            {Array.from({ length: 30 }).map((_, i) => (
              <line key={`rain${i}`} x1={(i * 18 + 5) * s % W} y1={0} x2={(i * 18 + 2) * s % W} y2={18 * s} stroke={countryId === 'brazil' ? '#4FC3F7' : '#64B5F6'} strokeWidth={1.2 * s} opacity={0.2 + (i % 4) * 0.1}>
                <animate attributeName="y1" values={`${-30 * s};${H + 60 * s};${-30 * s}`} dur={`${0.4 + (i % 5) * 0.15}s`} begin={`${i * 0.05}s`} repeatCount="indefinite" />
                <animate attributeName="y2" values={0} dur={`${0.4 + (i % 5) * 0.15}s`} begin={`${i * 0.05}s`} repeatCount="indefinite" additive="sum" />
              </line>
            ))}
          </g>
        )}

        {countryId === 'netherlands' && (
          <g className="flood-bg">
            {/* Flood water */}
            <rect x="0" y={G + 5 * s} width={W} height={55 * s} fill="#64B5F6" opacity="0.25">
              <animate attributeName="height" values={`${45 * s};${60 * s};${45 * s}`} dur="8s" repeatCount="indefinite" />
            </rect>
            {/* Waves */}
            <path d={`M0,${G + 10 * s} Q${W * 0.15},${G + 2 * s} ${W * 0.3},${G + 10 * s} Q${W * 0.45},${G + 18 * s} ${W * 0.6},${G + 10 * s} Q${W * 0.75},${G + 2 * s} ${W * 0.9},${G + 10 * s} Q${W},${G + 18 * s} ${W + 20 * s},${G + 10 * s}`} fill="#42A5F5" opacity="0.3">
              <animate attributeName="d" values={`M0,${G + 10 * s} Q${W * 0.15},${G + 2 * s} ${W * 0.3},${G + 10 * s} Q${W * 0.45},${G + 18 * s} ${W * 0.6},${G + 10 * s} Q${W * 0.75},${G + 2 * s} ${W * 0.9},${G + 10 * s} L${W},${G + 10 * s} L0,${G + 10 * s} Z;M0,${G + 13 * s} Q${W * 0.15},${G + 5 * s} ${W * 0.3},${G + 13 * s} Q${W * 0.45},${G + 21 * s} ${W * 0.6},${G + 13 * s} Q${W * 0.75},${G + 5 * s} ${W * 0.9},${G + 13 * s} L${W},${G + 13 * s} L0,${G + 13 * s} Z;M0,${G + 10 * s} Q${W * 0.15},${G + 2 * s} ${W * 0.3},${G + 10 * s} Q${W * 0.45},${G + 18 * s} ${W * 0.6},${G + 10 * s} Q${W * 0.75},${G + 2 * s} ${W * 0.9},${G + 10 * s} L${W},${G + 10 * s} L0,${G + 10 * s} Z`} dur="5s" repeatCount="indefinite" />
            </path>
            {/* Wind lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <path key={`wind${i}`} d={`M${-10 * s},${80 * s + i * 30 * s} Q${W * 0.3},${70 * s + i * 30 * s} ${W * 0.6},${85 * s + i * 30 * s} Q${W * 0.85},${75 * s + i * 30 * s} ${W + 10 * s},${80 * s + i * 30 * s}`} fill="none" stroke="#78909C" strokeWidth={1.5 * s} opacity="0.25">
                <animate attributeName="opacity" values="0.1;0.35;0.1" dur={`${2.5 + i * 0.4}s`} repeatCount="indefinite" />
              </path>
            ))}
          </g>
        )}

        {countryId === 'japan' && (
          <g className="quake-bg">
            {/* Seismic crack lines on ground */}
            <path d={`M${W * 0.1},${G + 3 * s} L${W * 0.3},${G} L${W * 0.5},${G + 5 * s} L${W * 0.7},${G - 2 * s} L${W * 0.9},${G + 2 * s}`} fill="none" stroke="#795548" strokeWidth={2 * s} strokeLinecap="round" opacity="0.5" strokeDasharray={`${8 * s} ${6 * s}`}>
              <animate attributeName="strokeDashoffset" from="0" to={`${14 * s}`} dur="1s" repeatCount="indefinite" />
            </path>
          </g>
        )}

        {countryId === 'brazil' && (
          <g className="tropical-bg">
            {/* Palm trees */}
            <g transform={`translate(${W * 0.05}, ${G - 120 * s})`}>
              <rect x={0} y={30 * s} width={6 * s} height={90 * s} fill="#5D4037" />
              <ellipse cx={3 * s} cy={25 * s} rx={25 * s} ry={12 * s} fill="#43A047" opacity="0.8" />
              <ellipse cx={-8 * s} cy={30 * s} rx={15 * s} ry={8 * s} fill="#388E3C" opacity="0.7" />
              <ellipse cx={14 * s} cy={28 * s} rx={18 * s} ry={10 * s} fill="#2E7D32" opacity="0.7" />
            </g>
            <g transform={`translate(${W * 0.92}, ${G - 100 * s})`}>
              <rect x={0} y={25 * s} width={5 * s} height={75 * s} fill="#5D4037" />
              <ellipse cx={3 * s} cy={20 * s} rx={20 * s} ry={10 * s} fill="#43A047" opacity="0.8" />
              <ellipse cx={-6 * s} cy={24 * s} rx={12 * s} ry={7 * s} fill="#388E3C" opacity="0.7" />
            </g>
            {/* Humidity droplets on building */}
            {Array.from({ length: 8 }).map((_, i) => (
              <circle key={`humid${i}`} cx={WL + (i + 1) * WW / 9} cy={WT_TOP + 10 * s + (i % 3) * 20 * s} r={2 * s} fill="#B3E5FC" opacity="0.5">
                <animate attributeName="opacity" values="0.2;0.6;0.2" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
              </circle>
            ))}
          </g>
        )}

        {/* Saudi sandstorm particles */}
        {countryId === 'saudi' && (
          <g className="sandstorm">
            {Array.from({ length: 15 }).map((_, i) => (
              <circle key={`sand${i}`} cx={(i * 37) * s % W} cy={G - 30 * s + (i * 23) * s % (WT)} r={(1.5 + i % 3) * s} fill="#D4A574" opacity={0.3 + (i % 3) * 0.15}>
                <animate attributeName="cx" from={`${(i * 37) * s % W}`} to={`${(i * 37 + 80) * s % W}`} dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values={`${0.1 + (i % 3) * 0.1};${0.4 + (i % 3) * 0.1};${0.1 + (i % 3) * 0.1}`} dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
              </circle>
            ))}
          </g>
        )}

        {/* ===== GROUND ===== */}
        {countryId !== 'saudi' && (
          <rect x="0" y={G} width={W} height={H - G + 60 * s} fill="url(#groundGrad)" />
        )}

        {/* === FOUNDATION === */}
        {fs.type === 'elevated' ? (
          <g>
            {/* Stilts */}
            {[
              { x: WL + 15 * s },
              { x: MX - 5 * s },
              { x: WR - 15 * s },
            ].map((p, i) => (
              <rect key={i} x={p.x - 4 * s} y={G} width={8 * s} height={FND_H} fill={fs.fill} stroke={fs.line} strokeWidth={1.5 * s} rx={1} />
            ))}
            {/* Platform */}
            <rect x={WL - 8 * s} y={G - 8 * s} width={WW + 16 * s} height={10 * s} fill={fs.fill} stroke={fs.line} strokeWidth={2 * s} rx={2 * s} />
          </g>
        ) : (
          <rect x={WL - 12 * s} y={G} width={WW + 24 * s} height={FND_H} fill={fs.fill} stroke={fs.line} strokeWidth={2 * s} />
        )}

        {/* ===== WALLS ===== */}
        {ws.pattern === 'bricks' && <rect x={WL} y={WT_TOP} width={WW} height={WT} fill="url(#pBrick)" stroke={ws.line} strokeWidth={2.5 * s} />}
        {ws.pattern === 'blocks' && <rect x={WL} y={WT_TOP} width={WW} height={WT} fill="url(#pBlocks)" stroke={ws.line} strokeWidth={2.5 * s} />}
        {ws.pattern === 'planks' && <rect x={WL} y={WT_TOP} width={WW} height={WT} fill="url(#pPlanks)" stroke={ws.line} strokeWidth={2.5 * s} />}
        {ws.pattern === 'steelpanels' && <rect x={WL} y={WT_TOP} width={WW} height={WT} fill="url(#pSteelPanels)" stroke={ws.line} strokeWidth={2.5 * s} />}
        {ws.pattern === 'grid' && <rect x={WL} y={WT_TOP} width={WW} height={WT} fill="url(#pGrid)" stroke={ws.line} strokeWidth={2.5 * s} />}
        {/* Wall overlay for solid fill fallback */}
        <rect x={WL} y={WT_TOP} width={WW} height={WT} fill={ws.fill1} fillOpacity="0.05" stroke={ws.line} strokeWidth={2.5 * s} />

        {/* === INSULATION LAYER === */}
        {hasInsulation && (
          <rect x={WL + 4 * s} y={WT_TOP + 4 * s} width={WW - 8 * s} height={WT - 8 * s} fill="none" stroke="#FF9800" strokeWidth={4 * s} strokeDasharray={`${10 * s} ${5 * s}`} rx={3 * s} opacity="0.6">
            <animate attributeName="strokeDashoffset" from="0" to={`${15 * s}`} dur="3s" repeatCount="indefinite" />
          </rect>
        )}

        {/* === REINFORCEMENT STRUTS === */}
        {hasStruts && (
          <g>
            <rect x={MX - 3 * s} y={WT_TOP + 5 * s} width={6 * s} height={WT - 10 * s} fill="#FF5722" opacity="0.45" rx={2} />
            <rect x={WL + 8 * s} y={WT_TOP + WT * 0.33} width={WW - 16 * s} height={5 * s} fill="#FF5722" opacity="0.45" rx={2} />
            <rect x={WL + 8 * s} y={WT_TOP + WT * 0.66} width={WW - 16 * s} height={5 * s} fill="#FF5722" opacity="0.45" rx={2} />
          </g>
        )}

        {/* ===== FLOOR LINES ===== */}
        {bs.floors > 1 && Array.from({ length: bs.floors - 1 }).map((_, i) => (
          <line key={`floor${i}`} x1={WL} y1={WT_TOP + (i + 1) * (WT / bs.floors)} x2={WR} y2={WT_TOP + (i + 1) * (WT / bs.floors)} stroke={ws.line} strokeWidth={1.5 * s} />
        ))}

        {/* ===== DOOR ===== */}
        <rect x={MX - 18 * s} y={G - 70 * s} width={36 * s} height={70 * s} fill="#5D4037" stroke="#3E2723" strokeWidth={1.5 * s} rx={3 * s} />
        <circle cx={MX + 10 * s} cy={G - 35 * s} r={2.5 * s} fill="#FFD54F" />
        <rect x={MX - 6 * s} y={G - 58 * s} width={12 * s} height={16 * s} fill="#FFECB3" opacity="0.5" rx={1 * s} />
        {/* Door arch */}
        <path d={`M${MX - 18 * s},${G - 70 * s + 3 * s} Q${MX - 18 * s},${G - 70 * s - 5 * s} ${MX},${G - 70 * s - 5 * s} Q${MX + 18 * s},${G - 70 * s - 5 * s} ${MX + 18 * s},${G - 70 * s + 3 * s}`} fill="#5D4037" stroke="#3E2723" strokeWidth={1 * s} />

        {/* ===== WINDOWS ===== */}
        {Array.from({ length: bs.winRows }).map((_, row) =>
          Array.from({ length: bs.winCols }).map((_, col) => {
            const winSize = getWindowSize(row, col);
            const winW = winSize.w;
            const winH = winSize.h;
            const winGapX = WW / (bs.winCols + 1);
            const winGapY = bs.wallH > 250 ? (WT - 80 * s) / (bs.winRows + 1) : WT / (bs.winRows + 1);
            const wx = WL + winGapX * (col + 1) - winW / 2 + (row % 2 === 1 ? winGapX * 0.2 : 0);
            const wy = WT_TOP + winGapY * (row + 1) - winH / 2 + 15 * s;
            if (wy + winH > G - 75 * s) return null;
            return (
              <g key={`win${row}-${col}`}>
                <rect x={wx} y={wy} width={winW} height={winH} fill="#BBDEFB" stroke="#37474F" strokeWidth={1.5 * s} rx={2 * s}>
                  <animate attributeName="opacity" values="0.85;1;0.85" dur={`${3 + row * 0.5}s`} repeatCount="indefinite" />
                </rect>
                <line x1={wx + winW / 2} y1={wy} x2={wx + winW / 2} y2={wy + winH} stroke="#546E7A" strokeWidth={0.8 * s} />
                <line x1={wx} y1={wy + winH / 2} x2={wx + winW} y2={wy + winH / 2} stroke="#546E7A" strokeWidth={0.8 * s} />
                <rect x={wx + 2 * s} y={wy + 2 * s} width={winW - 4 * s} height={winH / 2 - 2 * s} fill="#FFF9C4" opacity="0.15" rx={1 * s} />
                {hasShading && (
                  <rect x={wx - 4 * s} y={wy - 10 * s} width={winW + 8 * s} height={8 * s} fill="#FF8F00" stroke="#E65100" strokeWidth={0.8 * s} rx={2 * s} opacity="0.85">
                    <animate attributeName="opacity" values="0.7;0.9;0.7" dur="4s" repeatCount="indefinite" />
                  </rect>
                )}
              </g>
            );
          })
        )}

        {/* ===== VENTILATION ARROWS ===== */}
        {hasVent && (
          <g className="vent-arrows">
            {/* Left arrow */}
            <path d={`M${WL - 5 * s},${WT_TOP + WT * 0.4} L${WL - 25 * s},${WT_TOP + WT * 0.35} M${WL - 25 * s},${WT_TOP + WT * 0.35} L${WL - 18 * s},${WT_TOP + WT * 0.28} M${WL - 25 * s},${WT_TOP + WT * 0.35} L${WL - 18 * s},${WT_TOP + WT * 0.42}`} stroke="#29B6F6" strokeWidth={2.5 * s} fill="none" opacity="0.8">
              <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2s" repeatCount="indefinite" />
            </path>
            {/* Right arrow */}
            <path d={`M${WR + 5 * s},${WT_TOP + WT * 0.4} L${WR + 25 * s},${WT_TOP + WT * 0.35} M${WR + 25 * s},${WT_TOP + WT * 0.35} L${WR + 18 * s},${WT_TOP + WT * 0.28} M${WR + 25 * s},${WT_TOP + WT * 0.35} L${WR + 18 * s},${WT_TOP + WT * 0.42}`} stroke="#29B6F6" strokeWidth={2.5 * s} fill="none" opacity="0.8">
              <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2s" repeatCount="indefinite" begin="0.5s" />
            </path>
            {/* Air particles */}
            {Array.from({ length: 4 }).map((_, i) => (
              <circle key={`vp${i}`} cx={WL - 15 * s - i * 5 * s} cy={WT_TOP + WT * 0.4} r={2 * s} fill="#29B6F6" opacity="0.4">
                <animate attributeName="cx" from={`${WL - 5 * s}`} to={`${WL - 35 * s}`} dur={`${1 + i * 0.3}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur={`${1 + i * 0.3}s`} repeatCount="indefinite" />
              </circle>
            ))}
            {Array.from({ length: 4 }).map((_, i) => (
              <circle key={`vp2${i}`} cx={WR + 5 * s + i * 5 * s} cy={WT_TOP + WT * 0.4} r={2 * s} fill="#29B6F6" opacity="0.4">
                <animate attributeName="cx" from={`${WR + 5 * s}`} to={`${WR + 35 * s}`} dur={`${1 + i * 0.3}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur={`${1 + i * 0.3}s`} repeatCount="indefinite" />
              </circle>
            ))}
          </g>
        )}

        {/* ===== ROOF ===== */}
        <g className="roof-group">
          {rs.shape === 'peaked' && (
            <>
              <path d={`M${WL - 25 * s},${WT_TOP} L${MX},${WT_TOP - ROOF_H} L${WR + 25 * s},${WT_TOP} Z`} fill={rs.fill} stroke={rs.line} strokeWidth={2.5 * s} />
              {/* Eave overhangs */}
              <line x1={WL - 25 * s} y1={WT_TOP} x2={WL - 25 * s} y2={WT_TOP + 6 * s} stroke={rs.line} strokeWidth={2 * s} />
              <line x1={WR + 25 * s} y1={WT_TOP} x2={WR + 25 * s} y2={WT_TOP + 6 * s} stroke={rs.line} strokeWidth={2 * s} />
            </>
          )}
          {rs.shape === 'sloped' && (
            <>
              <path d={`M${WL - 20 * s},${WT_TOP + 3 * s} L${WL - 5 * s},${WT_TOP - ROOF_H} L${WR + 20 * s},${WT_TOP - ROOF_H + 15 * s} L${WR + 5 * s},${WT_TOP - 1 * s} Z`} fill={rs.fill} stroke={rs.line} strokeWidth={2.5 * s} />
              <line x1={WL - 20 * s} y1={WT_TOP + 3 * s} x2={WL - 20 * s} y2={WT_TOP + 8 * s} stroke={rs.line} strokeWidth={2 * s} />
              <line x1={WR + 20 * s} y1={WT_TOP - ROOF_H + 15 * s} x2={WR + 20 * s} y2={WT_TOP + 5 * s} stroke={rs.line} strokeWidth={2 * s} />
            </>
          )}
          {rs.shape === 'flat' && (
            <>
              <rect x={WL - 30 * s} y={WT_TOP - 12 * s} width={WW + 60 * s} height={14 * s} fill={rs.fill} stroke={rs.line} strokeWidth={2.5 * s} rx={2 * s} />
              {/* Parapet */}
              <rect x={WL - 30 * s} y={WT_TOP - 16 * s} width={WW + 60 * s} height={5 * s} fill={rs.line} rx={1} />
            </>
          )}
          {/* Roof glow for solar */}
          {rs.glow && (
            <ellipse cx={MX} cy={WT_TOP - ROOF_H / 2} rx={WW * 0.4} ry={ROOF_H * 0.8} fill="#FFEA00" opacity="0.08">
              <animate attributeName="opacity" values="0.05;0.15;0.05" dur="4s" repeatCount="indefinite" />
            </ellipse>
          )}
        </g>

        {/* ===== SOLAR PANELS ON ROOF ===== */}
        {hasSolar && rs.shape !== 'flat' && (
          <g className="solar-panels">
            <rect x={MX - 45 * s} y={WT_TOP - ROOF_H * 0.6} width={35 * s} height={18 * s} fill="#1565C0" stroke="#0D47A1" strokeWidth={1 * s} rx={1 * s} transform={`rotate(${-20 * s}, ${MX - 28 * s}, ${WT_TOP - ROOF_H * 0.5})`} opacity="0.9">
              <animate attributeName="opacity" values="0.85;1;0.85" dur="3s" repeatCount="indefinite" />
            </rect>
            <rect x={MX + 5 * s} y={WT_TOP - ROOF_H * 0.45} width={35 * s} height={18 * s} fill="#1565C0" stroke="#0D47A1" strokeWidth={1 * s} rx={1 * s} transform={`rotate(${-15 * s}, ${MX + 22 * s}, ${WT_TOP - ROOF_H * 0.35})`} opacity="0.9">
              <animate attributeName="opacity" values="0.9;1;0.9" dur="3s" repeatCount="indefinite" begin="0.5s" />
            </rect>
            {/* Panel grid lines */}
            <line x1={MX - 38 * s} y1={WT_TOP - ROOF_H * 0.55} x2={MX - 20 * s} y2={WT_TOP - ROOF_H * 0.5} stroke="#90CAF9" strokeWidth={0.5 * s} />
            <line x1={MX + 12 * s} y1={WT_TOP - ROOF_H * 0.4} x2={MX + 30 * s} y2={WT_TOP - ROOF_H * 0.35} stroke="#90CAF9" strokeWidth={0.5 * s} />
          </g>
        )}

        {/* ===== RAINWATER TANK ===== */}
        {hasRainTank && (
          <g className="rainwater-tank">
            <rect x={WR + 18 * s} y={G - 60 * s} width={28 * s} height={58 * s} fill="#546E7A" stroke="#37474F" strokeWidth={1.5 * s} rx={4 * s} />
            <rect x={WR + 14 * s} y={G - 64 * s} width={36 * s} height={7 * s} fill="#455A64" stroke="#37474F" strokeWidth={1 * s} rx={2 * s} />
            {/* Pipe from roof */}
            <line x1={WR + 10 * s} y1={WT_TOP + 5 * s} x2={WR + 18 * s} y2={G - 60 * s} stroke="#78909C" strokeWidth={3 * s} />
            {/* Water level inside */}
            <rect x={WR + 21 * s} y={G - 15 * s} width={22 * s} height={10 * s} fill="#42A5F5" opacity="0.6" rx={2 * s}>
              <animate attributeName="height" values={`${8 * s};${12 * s};${8 * s}`} dur="5s" repeatCount="indefinite" />
            </rect>
            {/* Drop icon */}
            <text x={WR + 32 * s} y={G - 28 * s} textAnchor="middle" fill="white" fontSize={`${14 * s}px`}>💧</text>
          </g>
        )}

        {/* ===== HOSPITAL CROSS ===== */}
        {bs.cross && (
          <g>
            <rect x={MX - 6 * s} y={WT_TOP + 8 * s} width={12 * s} height={30 * s} fill="#F44336" rx={1} />
            <rect x={MX - 15 * s} y={WT_TOP + 17 * s} width={30 * s} height={12 * s} fill="#F44336" rx={1} />
          </g>
        )}

        {/* ===== BARN (Farm House) ===== */}
        {bs.barn && (
          <g>
            <rect x={WR + 5 * s} y={G - 100 * s} width={70 * s} height={100 * s} fill="#8D6E63" stroke="#5D4037" strokeWidth={1.5 * s} />
            <path d={`M${WR + 5 * s},${G - 100 * s} L${WR + 40 * s},${G - 130 * s} L${WR + 75 * s},${G - 100 * s} Z`} fill="#A1887F" stroke="#5D4037" strokeWidth={1.5 * s} />
            <rect x={WR + 30 * s} y={G - 80 * s} width={20 * s} height={25 * s} fill="#5D4037" rx={1} />
          </g>
        )}

        {/* ===== SNOW ON ROOF ===== */}
        {countryId === 'canada' && (
          <g className="snow-on-roof">
            <path d={`M${WL - 25 * s},${WT_TOP + 2 * s} Q${WL + WW * 0.2},${WT_TOP - 8 * s} ${MX},${WT_TOP - ROOF_H - 5 * s} Q${WL + WW * 0.8},${WT_TOP - 8 * s} ${WR + 25 * s},${WT_TOP + 2 * s}`} fill="white" opacity="0.8" />
            {/* Icicles */}
            {[WL + 20 * s, WL + WW * 0.3, MX, WL + WW * 0.7, WR - 20 * s].map((x, i) => (
              <path key={`icicle${i}`} d={`M${x},${WT_TOP + 2 * s} L${x - 3 * s},${WT_TOP + 12 * s} L${x + 3 * s},${WT_TOP + 2 * s}`} fill="#B3E5FC" opacity="0.7" />
            ))}
          </g>
        )}

        {/* ===== BUILDING LABEL ===== */}
        <text x={MX} y={G + FND_H + 18 * s} textAnchor="middle" fill="#37474F" fontSize={`${10 * s}px`} fontWeight="600">
          {ws.label} · {rs.label} · {fs.label}
        </text>
      </svg>
    </div>
  );
});

export default BuildingCanvasInner;