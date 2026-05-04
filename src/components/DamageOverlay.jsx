import { SVGW, WL_CONST, WR_CONST, WW_CONST, MX_CONST, GROUND } from '../data/animationUtils';

export default function DamageOverlay({ disasterType, simPhase, damageParams, size = 'large' }) {
  if (simPhase < 2 || !damageParams) return null;

  const s = size === 'large' ? 1 : size === 'medium' ? 0.75 : 0.55;
  const WL = WL_CONST * s;
  const WR = WR_CONST * s;
  const WW = WW_CONST * s;
  const MX = MX_CONST * s;
  const wallH = 240 * s;
  const G = GROUND * s;
  const WT_TOP = G - wallH;
  const opacity = Math.min(1, (simPhase - 2) * 0.5 + damageParams.damageIntensity * 0.5);

  return (
    <svg
      viewBox={`0 0 ${SVGW * s} ${600 * s + 60 * s}`}
      className="damage-overlay-svg"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}
    >
      {/* EARTHQUAKE / TYPHOON CRACKS */}
      {(disasterType === 'earthquake' || disasterType === 'typhoon') && damageParams.crackSeverity > 0 && (
        <g className="cracks-layer" style={{ opacity, transition: 'opacity 0.8s ease' }}>
          {Array.from({ length: Math.ceil(damageParams.crackSeverity * 4) }).map((_, i) => {
            const cx = MX - WW * 0.3 + i * WW * 0.15;
            const crackH = wallH * (0.3 + damageParams.crackSeverity * 0.5);
            return (
              <path
                key={`crack${i}`}
                d={`M${cx},${G} L${cx - 5 * s},${G - crackH * 0.3} L${cx + 8 * s},${G - crackH * 0.6} L${cx - 3 * s},${G - crackH}`}
                stroke={damageParams.crackSeverity > 0.5 ? '#D32F2F' : '#795548'}
                strokeWidth={(1 + damageParams.crackSeverity * 2) * s}
                fill="none"
                strokeLinecap="round"
                style={{
                  strokeDasharray: 300,
                  strokeDashoffset: 300,
                  animation: `crackDraw ${1 + i * 0.3}s ease-out forwards`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            );
          })}
          {/* Branch cracks for moderate/severe */}
          {damageParams.crackSeverity > 0.4 && Array.from({ length: Math.ceil(damageParams.crackSeverity * 3) }).map((_, i) => {
            const bx = MX - WW * 0.2 + i * WW * 0.2;
            const by = G - wallH * (0.2 + i * 0.15);
            return (
              <path
                key={`branch${i}`}
                d={`M${bx},${by} L${bx + 12 * s},${by - 15 * s}`}
                stroke="#795548"
                strokeWidth={(0.8 + damageParams.crackSeverity) * s}
                fill="none"
                style={{
                  strokeDasharray: 50,
                  strokeDashoffset: 50,
                  animation: `crackDraw 0.8s ease-out forwards`,
                  animationDelay: `${0.5 + i * 0.15}s`,
                }}
              />
            );
          })}
        </g>
      )}

      {/* FLOOD / TSUNAMI WATER DAMAGE */}
      {(disasterType === 'flood' || disasterType === 'tsunami') && damageParams.waterLineY > 0 && (
        <g className="water-damage-layer" style={{ opacity, transition: 'opacity 0.8s ease' }}>
          {/* Water stain on wall */}
          <rect
            x={WL}
            y={G - wallH * (1 - damageParams.waterLineY)}
            width={WW}
            height={wallH * (1 - damageParams.waterLineY) * damageParams.damageIntensity}
            fill="#42A5F5"
            opacity={0.15 + damageParams.damageIntensity * 0.15}
            rx={2}
            style={{ animation: 'waterStainRise 2s ease-out forwards' }}
          />
          {/* Water line mark */}
          <path
            d={`M${WL},${G - wallH * (1 - damageParams.waterLineY)} Q${MX},${G - wallH * (1 - damageParams.waterLineY) - 3 * s} ${WR},${G - wallH * (1 - damageParams.waterLineY)}`}
            stroke="#1565C0"
            strokeWidth={2 * s}
            fill="none"
            opacity={0.5 + damageParams.damageIntensity * 0.3}
          />
          {/* Drip marks for moderate+ damage */}
          {damageParams.damageIntensity > 0.3 && Array.from({ length: 3 + Math.floor(damageParams.damageIntensity * 4) }).map((_, i) => (
            <circle
              key={`drip${i}`}
              cx={WL + (i + 1) * WW / (4 + Math.floor(damageParams.damageIntensity * 4))}
              cy={G - wallH * (1 - damageParams.waterLineY) + 5 * s + (i % 3) * 12 * s}
              r={(1.5 + damageParams.damageIntensity) * s}
              fill="#42A5F5"
              opacity={0.4}
            >
              <animate attributeName="cy" values={`${G - wallH * (1 - damageParams.waterLineY) + 5 * s};${G - wallH * (1 - damageParams.waterLineY) + 15 * s};${G - wallH * (1 - damageParams.waterLineY) + 5 * s}`} dur="2.5s" repeatCount="indefinite" />
            </circle>
          ))}
        </g>
      )}

      {/* HEAT / BUSHFIRE SCORCH */}
      {(disasterType === 'heat_wave' || disasterType === 'bushfire') && damageParams.scorchOpacity > 0 && (
        <g className="scorch-layer" style={{ opacity: damageParams.scorchOpacity + 0.1, transition: 'opacity 0.8s ease' }}>
          {/* Scorch marks from base */}
          {Array.from({ length: Math.ceil(damageParams.damageIntensity * 3) }).map((_, i) => {
            const sx = WL + 20 * s + i * WW * 0.35;
            return (
              <path
                key={`scorch${i}`}
                d={`M${sx},${G} Q${sx + 5 * s},${G - 25 * s} ${sx - 3 * s},${G - 50 * s * damageParams.damageIntensity}`}
                stroke="#5D4037"
                strokeWidth={(2 + damageParams.damageIntensity * 2) * s}
                fill="none"
                opacity={0.5}
                style={{
                  strokeDasharray: 100,
                  strokeDashoffset: 100,
                  animation: 'crackDraw 1.5s ease-out forwards',
                }}
              />
            );
          })}
          {/* Heat distortion shimmer over wall */}
          {damageParams.damageIntensity > 0.4 && Array.from({ length: 4 }).map((_, i) => (
            <path
              key={`shimmer${i}`}
              d={`M${WL},${WT_TOP + wallH * (0.15 + i * 0.25)} Q${MX},${WT_TOP + wallH * (0.15 + i * 0.25) - 5 * s} ${WR},${WT_TOP + wallH * (0.15 + i * 0.25)}`}
              stroke="#FF9800"
              strokeWidth={s}
              fill="none"
              opacity={0.25}
            >
              <animate attributeName="d" values={`M${WL},${WT_TOP + wallH * (0.15 + i * 0.25)} Q${MX},${WT_TOP + wallH * (0.15 + i * 0.25) - 5 * s} ${WR},${WT_TOP + wallH * (0.15 + i * 0.25)};M${WL},${WT_TOP + wallH * (0.15 + i * 0.25) + 3 * s} Q${MX},${WT_TOP + wallH * (0.15 + i * 0.25) + 8 * s} ${WR},${WT_TOP + wallH * (0.15 + i * 0.25) + 3 * s};M${WL},${WT_TOP + wallH * (0.15 + i * 0.25)} Q${MX},${WT_TOP + wallH * (0.15 + i * 0.25) - 5 * s} ${WR},${WT_TOP + wallH * (0.15 + i * 0.25)}`} dur="3s" repeatCount="indefinite" />
            </path>
          ))}
        </g>
      )}

      {/* BLIZZARD ICE & FROST */}
      {disasterType === 'blizzard' && damageParams.iceCoverage > 0 && (
        <g className="ice-layer" style={{ opacity: 0.5 + damageParams.iceCoverage * 0.3, transition: 'opacity 0.8s ease' }}>
          {/* Frost on walls */}
          <rect
            x={WL + 2 * s}
            y={WT_TOP + 2 * s}
            width={WW - 4 * s}
            height={wallH * damageParams.iceCoverage * 0.4}
            fill="white"
            opacity={0.15 + damageParams.iceCoverage * 0.15}
            rx={2}
          />
          {/* Icicles under roof */}
          {Array.from({ length: 3 + Math.floor(damageParams.iceCoverage * 5) }).map((_, i) => {
            const ix = WL + 20 * s + i * (WW - 40 * s) / (2 + Math.floor(damageParams.iceCoverage * 5));
            const iLen = (8 + damageParams.iceCoverage * 20) * s;
            return (
              <polygon
                key={`icicle${i}`}
                points={`${ix},${WT_TOP + 2 * s} ${ix - 2 * s},${WT_TOP + 2 * s + iLen} ${ix + 2 * s},${WT_TOP + 2 * s}`}
                fill="#B3E5FC"
                opacity={0.7}
                style={{ animation: 'icicleGrow 1.5s ease-out forwards', transformOrigin: `${ix}px ${WT_TOP}px` }}
              />
            );
          })}
          {/* Window frost rectangles */}
          {damageParams.iceCoverage > 0.4 && Array.from({ length: 2 }).map((_, i) => (
            <rect
              key={`frostWin${i}`}
              x={WL + WW * 0.25 + i * WW * 0.4}
              y={WT_TOP + wallH * 0.25}
              width={WW * 0.2}
              height={wallH * 0.15}
              fill="#E3F2FD"
              opacity={0.3 + damageParams.iceCoverage * 0.2}
              rx={2 * s}
            />
          ))}
        </g>
      )}

      {/* SANDSTORM DUST ACCUMULATION */}
      {disasterType === 'sandstorm' && damageParams.sandDensity > 0 && (
        <g className="sand-damage-layer" style={{ opacity: damageParams.sandDensity * 0.6, transition: 'opacity 0.8s ease' }}>
          {/* Sand pile at base of wall */}
          {(() => {
            const sd = damageParams.sandDensity;
            const peakH = Math.floor(15 + sd * 30) * s;
            const midH = Math.floor(10 + sd * 20) * s;
            const sideH = Math.floor(12 + sd * 25) * s;
            const d = `M${WL - 10 * s},${G} Q${WL + WW * 0.2},${G - peakH} ${MX},${G - midH} Q${WR - WW * 0.2},${G - sideH} ${WR + 10 * s},${G} Z`;
            return <path d={d} fill="#D4A574" opacity={0.5} />;
          })()}
          {/* Dust film on walls */}
          <rect
            x={WL}
            y={G - wallH * 0.4 * damageParams.sandDensity}
            width={WW}
            height={wallH * 0.4 * damageParams.sandDensity}
            fill="#D4A574"
            opacity={0.1 + damageParams.sandDensity * 0.1}
            rx={2}
          />
        </g>
      )}
    </svg>
  );
}