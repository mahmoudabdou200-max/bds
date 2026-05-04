import { Factor } from './constants';
import { countries } from './countries';
import { buildingTypes } from './buildingTypes';
import { wallMaterials, roofMaterials, foundationMaterials } from './materials';
import { features } from './features';

export function calculateResults(countryId, buildingTypeId, season, wallId, roofId, foundationId, featureIds) {
  const country = countries.find(c => c.id === countryId);
  const buildingType = buildingTypes.find(b => b.id === buildingTypeId);
  const wall = wallMaterials.find(w => w.id === wallId);
  const roof = roofMaterials.find(r => r.id === roofId);
  const foundation = foundationMaterials.find(f => f.id === foundationId);
  const selectedFeatures = features.filter(f => featureIds?.includes(f.id));

  if (!country || !buildingType || !wall || !roof || !foundation) {
    return { overallScore: 0, factorScores: {}, costScore: 0, totalCost: 0, budget: 0, warnings: [], hints: [] };
  }

  const scoringFactors = [Factor.HEAT, Factor.COLD_SNOW, Factor.WIND, Factor.QUAKE, Factor.WATER, Factor.SUSTAINABILITY];

  const factorScores = {};
  for (const factor of scoringFactors) {
    const wallProp = wall.properties?.[factor] || 0;
    const roofProp = roof.properties?.[factor] || 0;
    const foundProp = foundation.properties?.[factor] || 0;

    // Material base: average of 3 components, scale 0-3 (materials alone max at ~3/5)
    const materialBase = Math.min(3, (wallProp + roofProp + foundProp) / 3 * 3);

    // Feature effects: direct addition, scale 0-2 (features can add up to +2)
    let featureBonus = 0;
    for (const feat of selectedFeatures) {
      featureBonus += feat.effects?.[factor] || 0;
    }

    // Apply synergies: if two features work together, add bonus points
    for (const feat of selectedFeatures) {
      const synergies = feat.synergies || [];
      for (const syn of synergies) {
        if (syn.factor === factor && featureIds?.includes(syn.with)) {
          featureBonus += (syn.bonus || 0) / 5; // Scale synergy bonus
        }
      }
    }

    // Apply diminishes: if two features conflict, reduce the effect
    let diminishFactor = 1;
    for (const feat of selectedFeatures) {
      const diminishes = feat.diminishes || [];
      for (const dim of diminishes) {
        if (dim.factor === factor && featureIds?.includes(dim.with)) {
          diminishFactor *= (dim.reduction || 1);
        }
      }
    }

    featureBonus = featureBonus * diminishFactor;

    // Combine: material (0-3) + features (0-2) = 0-5 scale
    let score = Math.min(5, materialBase + Math.max(0, featureBonus));
    score = (score / 5) * 85; // Max 85 instead of 100 - makes survival harder

    // Apply building type difficulty multiplier
    const difficulty = buildingType.difficultyMultipliers?.[factor] || 1;
    score = Math.round(score * difficulty);

    // Clamp to 0-100
    score = Math.max(0, Math.min(100, score));

    factorScores[factor] = score;
  }

  const totalCost = (wall.cost || 0) + (roof.cost || 0) + (foundation.cost || 0) + selectedFeatures.reduce((sum, f) => sum + (f.cost || 0), 0);
  const budget = buildingType.budget || 1;
  const costScore = Math.max(0, Math.min(100, Math.round(100 - ((totalCost / budget - 0.5) * 100))));
  factorScores[Factor.COST] = costScore;

  let weightedSum = 0;
  let totalWeight = 0;
  const costWeight = 0.05;

  for (const factor of scoringFactors) {
    const weight = country.weights?.[factor] || 0;
    if (weight > 0) {
      weightedSum += factorScores[factor] * weight;
      totalWeight += weight;
    }
  }

  totalWeight += costWeight;
  weightedSum += costScore * costWeight;

  const overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

  // Warnings
  const warnings = [];
  if (factorScores[Factor.QUAKE] < 30) {
    warnings.push({ type: 'critical', factor: Factor.QUAKE, message: 'Collapse risk in earthquakes! Building won\'t withstand.', suggestion: 'Add reinforcement struts or choose wood for walls.' });
  }
  if (factorScores[Factor.WATER] < 30) {
    warnings.push({ type: 'critical', factor: Factor.WATER, message: 'Flood danger! Building not protected from water.', suggestion: 'Choose elevated foundation or sloped roof.' });
  }
  if (factorScores[Factor.HEAT] < 30) {
    warnings.push({ type: 'moderate', factor: Factor.HEAT, message: 'Building will suffer from extreme heat.', suggestion: 'Add thermal insulation or shading panels.' });
  }
  if (factorScores[Factor.COLD_SNOW] < 30 && country.challenges[Factor.COLD_SNOW] > 0) {
    warnings.push({ type: 'moderate', factor: Factor.COLD_SNOW, message: 'Roof may collapse under snow.', suggestion: 'Choose sloped roof instead of flat.' });
  }
  if (factorScores[Factor.WIND] < 30) {
    warnings.push({ type: 'moderate', factor: Factor.WIND, message: 'Building weak against strong winds.', suggestion: 'Add reinforcement struts or choose steel panels.' });
  }
  if (costScore < 30) {
    warnings.push({ type: 'info', factor: Factor.COST, message: `Way over budget! Cost: ${totalCost.toLocaleString()} / Budget: ${budget.toLocaleString()}`, suggestion: 'Choose cheaper materials.' });
  }

  if (buildingType.specialRequirements) {
    for (const req of buildingType.specialRequirements) {
      if (req.factor && factorScores[req.factor] < req.minScore) {
        warnings.push({ type: 'critical', factor: req.factor, message: `${req.label}: Score ${factorScores[req.factor]}/100 requires ${req.minScore}/100 minimum.`, suggestion: 'Improve your selection for this factor.' });
      }
    }
  }

  // Check feature conflicts
  for (const feat of selectedFeatures) {
    for (const conflictId of (feat.conflicts || [])) {
      if (featureIds?.includes(conflictId)) {
        const conflicting = features.find(f => f.id === conflictId);
        warnings.push({ type: 'moderate', factor: Factor.SUSTAINABILITY, message: `⚠️ ${feat.nameEn} conflicts with ${conflicting?.nameEn || conflictId}.`, suggestion: `Remove one to avoid penalties.` });
      }
    }
    // Check material conflicts
    for (const conflictId of (feat.conflicts || [])) {
      if (conflictId.startsWith('roof_') && roofId === conflictId) {
        warnings.push({ type: 'moderate', factor: Factor.SUSTAINABILITY, message: `⚠️ ${feat.nameEn} is incompatible with the chosen roof.`, suggestion: 'Choose a compatible roof type.' });
      }
    }
  }

  // Hints
  const hints = [];
  if (overallScore < 50) {
    const worstFactor = scoringFactors.reduce((worst, f) => factorScores[f] < factorScores[worst] ? f : worst, scoringFactors[0]);
    const hintsMap = {
      [Factor.HEAT]: 'Tip: Add thermal insulation or shading panels to improve heat resistance.',
      [Factor.COLD_SNOW]: 'Tip: Choose sloped roof and thermal insulation for cold resistance.',
      [Factor.WIND]: 'Tip: Add reinforcement struts or choose steel panels for walls.',
      [Factor.QUAKE]: 'Tip: Choose wood for walls and deep concrete foundation with struts.',
      [Factor.WATER]: 'Tip: Choose elevated foundation and sloped roof with water tank.',
      [Factor.SUSTAINABILITY]: 'Tip: Choose recycled materials and solar panels.',
    };
    if (hintsMap[worstFactor]) hints.push(hintsMap[worstFactor]);
  }

  return {
    overallScore,
    factorScores,
    costScore,
    totalCost,
    budget,
    warnings,
    hints,
  };
}

