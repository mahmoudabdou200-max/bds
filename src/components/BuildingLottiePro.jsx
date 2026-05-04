import { useRef, useEffect, memo } from 'react';
import lottie from 'lottie-web';

// Professional Lottie animations - what Adobe After Effects exports
// These are broadcast-quality animations with proper bezier curves
const DISASTER_LOTTIE_FILES = {
  earthquake: '/earthquake_pro.json',
  flood: '/flood_pro.json',
  heat_wave: '/heat_pro.json',
  sandstorm: '/sandstorm_pro.json',
  blizzard: '/blizzard_pro.json',
  typhoon: '/typhoon_pro.json',
  bushfire: '/bushfire_pro.json',
  tsunami: '/tsunami_pro.json',
};

function BuildingLottiePro({ disasterType, damageClass, simPhase }) {
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const prevDamageRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || simPhase < 2 || !disasterType) {
      if (animationRef.current) {
        animationRef.current.destroy();
        animationRef.current = null;
      }
      return;
    }

    const animationPath = DISASTER_LOTTIE_FILES[disasterType];
    if (!animationPath) return;

    // Destroy previous animation
    if (animationRef.current) {
      animationRef.current.destroy();
    }

    // Load professional Lottie animation
    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: animationPath,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice',
        progressiveLoad: false,
      },
    });

    animationRef.current = anim;

    // Set speed and direction based on damage
    if (damageClass === 'severe') {
      anim.setSpeed(1.8); // Faster for severe
      anim.setDirection(1);
    } else if (damageClass === 'moderate') {
      anim.setSpeed(1.2);
    } else {
      anim.setSpeed(0.8);
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
        animationRef.current = null;
      }
    };
  }, [disasterType, damageClass, simPhase]);

  if (simPhase < 2 || !disasterType) return null;

  // Calculate opacity based on damage
  const opacity = damageClass 
    ? 0.7 + (damageClass === 'severe' ? 0.3 : damageClass === 'moderate' ? 0.2 : 0.1)
    : 0;

  return (
    <div
      ref={containerRef}
      className="lottie-container"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 10,
        pointerEvents: 'none',
        opacity: opacity,
      }}
    />
  );
}

export default memo(BuildingLottiePro);
