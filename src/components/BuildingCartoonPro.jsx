import { useRef, useEffect, useCallback, memo } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { CustomEase } from 'gsap/CustomEase';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import './BuildingCanvas.css';

gsap.registerPlugin(CustomEase, MotionPathPlugin);

export const SVGW = 500, SVGH = 600, GROUND = 480;
export const WL_CONST = 100, WR_CONST = 400;
export const WW_CONST = WR_CONST - WL_CONST;
export const MX_CONST = (WL_CONST + WR_CONST) / 2;

// Building data (same as before)
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

// Cartoon SFX - Visual "impact stars", "boing", "crash" effects
const ImpactStar = memo(function ImpactStar({ x, y, delay = 0, color = '#FFD600' }) {
  const starRef = useRef(null);

  useGSAP(() => {
    if (!starRef.current) return;
    gsap.fromTo(starRef.current,
      { scale: 0, rotation: 0, opacity: 1 },
      {
        scale: 1.5, rotation: 180, opacity: 0,
        duration: 0.6, delay, ease: 'power2.out',
        onComplete: () => { if (starRef.current) gsap.set(starRef.current, { opacity: 0 }); }
      }
    );
  }, [delay]);

  return (
    <circle ref={starRef} cx={x} cy={y} r={12} fill={color} opacity={0}
      style={{ filter: 'drop-shadow(0 0 6px rgba(255,214,0,0.8))' }}
    />
  );
});

const CrashLines = memo(function CrashLines({ x, y, count = 6 }) {
  const groupRef = useRef(null);

  useGSAP(() => {
    if (!groupRef.current) return;
    const lines = groupRef.current.children;
    gsap.fromTo(lines,
      { scale: 0, opacity: 1 },
      { scale: 1, opacity: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
    );
  }, []);

  return (
    <g ref={groupRef}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 360;
        const rad = (angle * Math.PI) / 180;
        const x2 = x + Math.cos(rad) * 40;
        const y2 = y + Math.sin(rad) * 40;
        return <line key={i} x1={x} y1={y} x2={x2} y2={y2} stroke="#FFD600" strokeWidth="3" opacity={0}
          style={{ filter: 'drop-shadow(0 0 4px rgba(255,214,0,0.6))' }}
        />;
      })}
    </g>
  );
});

const DustPuff = memo(function DustPuff({ x, y, delay = 0, scale = 1 }) {
  const puffRef = useRef(null);

  useGSAP(() => {
    if (!puffRef.current) return;
    gsap.fromTo(puffRef.current,
      { scale: 0, opacity: 0.8 },
      {
        scale: scale * 2, opacity: 0,
        duration: 1, delay, ease: 'power1.out',
        onComplete: () => { if (puffRef.current) gsap.set(puffRef.current, { opacity: 0 }); }
      }
    );
  }, [delay, scale]);

  return (
    <ellipse ref={puffRef} cx={x} cy={y} rx={20} ry={12} fill="#BCAAA4" opacity={0}
      style={{ filter: 'blur(3px)' }}
    />
  );
});

