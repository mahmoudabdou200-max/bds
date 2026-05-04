import { useRef, useEffect, useMemo, memo } from 'react';
import { motion, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { useAnimationControls } from 'motion/react';
import './BuildingCanvas.css';

export const SVGW = 500, SVGH = 600, GROUND = 480;
export const WL_CONST = 100, WR_CONST = 400;
export const WW_CONST = WR_CONST - WL_CONST;
export const MX_CONST = (WL_CONST + WR_CONST) / 2;

// Professional cartoon: 12 principles of animation
const useCartoonPhysics = (damageClass, disasterType) => {
  const controls = useAnimationControls();

  useEffect(() => {
    if (!damageClass) {
      controls.start({ x: 0, rotate: 0, scaleX: 1, scaleY: 1 });
      return;
    }

    const sequence = [];

    switch (disasterType) {
      case 'earthquake':
        if (damageClass === 'severe') {
          // Anticipation -> Impact -> Follow through
          controls.start({
            scaleY: 0.85, scaleX: 1.15,
            transition: { duration: 0.15, ease: [0.8, 0, 1, 1] }
          }).then(() => {
            controls.start({
              scaleY: 1.1, scaleX: 0.9,
              transition: { duration: 0.12, ease: [0.8, 0, 1, 1] }
            }).then(() => {
              controls.start({
                x: [0, -25, 25, -15, 15, 0],
                rotate: [0, -4, 4, -3, 3, 0],
                transition: { duration: 0.5, ease: 'easeInOut' }
              });
            });
          });
        }
        break;
      case 'typhoon':
        if (damageClass === 'severe') {
          controls.start({
            rotate: 15,
            transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
          }).then(() => {
            controls.start({
              y: -300, x: 200, rotate: 45,
              transition: { duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }
            });
          });
        }
        break;
      default:
        if (damageClass) {
          controls.start({
            x: [0, -10, 10, -5, 5, 0],
            transition: { duration: 0.6, ease: 'easeInOut' }
          });
        }
    }
  }, [damageClass, disasterType]);

  return controls;
};

function BuildingMotionUltra({ wallId, roofId, foundationId, buildingTypeId, damageClass, disasterType, simPhase }) {
  const controls = useCartoonPhysics(damageClass, disasterType);
  const debrisRef = useRef([]);

  const ws = {
    wall_concrete: '#B0BEC5',
    wall_brick: '#EF9A9A',
    wall_wood: '#BCAAA4',
    wall_steel: '#90A4AE',
    wall_recycled: '#C8E6C9',
  }[wallId] || '#B0BEC5';

  const rs = {
    roof_metal: { fill: '#78909C', shape: 'sloped' },
    roof_tiled: { fill: '#FF8A65', shape: 'peaked' },
    roof_flat_concrete: { fill: '#B0BEC5', shape: 'flat' },
    roof_solar: { fill: '#42A5F5', shape: 'sloped' },
  }[roofId] || { fill: '#78909C', shape: 'sloped' };

  const bs = {
    house: { width: 300, height: 240, roofH: 70, doorW: 38, doorH: 70 },
    school: { width: 380, height: 320, roofH: 40, doorW: 50, doorH: 75 },
    hospital: { width: 400, height: 360, roofH: 30, doorW: 55, doorH: 80 },
    emergency_shelter: { width: 280, height: 180, roofH: 50, doorW: 35, doorH: 60 },
    farm_house: { width: 320, height: 220, roofH: 80, doorW: 36, doorH: 68 },
    office_building: { width: 350, height: 400, roofH: 25, doorW: 55, doorH: 80 },
  }[buildingTypeId] || { width: 300, height: 240, roofH: 70, doorW: 38, doorH: 70 };

  const s = 1; // large size
  const W = SVGW * s;
  const H = SVGH * s;
  const G = GROUND * s;
  const WL = WL_CONST * s;
  const WR = WR_CONST * s;
  const WW = WR - WL;
  const MX = MX_CONST * s;
  const WT = bs.height * s;
  const WT_TOP = G - WT;
  const ROOF_H = bs.roofH * s;

  return (
    <div style={{ width: '100%', maxWidth: W, margin: '0 auto', position: 'relative', height: H + 60 * s }}>
      <svg viewBox={`0 0 ${W} ${H + 60 * s}`} style={{ width: '100%', position: 'absolute', top: 0, left: 0 }}>
        {/* Sky */}
        <rect x="0" y="0" width={W} height={H + 60 * s} fill="url(#skyGrad)" />

        {/* Ground */}
        <rect x="0" y={G} width={W} height={H + 60 * s - G} fill="#66BB6A" />
      </svg>

      {/* Building with Motion */}
      <motion.div
        animate={controls}
        style={{
          position: 'absolute',
          top: 60,
          left: 0,
          width: '100%',
          height: H,
          transformOrigin: 'bottom center',
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%' }}>
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#64B5F6" />
              <stop offset="60%" stopColor="#BBDEFB" />
              <stop offset="100%" stopColor="#E1F5FE" />
            </linearGradient>
          </defs>

          {/* Left Wall */}
          <motion.rect
            initial={{ x: WL, y: WT_TOP, width: WW * 0.48, height: WT }}
            animate={damageClass === 'severe' ? {
              x: WL - 50,
              opacity: 0,
              rotate: -45,
              transition: { duration: 1.2, delay: 0.5 }
            } : {}}
            fill={ws}
            stroke="#333"
            strokeWidth="2"
          />

          {/* Right Wall */}
          <motion.rect
            initial={{ x: WL + WW * 0.52, y: WT_TOP, width: WW * 0.48, height: WT }}
            animate={damageClass === 'severe' ? {
              x: WL + WW * 0.52 + 50,
              opacity: 0,
              rotate: 45,
              transition: { duration: 1.2, delay: 0.5 }
            } : {}}
            fill={ws}
            stroke="#333"
            strokeWidth="2"
          />

          {/* Roof */}
          <motion.polygon
            initial={{ points: `${WL - 10},${WT_TOP} ${MX},${WT_TOP - ROOF_H} ${WR + 10},${WT_TOP}` }}
            animate={damageClass === 'severe' ? {
              y: -100,
              x: 100,
              rotate: 25,
              opacity: 0,
              transition: { duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }
            } : {}}
            fill={rs.fill}
            stroke="#333"
            strokeWidth="2.5"
          />

          {/* Door */}
          <rect
            x={MX - bs.doorW / 2}
            y={G - bs.doorH}
            width={bs.doorW}
            height={bs.doorH}
            fill="#5D4037"
            stroke="#333"
            strokeWidth="1.5"
            rx="2"
          />

          {/* Windows */}
          {[...Array(4)].map((_, i) => {
            const row = Math.floor(i / 2);
            const col = i % 2;
            const winW = 34, winH = 40;
            const gapX = WW / 3;
            const gapY = WT / 3;
            const x = WL + gapX * (col + 1) - winW / 2;
            const y = WT_TOP + gapY * (row + 1) - winH / 2 + 15;
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={winW}
                height={winH}
                fill="#B3E5FC"
                stroke="#333"
                strokeWidth="1.5"
                rx="3"
              />
            );
          })}
        </svg>
      </motion.div>

      {/* Impact Stars */}
      <AnimatePresence>
        {damageClass === 'severe' && simPhase === 2 && (
          <>
            {[...Array(6)].map((_, i) => {
              const angle = (i / 6) * 360;
              const rad = (angle * Math.PI) / 180;
              const x = MX + Math.cos(rad) * 60;
              const y = WT_TOP + 50 + Math.sin(rad) * 60;
              return (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 1, x, y }}
                  animate={{ scale: 1.5, opacity: 0, x: x + Math.cos(rad) * 30, y: y + Math.sin(rad) * 30 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  style={{
                    position: 'absolute',
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#FFD600',
                    boxShadow: '0 0 10px #FFD600',
                  }}
                />
              );
            })}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(BuildingMotionUltra);
