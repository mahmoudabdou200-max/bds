import { Factor } from './constants';

// --- Damage levels based on score ---
export function getDamageLevel(score) {
  if (score >= 70) return 'safe';
  if (score >= 50) return 'minor';
  if (score >= 30) return 'moderate';
  return 'severe';
}

// --- Map disaster type to primary factor ---
export const DISASTER_FACTOR_MAP = {
  earthquake: Factor.QUAKE,
  flood: Factor.WATER,
  heat_wave: Factor.HEAT,
  sandstorm: Factor.HEAT,
  blizzard: Factor.COLD_SNOW,
  typhoon: Factor.WIND,
  bushfire: Factor.HEAT,
  tsunami: Factor.WATER,
};

// --- Compute animation parameters from scores ---
export function getAnimationParams(disasterType, factorScores, overallScore) {
  const damage = getDamageLevel(overallScore);
  const primaryFactor = DISASTER_FACTOR_MAP[disasterType] || Factor.QUAKE;
  const primaryScore = factorScores?.[primaryFactor] ?? 50;

  // Low score → high damage intensity (inverted)
  const damageIntensity = Math.max(0, Math.min(1, (100 - primaryScore) / 100));

  return {
    damage,
    damageIntensity,
    primaryScore,
    crackSeverity: (disasterType === 'earthquake' || disasterType === 'typhoon') ? damageIntensity : 0,
    leanAngle: (disasterType === 'earthquake' || disasterType === 'typhoon') ? damageIntensity * 8 : 0,
    waterLineY: (disasterType === 'flood' || disasterType === 'tsunami')
      ? 0.3 + (1 - damageIntensity) * 0.4
      : 0,
    scorchOpacity: (disasterType === 'bushfire' || disasterType === 'heat_wave') ? damageIntensity * 0.6 : 0,
    shakeAmplitude: damageIntensity * 6,
    debrisCount: Math.floor(damageIntensity * 15),
    iceCoverage: disasterType === 'blizzard' ? damageIntensity : 0,
    sandDensity: disasterType === 'sandstorm' ? damageIntensity : 0,
    stickFigureReaction: damage,
  };
}

// --- Building coordinate constants (shared by overlays) ---
export const SVGW = 500;
export const SVGH = 600;
export const GROUND = 480;
export const WL_CONST = 100;
export const WR_CONST = 400;
export const WW_CONST = WR_CONST - WL_CONST;
export const MX_CONST = (WL_CONST + WR_CONST) / 2;

// --- Shake keyframe name by damage level ---
export const SHAKE_CLASS = {
  safe: 'shake-safe',
  minor: 'shake-minor',
  moderate: 'shake-moderate',
  severe: 'shake-severe',
};

// --- Particle count scaling helper ---
export function particleCount(intensity, min, max) {
  return Math.floor(min + intensity * (max - min));
}