export function generateComments(factorScores) {
  const comments = {};
  const templates = {
    [Factor.HEAT]: {
      high: 'Excellent! Your materials handle high heat well.',
      mid: 'Acceptable. You can improve heat resistance.',
      low: 'Weak. Building will suffer in hot climate.',
      critical: 'Danger! Heat could make building uninhabitable.',
    },
    [Factor.COLD_SNOW]: {
      high: 'Excellent! Building well protected from cold and snow.',
      mid: 'Acceptable. Try adding thermal insulation.',
      low: 'Weak. Roof may not handle snow accumulation.',
      critical: 'Danger! Roof at risk of collapse from snow.',
    },
    [Factor.WIND]: {
      high: 'Excellent! Building withstands strongest winds.',
      mid: 'Acceptable. Add reinforcement struts to improve.',
      low: 'Weak. Strong winds may damage roof and walls.',
      critical: 'Danger! Building at risk of major wind damage.',
    },
    [Factor.QUAKE]: {
      high: 'Excellent! Building designed to withstand earthquakes.',
      mid: 'Acceptable. Add reinforcement struts for safety.',
      low: 'Weak. Building weak in earthquakes.',
      critical: 'Danger! Building will collapse in earthquake.',
    },
    [Factor.WATER]: {
      high: 'Excellent! Building protected from water and floods.',
      mid: 'Acceptable. Consider water collection tank.',
      low: 'Weak. Building at risk of water damage.',
      critical: 'Danger! Building not protected from floods.',
    },
    [Factor.SUSTAINABILITY]: {
      high: 'Excellent! Sustainable and eco-friendly design.',
      mid: 'Acceptable. Add solar panels to improve.',
      low: 'Weak. High environmental footprint.',
      critical: 'Very low. Building not sustainable.',
    },
  };

  for (const [factor, score] of Object.entries(factorScores)) {
    if (factor === Factor.COST) continue;
    const tmpl = templates[factor];
    if (!tmpl) { comments[factor] = ''; continue; }
    if (score >= 80) comments[factor] = tmpl.high;
    else if (score >= 50) comments[factor] = tmpl.mid;
    else if (score >= 30) comments[factor] = tmpl.low;
    else comments[factor] = tmpl.critical;
  }

  return comments;
}