function BuildingCartoonPro({ wallId, roofId, foundationId, featureIds, countryId, buildingTypeId, size = 'large', damageClass, disasterType, simPhase }) {
  const buildingRef = useRef(null);
  const wallLeftRef = useRef(null);
  const wallRightRef = useRef(null);
  const roofRef = useRef(null);
  const foundationRef = useRef(null);
  const doorRef = useRef(null);
  const windowRefs = useRef([]);
  const debrisRef = useRef(null);
  const impactRef = useRef(null);
  const masterTl = useRef(null);

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
  const MX = MX_CONST * s;
  const WT_TOP = G - WT;
  const FND_H = fs.type === 'deep' ? 50 * s : fs.type === 'elevated' ? 35 * s : 22 * s;
  const ROOF_H = bs.roofExtra * s;

  // Master GSAP Timeline for all cartoon animations
  useGSAP(() => {
    if (!buildingRef.current) return;

    // Kill previous timeline
    if (masterTl.current) {
      masterTl.current.kill();
    }

    const tl = gsap.timeline({ paused: true });
    masterTl.current = tl;

    switch (disasterType) {
      case 'earthquake':
        if (damageClass === 'severe') {
          // Cartoon Earthquake: Squash & Stretch, Anticipation, Impact
          tl.to(buildingRef.current, {
            scaleY: 0.85, scaleX: 1.15, transformOrigin: 'bottom center',
            duration: 0.15, ease: 'power2.in',
          })
          .to(buildingRef.current, {
            scaleY: 1.1, scaleX: 0.9, transformOrigin: 'bottom center',
            duration: 0.12, ease: 'power2.out',
          }, '>')
          .to(buildingRef.current, {
            x: -25, rotation: -4, transformOrigin: 'bottom center',
            duration: 0.1, ease: 'power3.inOut',
          }, '>')
          .to(buildingRef.current, {
            x: 25, rotation: 4, transformOrigin: 'bottom center',
            duration: 0.1, ease: 'power3.inOut',
          })
          .to(buildingRef.current, {
            x: -15, rotation: -3, transformOrigin: 'bottom center',
            duration: 0.1, ease: 'power3.inOut',
          })
          .to(buildingRef.current, {
            x: 15, rotation: 3, transformOrigin: 'bottom center',
            duration: 0.1, ease: 'power3.inOut',
          })
          .to(buildingRef.current, {
            x: 0, rotation: 0, scaleX: 1, scaleY: 1,
            duration: 0.3, ease: 'elastic.out(1.2, 0.4)',
          })
          // Roof slides off with anticipation
          .to(roofRef.current, {
            y: -10, duration: 0.2, ease: 'power2.in',
          }, '>')
          .to(roofRef.current, {
            y: -60, x: 50, rotation: 25, transformOrigin: 'bottom center',
            duration: 1.2, ease: 'back.in(2)',
            onStart: () => {
              // Impact stars at roof point
              if (impactRef.current) {
                gsap.fromTo(impactRef.current,
                  { scale: 0, opacity: 1 },
                  { scale: 2, opacity: 0, duration: 0.8, ease: 'power2.out' }
                );
              }
            }
          })
          // Walls crack and crumble
          .to([wallLeftRef.current, wallRightRef.current], {
            scaleY: 0.95, transformOrigin: 'top center',
            duration: 0.5, ease: 'power2.in',
          }, '<')
          .to(wallLeftRef.current, {
            x: -20, opacity: 0.7, duration: 0.8, ease: 'power2.in',
          }, '>')
          .to(wallRightRef.current, {
            x: 20, opacity: 0.7, duration: 0.8, ease: 'power2.in',
          }, '<');

        } else if (damageClass === 'moderate') {
          // Moderate: Wobble with squash & stretch
          tl.to(buildingRef.current, {
            scaleX: 1.05, scaleY: 0.95, rotation: 2, transformOrigin: 'bottom center',
            duration: 0.2, ease: 'power2.inOut',
            repeat: 3, yoyo: true,
          })
          .to(buildingRef.current, {
            x: 0, rotation: 0, scaleX: 1, scaleY: 1,
            duration: 0.4, ease: 'elastic.out(1, 0.5)',
          });
        } else if (damageClass === 'minor') {
          // Minor: Slight shake
          tl.to(buildingRef.current, {
            x: 5, duration: 0.1, ease: 'power2.inOut',
            repeat: 5, yoyo: true,
          });
        }
        break;

      case 'flood':
        if (damageClass === 'severe') {
          // Building being pushed by water
          tl.to(buildingRef.current, {
            x: 30, rotation: 3, transformOrigin: 'bottom center',
            duration: 2, ease: 'power1.inOut',
          })
          .to(foundationRef.current, {
            y: 20, duration: 1, ease: 'power2.in',
          }, '<')
          .to(buildingRef.current, {
            scaleY: 0.9, transformOrigin: 'bottom center',
            duration: 0.5, ease: 'power2.in',
          }, '<')
          .to(buildingRef.current, {
            x: 0, y: 0, rotation: 0, scaleY: 1,
            duration: 1.5, ease: 'elastic.out(0.8, 0.5)',
          });
        } else if (damageClass) {
          // Water ripple effect
          tl.to(buildingRef.current, {
            scale: 1.02, transformOrigin: 'center center',
            duration: 0.8, repeat: -1, yoyo: true, ease: 'sine.inOut',
          });
        }
        break;

      case 'typhoon':
        if (damageClass === 'severe') {
          // Building rips apart in wind
          tl.to(buildingRef.current, {
            rotation: 15, transformOrigin: 'bottom center',
            duration: 0.5, ease: 'power2.in',
          })
          .to(roofRef.current, {
            y: -80, rotation: -30, x: 60, transformOrigin: 'bottom center',
            duration: 1.5, ease: 'power2.in',
            onComplete: () => {
              if (roofRef.current) gsap.set(roofRef.current, { opacity: 0 });
            }
          }, '<')
          .to(wallLeftRef.current, {
            x: -100, rotation: -45, transformOrigin: 'bottom center',
            duration: 1.2, ease: 'power2.in',
          }, '>')
          .to(wallRightRef.current, {
            x: 100, rotation: 45, transformOrigin: 'bottom center',
            duration: 1.2, ease: 'power2.in',
          }, '<')
          .to(foundationRef.current, {
            scaleX: 1.1, transformOrigin: 'center center',
            duration: 0.3, ease: 'power2.in',
          }, '<');
        } else if (damageClass) {
          tl.to(buildingRef.current, {
            rotation: damageClass === 'moderate' ? 8 : 4, transformOrigin: 'bottom center',
            duration: 0.4, repeat: -1, yoyo: true, ease: 'sine.inOut',
          });
        }
        break;

      case 'bushfire':
        // Walls darken and warp from heat
        if (damageClass === 'severe') {
          tl.to([wallLeftRef.current, wallRightRef.current], {
            filter: 'brightness(0.5) saturate(1.5)',
            duration: 2, ease: 'power2.in',
          })
          .to(roofRef.current, {
            scaleY: 0.9, transformOrigin: 'top center',
            duration: 1, ease: 'power2.in',
          }, '<')
          .to(buildingRef.current, {
            scaleY: 0.95, transformOrigin: 'bottom center',
            duration: 1.5, ease: 'power1.in',
          }, '<');
        } else if (damageClass) {
          tl.to([wallLeftRef.current, wallRightRef.current], {
            filter: `brightness(${1 - damageClass === 'moderate' ? 0.2 : 0.1})`,
            duration: 1, ease: 'power2.inOut',
          });
        }
        break;

      default:
        // Generic damage
        if (damageClass === 'severe') {
          tl.to(buildingRef.current, {
            scaleY: 0.8, rotation: 5, transformOrigin: 'bottom center',
            duration: 1, ease: 'power2.in',
          });
        }
        break;
    }

    // Play timeline if in simulation phase
    if (simPhase >= 2 && damageClass) {
      tl.play();
    }

    return () => {
      if (masterTl.current) {
        masterTl.current.kill();
      }
    };
  }, [damageClass, disasterType, simPhase]);

  // Window positions
  const getWindowPositions = () => {
    const positions = [];
    for (let row = 0; row < bs.winRows; row++) {
      for (let col = 0; col < bs.winCols; col++) {
        const winW = 34 * s;
        const winH = 40 * s;
        const gapX = WW / (bs.winCols + 1);
        const gapY = WT > 250 ? (WT - 80 * s) / (bs.winRows + 1) : WT / (bs.winRows + 1);
        positions.push({
          x: WL + gapX * (col + 1) - winW / 2,
          y: WT_TOP + gapY * (row + 1) - winH / 2 + 15 * s,
          w: winW, h: winH,
        });
      }
    }
    return positions;
  };

  const windowPositions = getWindowPositions();

  return (
    <div ref={buildingRef} className={`building-cartoon-pro building-canvas-${size}`}
      style={{ position: 'relative', transformOrigin: 'bottom center' }}>

      {/* Impact effect container */}
      <div ref={impactRef} style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 10, opacity: 0,
      }}>
        <svg viewBox={`0 0 ${W} ${H + 60 * s}`} style={{ width: '100%', height: '100%' }}>
          <ImpactStar x={WL + WW * 0.3} y={WT_TOP + 50} delay={0} />
          <ImpactStar x={WL + WW * 0.7} y={WT_TOP + 50} delay={0.1} />
          <ImpactStar x={MX} y={WT_TOP + 20} delay={0.2} color="#FF6F00" />
          <CrashLines x={MX} y={WT_TOP + 40} />
        </svg>
      </div>

      <svg viewBox={`0 0 ${W} ${H + 60 * s}`} className="building-svg" style={{ width: '100%', maxWidth: W }}>
        <defs>
          <linearGradient id="skyGradPro" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#64B5F6" />
            <stop offset="60%" stopColor="#BBDEFB" />
            <stop offset="100%" stopColor="#E1F5FE" />
          </linearGradient>
          <linearGradient id="groundGradPro" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#66BB6A" />
            <stop offset="100%" stopColor="#388E3C" />
          </linearGradient>
          <filter id="cartoonBlur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0" result="blur" />
            <feColorMatrix in="blur" type="saturate" values="1.3" />
          </filter>
        </defs>

        {/* Sky */}
        <rect x="0" y="0" width={W} height={H + 60 * s} fill="url(#skyGradPro)" />

        {/* Ground */}
        <rect x={0} y={G} width={W} height={H + 60 * s - G} fill="url(#groundGradPro)" />
        <rect x={WL} y={G} width={WW} height={20 * s} fill="#8D6E63" rx={3 * s} />

        {/* Foundation */}
        <rect
          ref={foundationRef}
          x={WL + 10 * s} y={G - FND_H} width={WW - 20 * s} height={FND_H}
          fill={fs.fill} stroke={fs.line} strokeWidth={2 * s}
          style={{ transformOrigin: 'center center' }}
        />

        {/* Left Wall */}
        <rect
          ref={wallLeftRef}
          x={WL} y={WT_TOP} width={WW * 0.48} height={WT}
          fill={ws.fill1} stroke={ws.line} strokeWidth={2 * s}
          style={{ transformOrigin: 'bottom center' }}
        />

        {/* Right Wall */}
        <rect
          ref={wallRightRef}
          x={WL + WW * 0.52} y={WT_TOP} width={WW * 0.48} height={WT}
          fill={ws.fill1} stroke={ws.line} strokeWidth={2 * s}
          style={{ transformOrigin: 'bottom center' }}
        />

        {/* Door */}
        <rect ref={doorRef}
          x={MX - (bs.doorW / 2) * s} y={G - bs.doorH * s} width={bs.doorW * s} height={bs.doorH * s}
          fill="#5D4037" stroke="#3E2723" strokeWidth={1.5 * s} rx={2 * s} />
        <circle cx={MX + (bs.doorW / 2 - 8) * s} cy={G - bs.doorH * s + 40 * s} r={3 * s} fill="#FFD54F" />

        {/* Windows */}
        {windowPositions.map((pos, i) => (
          <rect
            key={i}
            ref={el => windowRefs.current[i] = el}
            x={pos.x} y={pos.y} width={pos.w} height={pos.h}
            fill="#B3E5FC" stroke={ws.line} strokeWidth={1.5 * s} rx={3 * s}
          />
        ))}

        {/* Roof */}
        <g ref={roofRef} style={{ transformOrigin: 'bottom center' }}>
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

        {/* Debris container */}
        <g ref={debrisRef}>
          {damageClass === 'severe' && (
            <>
              {Array.from({ length: 8 }).map((_, i) => (
                <rect key={i}
                  x={WL + (i * WW / 8) + 5 * s}
                  y={G - 5 * s}
                  width={(12 + i * 2) * s}
                  height={(8 + i) * s}
                  fill={i % 2 ? '#78909C' : '#90A4AE'}
                  rx={2 * s}
                  opacity={0.9}
                />
              ))}
            </>
          )}
        </g>
      </svg>
    </div>
  );
}

export default memo(BuildingCartoonPro);
