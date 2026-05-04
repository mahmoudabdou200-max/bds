export const Factor = {
  HEAT: 'heat',
  COLD_SNOW: 'coldSnow',
  WIND: 'wind',
  QUAKE: 'quake',
  WATER: 'water',
  SUSTAINABILITY: 'sustainability',
  COST: 'cost',
};

export const FactorLabels = {
  [Factor.HEAT]: 'Heat Resistance',
  [Factor.COLD_SNOW]: 'Cold/Snow Resistance',
  [Factor.WIND]: 'Wind Resistance',
  [Factor.QUAKE]: 'Earthquake Resistance',
  [Factor.WATER]: 'Flood Resistance',
  [Factor.SUSTAINABILITY]: 'Sustainability',
  [Factor.COST]: 'Cost Efficiency',
};

export const Rating = {
  EXCELLENT: { key: 'excellent', min: 90, max: 100, stars: 5, color: '#4CAF50', label: 'Excellent', icon: '✓' },
  GOOD: { key: 'good', min: 70, max: 89, stars: 4, color: '#8BC34A', label: 'Good', icon: '👍' },
  ACCEPTABLE: { key: 'acceptable', min: 50, max: 69, stars: 3, color: '#FFC107', label: 'Acceptable', icon: '😐' },
  WEAK: { key: 'weak', min: 30, max: 49, stars: 2, color: '#FF9800', label: 'Weak', icon: '⚠' },
  FAILED: { key: 'failed', min: 0, max: 29, stars: 1, color: '#F44336', label: 'Failed', icon: '✗' },
};

export function getRating(score) {
  if (score >= 90) return Rating.EXCELLENT;
  if (score >= 70) return Rating.GOOD;
  if (score >= 50) return Rating.ACCEPTABLE;
  if (score >= 30) return Rating.WEAK;
  return Rating.FAILED;
}

export const SeasonLabels = {
  summer: 'Summer',
  winter: 'Winter',
};