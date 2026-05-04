export default function StickFigureScene({ disasterType, simPhase, damageLevel, size = 'large' }) {
  if (simPhase < 1) return null;

  const s = size === 'large' ? 1 : size === 'medium' ? 0.75 : 0.55;
  // Figure positions: left of building, right of building
  const leftX = 55 * s;
  const rightX = 430 * s;
  const groundY = 475 * s;
  const scale = 0.7 * s;

  const reactionLeft = getReaction(disasterType, simPhase, damageLevel, 'left');
  const reactionRight = getReaction(disasterType, simPhase, damageLevel, 'right');

  return (
    <svg
      viewBox="0 0 500 600"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 6 }}
    >
      <g transform={`translate(${leftX}, ${groundY}) scale(${scale})`}>
        <StickFigure reaction={reactionLeft} />
      </g>
      <g transform={`translate(${rightX}, ${groundY}) scale(${scale})`}>
        <StickFigure reaction={reactionRight} />
      </g>
    </svg>
  );
}

function StickFigure({ reaction }) {
  // reaction: { type, animClass, expression, extras }
  const { type, animClass, expression, extras } = reaction;

  return (
    <g className={`stick-figure ${animClass}`} style={{ transformOrigin: '0 0' }}>
      {/* Head */}
      <circle cx="0" cy="-28" r="6" fill="#FFCC80" stroke="#333" strokeWidth="0.5" />
      {/* Body */}
      <line x1="0" y1="-22" x2="0" y2="0" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
      {/* Expression */}
      {expression === 'worried' && (
        <>
          <circle cx="-2" cy="-30" r="1" fill="#333" />
          <circle cx="2" cy="-30" r="1" fill="#333" />
          <path d="M-2,-26 Q0,-24 2,-26" stroke="#333" strokeWidth="0.5" fill="none" />
        </>
      )}
      {expression === 'scared' && (
        <>
          <circle cx="-2" cy="-30" r="1.5" fill="#333" />
          <circle cx="2" cy="-30" r="1.5" fill="#333" />
          <ellipse cx="0" cy="-25.5" rx="2" ry="1.5" fill="#333" />
        </>
      )}
      {expression === 'happy' && (
        <>
          <circle cx="-2" cy="-30" r="1" fill="#333" />
          <circle cx="2" cy="-30" r="1" fill="#333" />
          <path d="M-3,-26 Q0,-23 3,-26" stroke="#333" strokeWidth="0.5" fill="none" />
        </>
      )}
      {expression === 'neutral' && (
        <>
          <circle cx="-2" cy="-30" r="1" fill="#333" />
          <circle cx="2" cy="-30" r="1" fill="#333" />
          <line x1="-2" y1="-26" x2="2" y2="-26" stroke="#333" strokeWidth="0.5" />
        </>
      )}
      {expression === 'crying' && (
        <>
          <circle cx="-2" cy="-30" r="1" fill="#333" />
          <circle cx="2" cy="-30" r="1" fill="#333" />
          <path d="M-3,-26 Q0,-28 3,-26" stroke="#333" strokeWidth="0.5" fill="none" />
          {/* Teardrop */}
          <circle cx="-3" cy="-27" r="1" fill="#42A5F5" opacity="0.7">
            <animate attributeName="cy" values="-27;-24;-27" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="3" cy="-27" r="1" fill="#42A5F5" opacity="0.7">
            <animate attributeName="cy" values="-27;-24;-27" dur="1.8s" repeatCount="indefinite" />
          </circle>
        </>
      )}

      {/* Arms and legs vary by type */}
      {type === 'standing' && (
        <>
          <line x1="0" y1="-16" x2="-10" y2="-8" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="-16" x2="10" y2="-8" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="0" x2="-7" y2="14" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="0" x2="7" y2="14" stroke="#333" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {type === 'covering' && (
        <>
          {/* Arms over head */}
          <line x1="0" y1="-16" x2="-8" y2="-30" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="-16" x2="8" y2="-30" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="0" x2="-7" y2="14" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="0" x2="7" y2="14" stroke="#333" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {type === 'running' && (
        <>
          <line x1="0" y1="-16" x2="-12" y2="-6" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="-16" x2="6" y2="-24" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="0" x2="-10" y2="12" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="0" x2="10" y2="10" stroke="#333" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {type === 'cheering' && (
        <>
          {/* Arms up */}
          <line x1="0" y1="-16" x2="-10" y2="-35" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="-16" x2="10" y2="-35" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="0" x2="-7" y2="14" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="0" x2="7" y2="14" stroke="#333" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {type === 'fanning' && (
        <>
          <line x1="0" y1="-16" x2="6" y2="-24" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          {/* Fan in right hand */}
          <rect x="6" y="-30" width="8" height="10" rx="1" fill="#FFECB3" stroke="#FFB300" strokeWidth="0.5" transform="rotate(-15, 10, -25)">
            <animateTransform attributeName="transform" type="rotate" values="-15,10,-25;10,10,-25;-15,10,-25" dur="0.6s" repeatCount="indefinite" />
          </rect>
          <line x1="0" y1="-16" x2="-8" y2="-8" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="0" x2="-7" y2="14" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="0" x2="7" y2="14" stroke="#333" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {type === 'thumbsUp' && (
        <>
          <line x1="0" y1="-16" x2="8" y2="-24" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          {/* Thumb */}
          <line x1="8" y1="-24" x2="8" y2="-30" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="0" y1="-16" x2="-8" y2="-8" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="0" x2="-7" y2="14" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="0" x2="7" y2="14" stroke="#333" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {type === 'shivering' && (
        <>
          <line x1="0" y1="-16" x2="-10" y2="-10" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="-16" x2="10" y2="-10" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="0" x2="-7" y2="14" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="0" x2="7" y2="14" stroke="#333" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {type === 'cowering' && (
        <>
          {/* Squatting lower */}
          <line x1="0" y1="-14" x2="-12" y2="-18" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="-14" x2="4" y2="-20" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <line x1="-3" y1="2" x2="-8" y2="8" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <line x1="3" y1="2" x2="8" y2="8" stroke="#333" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {type === 'umbrella' && (
        <>
          <line x1="0" y1="-16" x2="5" y2="-8" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="-16" x2="-8" y2="-8" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="0" x2="-7" y2="14" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="0" x2="7" y2="14" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          {/* Umbrella */}
          <line x1="0" y1="-28" x2="0" y2="-50" stroke="#333" strokeWidth="1.5" />
          <path d="M-12,-50 Q0,-60 12,-50" fill="#1976D2" stroke="#0D47A1" strokeWidth="0.5" />
          <path d="M0,-50 L0,-48" stroke="#0D47A1" strokeWidth="0.5" />
        </>
      )}

      {/* Extras */}
      {extras === 'hardhat' && (
        <ellipse cx="0" cy="-34" rx="7" ry="3" fill="#FFC107" stroke="#FF8F00" strokeWidth="0.5" />
      )}
      {extras === 'coat' && (
        <path d="M-6,-22 Q0,-24 6,-22 L6,-2 Q0,0 -6,-2 Z" fill="#1565C0" opacity="0.3" />
      )}
      {extras === 'hood' && (
        <>
          <path d="M-6,-28 Q0,-38 6,-28" fill="#D32F2F" strokeWidth="0" />
          <ellipse cx="0" cy="-28" rx="8" ry="3" fill="#D32F2F" />
        </>
      )}
      {extras === 'mask' && (
        <rect x="-3" y="-27" width="6" height="4" rx="1" fill="#90CAF9" opacity="0.8" />
      )}
    </g>
  );
}

// Reaction matrix: (disasterType, phase, damageLevel, position) -> { type, animClass, expression, extras }
function getReaction(disasterType, simPhase, damageLevel, position) {
  const isLeft = position === 'left';

  // Phase 1: disaster strikes — everyone is alarmed
  if (simPhase === 1) {
    switch (disasterType) {
      case 'earthquake':
        return damageLevel === 'severe'
          ? { type: 'cowering', animClass: 'stick-panic', expression: 'scared', extras: null }
          : { type: 'covering', animClass: 'stick-cautious', expression: 'worried', extras: null };
      case 'flood':
      case 'tsunami':
        return damageLevel === 'severe'
          ? { type: 'running', animClass: 'stick-panic', expression: 'scared', extras: null }
          : { type: 'umbrella', animClass: 'stick-cautious', expression: 'worried', extras: null };
      case 'heat_wave':
        return { type: 'fanning', animClass: 'stick-sway', expression: 'worried', extras: null };
      case 'sandstorm':
        return { type: 'covering', animClass: 'stick-cautious', expression: 'scared', extras: 'mask' };
      case 'blizzard':
        return { type: 'shivering', animClass: 'stick-shiver', expression: 'worried', extras: 'coat' };
      case 'typhoon':
        return damageLevel === 'severe'
          ? { type: 'cowering', animClass: 'stick-panic', expression: 'scared', extras: null }
          : { type: 'standing', animClass: 'stick-sway', expression: 'worried', extras: 'hood' };
      case 'bushfire':
        return damageLevel === 'severe'
          ? { type: 'running', animClass: 'stick-panic', expression: 'scared', extras: null }
          : { type: 'standing', animClass: 'stick-cautious', expression: 'worried', extras: null };
      default:
        return { type: 'standing', animClass: 'stick-cautious', expression: 'worried', extras: null };
    }
  }

  // Phase 2: damage assessment — reactions based on how building is doing
  if (simPhase === 2) {
    if (damageLevel === 'safe' || damageLevel === 'minor') {
      return isLeft
        ? { type: 'standing', animClass: '', expression: 'neutral', extras: 'hardhat' }
        : { type: 'standing', animClass: 'stick-sway', expression: 'neutral', extras: null };
    }
    if (damageLevel === 'moderate') {
      return isLeft
        ? { type: 'covering', animClass: 'stick-cautious', expression: 'worried', extras: 'hardhat' }
        : { type: 'running', animClass: 'stick-panic', expression: 'scared', extras: null };
    }
    // severe
    return isLeft
      ? { type: 'cowering', animClass: 'stick-panic', expression: 'scared', extras: null }
      : { type: 'running', animClass: 'stick-panic', expression: 'scared', extras: null };
  }

  // Phase 3: verdict — final reaction
  if (damageLevel === 'safe' || damageLevel === 'minor') {
    return isLeft
      ? { type: 'thumbsUp', animClass: 'stick-cheer', expression: 'happy', extras: null }
      : { type: 'cheering', animClass: 'stick-cheer', expression: 'happy', extras: null };
  }
  if (damageLevel === 'moderate') {
    return isLeft
      ? { type: 'standing', animClass: 'stick-sway', expression: 'worried', extras: null }
      : { type: 'covering', animClass: 'stick-cautious', expression: 'worried', extras: null };
  }
  // severe
  return isLeft
    ? { type: 'cowering', animClass: 'stick-panic', expression: 'crying', extras: null }
    : { type: 'covering', animClass: 'stick-panic', expression: 'scared', extras: null };
}