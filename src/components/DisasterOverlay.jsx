import { SVGW, GROUND, WL_CONST, WW_CONST, MX_CONST } from '../data/animationUtils';

export default function DisasterOverlay({ disasterType, simPhase, damageParams, size = 'large' }) {
  if (simPhase < 1) return null;

  const s = size === 'large' ? 1 : size === 'medium' ? 0.75 : 0.55;
  const W = SVGW * s;
  const H = 600 * s + 60 * s;
  const G = GROUND * s;
  const WL = WL_CONST * s;
  const WW = WW_CONST * s;
  const MX = MX_CONST * s;
  const di = damageParams.damageIntensity;
  const count = damageParams.debrisCount;

  const phaseOpacity = simPhase >= 4 ? 0 : simPhase === 1 ? 0.8 + di * 0.2 : 1;
  const transitionDur = simPhase === 1 ? '0.3s' : simPhase >= 4 ? '0.8s' : '0s';

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="disaster-overlay-svg"
      style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 4,
        opacity: phaseOpacity,
        transition: `opacity ${transitionDur} ease`,
      }}
    >
      {/* EARTHQUAKE */}
      {disasterType === 'earthquake' && (
        <g className="earthquake-environment">
          {Array.from({ length: 4 + Math.floor(di * 5) }).map((_, i) => (
            <circle
              key={`wave${i}`}
              cx={MX}
              cy={G}
              r={0}
              fill="none"
              stroke="#795548"
              strokeWidth={(2 + di * 2) * s}
              opacity={0.5 - i * 0.06}
            >
              <animate attributeName="r" values={`${10 * s};${(180 + i * 80) * s}`} dur={`${1.5 + i * 0.3}s`} begin={`${i * 0.2}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values={`${0.5 - i * 0.06};0`} dur={`${1.5 + i * 0.3}s`} begin={`${i * 0.2}s`} repeatCount="indefinite" />
            </circle>
          ))}

          {simPhase >= 2 && Array.from({ length: 5 + Math.min(count, 15) }).map((_, i) => {
            const bx = WL + 10 * s + (i * 31 * s) % WW;
            const sz = (4 + (i % 4) * 3) * s;
            return (
              <g key={`debris${i}`}>
                <rect
                  x={bx}
                  y={G - 250 * s - i * 25 * s}
                  width={sz}
                  height={sz * 1.2}
                  fill={i % 3 === 0 ? '#78909C' : i % 3 === 1 ? '#90A4AE' : '#B0BEC5'}
                  opacity={0.9}
                  rx={1}
                >
                  <animate attributeName="y" values={`${G - 250 * s - i * 25 * s};${G + 20 * s}`} dur={`${1 + (i % 4) * 0.2}s`} begin={`${i * 0.1}s`} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9;0.9;0" dur={`${1 + (i % 4) * 0.2}s`} begin={`${i * 0.1}s`} repeatCount="indefinite" />
                </rect>
              </g>
            );
          })}

          {di > 0.2 && Array.from({ length: 3 + Math.floor(di * 6) }).map((_, i) => (
            <ellipse
              key={`dust${i}`}
              cx={MX - WW * 0.3 + i * WW * 0.25}
              cy={G - 8 * s}
              rx={(30 + di * 50) * s}
              ry={(12 + di * 15) * s}
              fill="#BCAAA4"
              opacity={0.4}
            >
              <animate attributeName="rx" values={`${25 * s};${(70 + di * 30) * s};${25 * s}`} dur={`${2 + i * 0.4}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0.2;0.4" dur={`${2 + i * 0.4}s`} repeatCount="indefinite" />
            </ellipse>
          ))}
        </g>
      )}

      {/* FLOOD */}
      {disasterType === 'flood' && (
        <g className="flood-environment">
          <defs>
            <linearGradient id="floodGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#42A5F5" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#1565C0" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          <rect
            x={0}
            y={G + 20 * s}
            width={W}
            height={0}
            fill="url(#floodGrad)"
            opacity={0.4 + di * 0.3}
          >
            <animate attributeName="y" values={`${G + 20 * s};${G - (5 + di * H * 0.45) * s / s + 60 * s}`} dur="1.5s" fill="freeze" />
            <animate attributeName="height" values={`0;${(5 + di * H * 0.45) * s / s}`} dur="1.5s" fill="freeze" />
          </rect>

          {Array.from({ length: 25 + Math.floor(di * 30) }).map((_, i) => (
            <line
              key={`rain${i}`}
              x1={(i * 20 * s) % W}
              y1={-20 * s}
              x2={(i * 20 * s - 12 * s) % W}
              y2={15 * s}
              stroke="#90CAF9"
              strokeWidth={1.5 * s}
              opacity={0.4 + (i % 5) * 0.08}
            >
              <animate attributeName="y1" values={`${-40 * s};${H + 20 * s}`} dur={`${0.3 + (i % 4) * 0.1}s`} begin={`${i * 0.03}s`} repeatCount="indefinite" />
              <animate attributeName="y2" values={`${-15 * s};${H + 40 * s}`} dur={`${0.3 + (i % 4) * 0.1}s`} begin={`${i * 0.03}s`} repeatCount="indefinite" />
            </line>
          ))}
        </g>
      )}

      {/* HEAT WAVE */}
      {disasterType === 'heat_wave' && (
        <g className="heat-environment">
          <circle cx={W * 0.85} cy={50 * s} r={(40 + di * 25) * s} fill="#FFF9C4" opacity={0.5}>
            <animate attributeName="r" values={`${(40 + di * 25) * s};${(55 + di * 25) * s};${(40 + di * 25) * s}`} dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx={W * 0.85} cy={50 * s} r={(28 + di * 12) * s} fill="#FFD54F" opacity={0.8} />
          <circle cx={W * 0.85} cy={50 * s} r={(18 + di * 8) * s} fill="#FFC107" />
        </g>
      )}

      {/* SANDSTORM */}
      {disasterType === 'sandstorm' && (
        <g className="sandstorm-environment">
          <rect x={0} y={0} width={W} height={H} fill="#C4A44E" opacity={0.25 + di * 0.35} />
          {Array.from({ length: 20 + count * 2 }).map((_, i) => (
            <circle
              key={`sand${i}`}
              cx={(i * 24 * s) % W}
              cy={(i * 18 * s) % (H * 0.8)}
              r={(2 + (i % 4)) * s}
              fill="#D4A574"
              opacity={0.4 + (i % 5) * 0.12}
            >
              <animate attributeName="cx" values={`${(i * 24 * s) % W};${((i * 24 + 200) * s) % W}`} dur={`${1 + (i % 3) * 0.4}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </g>
      )}

      {/* BLIZZARD */}
      {disasterType === 'blizzard' && (
        <g className="blizzard-environment">
          <rect x={0} y={0} width={W} height={H} fill="#E3F2FD" opacity={0.2 + di * 0.2} />
          {Array.from({ length: 25 + Math.floor(di * 30) }).map((_, i) => {
            const r = (2.5 + (i % 4) * 2) * s;
            return (
              <circle
                key={`snow${i}`}
                cx={(i * 19 * s) % W}
                cy={-15 * s}
                r={r}
                fill="white"
                opacity={0.7 + (i % 4) * 0.1}
              >
                <animate attributeName="cy" values={`${-30 * s};${H + 30 * s}`} dur={`${1.5 + (i % 5) * 0.8}s`} begin={`${(i * 0.05) % 2}s`} repeatCount="indefinite" />
              </circle>
            );
          })}
        </g>
      )}

      {/* TYPHOON */}
      {disasterType === 'typhoon' && (
        <g className="typhoon-environment">
          <rect x={0} y={0} width={W} height={H * 0.5} fill="#37474F" opacity={0.3 + di * 0.2} />
          {Array.from({ length: 30 + Math.floor(di * 25) }).map((_, i) => (
            <line
              key={`train${i}`}
              x1={(i * 16 * s) % W}
              y1={-15 * s}
              x2={(i * 16 * s - 20 * s) % W}
              y2={25 * s}
              stroke="#546E7A"
              strokeWidth={2 * s}
              opacity={0.4 + (i % 4) * 0.1}
            >
              <animate attributeName="y1" values={`${-40 * s};${H + 30 * s}`} dur={`${0.25 + (i % 3) * 0.06}s`} begin={`${i * 0.02}s`} repeatCount="indefinite" />
            </line>
          ))}
        </g>
      )}

      {/* BUSHFIRE */}
      {disasterType === 'bushfire' && (
        <g className="bushfire-environment">
          {Array.from({ length: 5 + Math.floor(di * 6) }).map((_, i) => {
            const fx = WL - 30 * s + i * (WW + 60 * s) / (4 + Math.floor(di * 6));
            const peakH = (60 + di * 70) * s;
            const baseH = (40 + di * 50) * s;
            const d = `M${fx},${G} Q${fx + 12 * s},${G - baseH} ${fx + 24 * s},${G - peakH} Q${fx + 36 * s},${G - baseH} ${fx + 48 * s},${G}`;
            return (
              <path
                key={`flame${i}`}
                d={d}
                fill={i % 2 ? '#FF6F00' : '#F44336'}
                opacity={0.7 + di * 0.2}
              >
                <animate attributeName="d" values={`${d};M${fx},${G} Q${fx + 10 * s},${G - baseH * 0.8} ${fx + 24 * s},${G - peakH * 1.1} Q${fx + 38 * s},${G - baseH * 0.8} ${fx + 48 * s},${G};${d}`} dur="0.8s" repeatCount="indefinite" />
              </path>
            );
          })}
        </g>
      )}

      {/* TSUNAMI */}
      {disasterType === 'tsunami' && (
        <g className="tsunami-environment">
          <defs>
            <linearGradient id="tsunamiGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1565C0" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0D47A1" stopOpacity="1" />
            </linearGradient>
          </defs>
          <path
            d={`M${W + 60 * s},${H} L${W + 60 * s},${G - 200 * s - di * 150 * s} Q${W * 0.6},${G - 250 * s - di * 120 * s} ${W * 0.3},${G - di * 80 * s} L0,${G + 60 * s} Z`}
            fill="url(#tsunamiGrad)"
            opacity={0.6 + di * 0.3}
          />
        </g>
      )}
    </svg>
  );
}
