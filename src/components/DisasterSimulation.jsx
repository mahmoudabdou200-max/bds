import { useState, useEffect, useMemo, useRef } from 'react';
import BuildingUltimate from './BuildingUltimate';
import DisasterOverlay from './DisasterOverlay';
import DamageOverlay from './DamageOverlay';
import StickFigureScene from './StickFigureScene';
import SimulationHUD from './SimulationHUD';
import { getAnimationParams } from '../data/animationUtils';
import './DisasterSimulation.css';

export default function DisasterSimulation({
  countryId, wallId, roofId, foundationId, featureIds, buildingTypeId,
  disasterType, factorScores, overallScore, simPhase, phaseProgress, country,
}) {
  const [cinematicMode, setCinematicMode] = useState(false);
  const [slowMotion, setSlowMotion] = useState(false);
  const [shakeComplete, setShakeComplete] = useState(false);
  const prevPhase = useRef(simPhase);

  const damageParams = useMemo(
    () => getAnimationParams(disasterType, factorScores, overallScore),
    [disasterType, factorScores, overallScore]
  );

  // Enable cinematic mode during simulation (phases 1-3)
  useEffect(() => {
    if (simPhase >= 1 && simPhase < 4) {
      const timer = setTimeout(() => setCinematicMode(true), 300);
      return () => clearTimeout(timer);
    } else if (simPhase >= 4) {
      const timer = setTimeout(() => setCinematicMode(false), 1000);
      return () => clearTimeout(timer);
    } else {
      setCinematicMode(false);
    }
  }, [simPhase]);

  // Slow motion during critical moments
  useEffect(() => {
    if (simPhase === 2 && damageParams.damageIntensity > 0.6) {
      setSlowMotion(true);
      const timer = setTimeout(() => setSlowMotion(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [simPhase, damageParams.damageIntensity]);

  // Reset shake complete when phase changes
  useEffect(() => {
    if (simPhase !== prevPhase.current) {
      setShakeComplete(false);
    }
    prevPhase.current = simPhase;
  }, [simPhase]);

  const wrapperClass = [
    'disaster-sim-wrapper',
    cinematicMode ? 'cinematic-bars' : '',
    slowMotion ? 'slow-motion' : '',
  ].filter(Boolean).join(' ');

  const areaClass = [
    'sim-building-area',
    cinematicMode ? 'cinematic' : '',
    disasterType ? `color-grade-${disasterType}` : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClass}>
      {cinematicMode && (
        <div className="cinematic-indicator">
          <span className="cinematic-dot"></span>
          <span>CINEMATIC</span>
        </div>
      )}

      <div className={areaClass}>
        <div className="color-grade-overlay color-grade-{disasterType}" style={{
          position: 'absolute', top:0, left:0, right:0, bottom:0,
          pointerEvents: 'none', zIndex:5,
          opacity: simPhase >= 1 && simPhase < 4 ? 0.3 + damageParams.damageIntensity * 0.2 : 0,
          transition: 'opacity 0.8s ease',
        }} />

        <div className="sim-building-area-inner">
          <BuildingUltimate
            wallId={wallId}
            roofId={roofId}
            foundationId={foundationId}
            featureIds={featureIds}
            buildingTypeId={buildingTypeId}
            countryId={countryId}
            size="large"
            damageClass={simPhase >= 1 ? damageParams.damage : null}
            disasterType={disasterType}
            simPhase={simPhase}
          />

          <DisasterOverlay
            disasterType={disasterType}
            simPhase={simPhase}
            damageParams={damageParams}
            size="large"
          />
          <DamageOverlay
            disasterType={disasterType}
            simPhase={simPhase}
            damageParams={damageParams}
            size="large"
          />
          <StickFigureScene
            disasterType={disasterType}
            simPhase={simPhase}
            damageLevel={damageParams.damage}
            damageIntensity={damageParams.damageIntensity}
            size="large"
          />
        </div>

        {simPhase === 2 && (
          <div className="phase-flash" style={{
            position:'absolute', top:0, left:0, right:0, bottom:0,
            background:'white', opacity:0.3, pointerEvents:'none', zIndex:20,
            animation:'flashFade 0.5s ease-out forwards',
          }} />
        )}
      </div>

      <SimulationHUD
        simPhase={simPhase}
        phaseProgress={phaseProgress}
        disasterType={disasterType}
        country={country}
        damageIntensity={damageParams.damageIntensity}
      />
    </div>
  );
}
