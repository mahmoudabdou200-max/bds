import { useRef, useEffect, memo } from 'react';
import gsap from 'gsap';
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

function BuildingCartoonInner({ wallId, roofId, foundationId, featureIds, countryId, buildingTypeId, size = 'large', damageClass, disasterType, isShaking, onShakeComplete }) {
  const wallRef = useRef(null);
  const roofRef = useRef(null);
  const leftWallRef = useRef(null);
  const rightWallRef = useRef(null);
  const foundationRef = useRef(null);
  const buildingRef = useRef(null);
  const crackRefs = useRef([]);
  const debrisRef = useRef(null);

  const ws = wallStyles[wallId] || wallStyles.wall_concrete;
  const rs = roofStyles[roofId] || roofStyles.roof_metal;
  const fs = foundStyles[foundationId] || foundStyles.found_standard;
  const bs = buildingShapes[buildingTypeId] || buildingShapes.house;

  const s = size === 'large' ? 1 : size === 'medium' ? 0.75 : 0.55;

  const WT = bs.wallH * s;
  const W = SVGW * s;
  const H = SVGH * s;
  const G = GROUND * s;
  const WL = WL_CONST * s;
  const WR = WR_CONST * s;
  const WW = WR - WL;
  const MX = (WL + WR) / 2;
  const WT_TOP = G - WT;
  const FND_H = fs.type === 'deep' ? 50 * s : fs.type === 'elevated' ? 35 * s : 22 * s;
  const ROOF_H = bs.roofExtra * s;

  // GSAP Cartoon Animations
  useEffect(() => {
    if (!buildingRef.current) return;

    if (damageClass === 'severe' && disasterType === 'earthquake') {
      // Cartoon severe shake + wall crack
      const tl = gsap.timeline({ onComplete: onShakeComplete });
      tl.to(buildingRef.current, {
        x: 20, rotation: 3, transformOrigin: 'bottom center',
        duration: 0.08, ease: 'power2.inOut',
      })
      .to(buildingRef.current, { x: -20, rotation: -3, duration: 0.08, ease: 'power2.inOut' })
      .to(buildingRef.current, { x: 15, rotation: 2, duration: 0.08, ease: 'power2.inOut' })
      .to(buildingRef.current, { x: -15, rotation: -2, duration: 0.08, ease: 'power2.inOut' })
      .to(buildingRef.current, { x: 0, rotation: 0, duration: 0.1, ease: 'elastic.out(1, 0.5)' });

      // Crack animation
      if (crackRefs.current.length > 0) {
        crackRefs.current.forEach((crack, i) => {
          if (crack) {
            gsap.fromTo(crack,
              { strokeDasharray: '500', strokeDashoffset: 500, opacity: 0 },
              { strokeDashoffset: 0, opacity: 1, duration: 0.8, delay: i * 0.2, ease: 'power2.out' }
            );
          }
        });
      }

      // Roof sliding off (cartoon style)
      if (roofRef.current) {
        gsap.to(roofRef.current, {
          y: -30, x: 40, rotation: 15, transformOrigin: 'bottom center',
          duration: 1.5, delay: 0.5, ease: 'back.in(1.5)',
        });
      }
    }

    if (damageClass === 'moderate' && disasterType === 'flood') {
      // Water pushing building
      gsap.to(buildingRef.current, {
        x: 5, transformOrigin: 'bottom center',
        duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut',
      });
    }

    if (damageClass && disasterType === 'typhoon') {
      // Building leaning in wind
      gsap.to(buildingRef.current, {
        rotation: damageClass === 'severe' ? 8 : damageClass === 'moderate' ? 4 : 2,
        transformOrigin: 'bottom center',
        duration: 0.5, repeat: -1, yoyo: true, ease: 'sine.inOut',
      });

      // Roof lifting
      if (roofRef.current && damageClass === 'severe') {
        gsap.to(roofRef.current, {
          y: -50, rotation: -10, transformOrigin: 'bottom center',
          duration: 2, ease: 'power2.in', onComplete: () => {
            gsap.set(roofRef.current, { opacity: 0 });
          }
        });
      }
    }

    if (damageClass && disasterType === 'bushfire') {
      // Building scorching effect
      if (wallRef.current) {
        gsap.to(wallRef.current, {
          filter: 'brightness(0.7) saturate(1.5)',
          duration: 2, ease: 'power2.in',
        });
      }
    }

    return () => { gsap.killTweensOf(buildingRef.current); };
  }, [damageClass, disasterType]);

  // Generate crack paths
  const generateCracks = () => {
    const cracks = [];
    if (damageClass === 'severe') {
      cracks.push(`M${WL + WW * 0.3},${WT_TOP} Q${WL + WW * 0.4},${WT_TOP + WT * 0.3} ${WL + WW * 0.5},${WT_TOP + WT * 0.5}`);
      cracks.push(`M${WL + WW * 0.6},${WT_TOP} Q${WL + WW * 0.7},${WT_TOP + WT * 0.4} ${WL + WW * 0.8},${WT_TOP + WT * 0.7}`);
      cracks.push(`M${MX},${WT_TOP} L${MX + 20},${G}`);
    } else if (damageClass === 'moderate') {
      cracks.push(`M${WL + WW * 0.4},${WT_TOP + WT * 0.2} Q${WL + WW * 0.5},${WT_TOP + WT * 0.4} ${WL + WW * 0.6},${WT_TOP + WT * 0.6}`);
    }
    return cracks;
  };

  const cracks = generateCracks();

  return (
    <div ref={buildingRef} className={`building-cartoon building-canvas-${size}`} style={{ position: 'relative' }}>
      <svg ref={wallRef} viewBox={`0 0 ${W} ${H + 60 * s}`} className="building-svg" style={{ width: '100%', maxWidth: W }}>
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

          {/* Cartoon Filter: Rough Edge */}
          <filter id="roughEdge" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
          </filter>

          {/* Cartoon Filter: Scorch */}
          <filter id="scorch" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" result="displaced" />
            <feColorMatrix type="saturate" values="1.8" in="displaced" result="saturated" />
            <feComponentTransfer>
              <feFuncR type="linear" slope="0.7" />
              <feFuncG type="linear" slope="0.6" />
              <feFuncB type="linear" slope="0.4" />
            </feComponentTransfer>
          </filter>
        </defs>

        {/* Sky */}
        <rect x="0" y="0" width={W} height={H + 60 * s} fill="url(#skyGrad)" />

        {/* Ground */}
        <rect x={0} y={G} width={W} height={H + 60 * s - G} fill="url(#groundGrad)" />
        <rect x={WL} y={G} width={WW} height={20 * s} fill="#8D6E63" rx={3 * s} />

        {/* Foundation */}
        <rect
          ref={foundationRef}
          x={WL + 10 * s} y={G - FND_H} width={WW - 20 * s} height={FND_H}
          fill={fs.fill} stroke={fs.line} strokeWidth={2 * s}
        />

        {/* Left Wall */}
        <rect
          ref={leftWallRef}
          x={WL} y={WT_TOP} width={WW * 0.48} height={WT}
          fill={ws.fill1} stroke={ws.line} strokeWidth={2 * s}
          filter={damageClass === 'severe' ? 'url(#roughEdge)' : undefined}
        />

        {/* Right Wall */}
        <rect
          ref={rightWallRef}
          x={WL + WW * 0.52} y={WT_TOP} width={WW * 0.48} height={WT}
          fill={ws.fill1} stroke={ws.line} strokeWidth={2 * s}
          filter={damageClass === 'severe' ? 'url(#roughEdge)' : undefined}
        />

        {/* Door */}
        <rect x={MX - (bs.doorW / 2) * s} y={G - bs.doorH * s} width={bs.doorW * s} height={bs.doorH * s}
          fill="#5D4037" stroke="#3E2723" strokeWidth={1.5 * s} rx={2 * s} />
        <circle cx={MX + (bs.doorW / 2 - 8) * s} cy={G - bs.doorH * s + 40 * s} r={3 * s} fill="#FFD54F" />

        {/* Windows */}
        {Array.from({ length: bs.winRows * bs.winCols }).map((_, i) => {
          const row = Math.floor(i / bs.winCols);
          const col = i % bs.winCols;
          const winW = 34 * s;
          const winH = 40 * s;
          const gapX = WW / (bs.winCols + 1);
          const gapY = WT > 250 ? (WT - 80 * s) / (bs.winRows + 1) : WT / (bs.winRows + 1);
          const x = WL + gapX * (col + 1) - winW / 2;
          const y = WT_TOP + gapY * (row + 1) - winH / 2 + 15 * s;
          return (
            <rect key={i} x={x} y={y} width={winW} height={winH}
              fill="#B3E5FC" stroke={ws.line} strokeWidth={1.5 * s} rx={3 * s} opacity={damageClass === 'severe' ? 0.5 : 1}>
              {damageClass === 'severe' && (
                <animate attributeName="opacity" values="1;0.5;1" dur="0.3s" repeatCount="indefinite" />
              )}
            </rect>
          );
        })}

        {/* Roof */}
        <g ref={roofRef}>
          {rs.shape === 'sloped' && (
            <polygon
              points={`${WL - 10 * s},${WT_TOP} ${MX},${WT_TOP - ROOF_H} ${WR + 10 * s},${WT_TOP}`}
              fill={rs.fill} stroke={rs.line} strokeWidth={2.5 * s}
            />
          )}
          {rs.shape === 'peaked' && (
            <path
              d={`M${WL - 10 * s},${WT_TOP} L${MX},${WT_TOP - ROOF_H * 1.2} L${WR + 10 * s},${WT_TOP} L${WR},${WT_TOP} L${MX},${WT_TOP - ROOF_H * 0.8} L${WL},${WT_TOP} Z`}
              fill={rs.fill} stroke={rs.line} strokeWidth={2.5 * s}
            />
          )}
          {rs.shape === 'flat' && (
            <rect x={WL - 10 * s} y={WT_TOP - 15 * s} width={WW + 20 * s} height={15 * s}
              fill={rs.fill} stroke={rs.line} strokeWidth={2 * s} />
          )}
        </g>

        {/* Cracks */}
        {cracks.map((d, i) => (
          <path
            key={i}
            ref={el => crackRefs.current[i] = el}
            d={d}
            fill="none"
            stroke="#3E2723"
            strokeWidth={2 * s}
            strokeDasharray="500"
            strokeDashoffset="500"
            opacity="0"
            style={{ filter: 'url(#roughEdge)' }}
          />
        ))}

        {/* Debris at base (severe damage) */}
        {damageClass === 'severe' && (
          <g ref={debrisRef}>
            {Array.from({ length: 5 }).map((_, i) => (
              <rect key={i}
                x={WL + (i * WW / 5) + 10 * s}
                y={G - 5 * s}
                width={(15 + i * 3) * s}
                height={(10 + i * 2) * s}
                fill={i % 2 ? '#78909C' : '#90A4AE'}
                rx={2 * s}
                opacity={0.8}
              />
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}

export default memo(BuildingCartoonInner);
