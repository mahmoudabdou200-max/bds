import { useRef, useEffect, memo } from 'react';
import lottie from 'lottie-web';

// Pre-defined Lottie animations for each disaster type
const DISASTER_ANIMATIONS = {
  earthquake: '/quake.json',
  flood: '/flood.json',
  heat_wave: '/heat.json',
  sandstorm: '/sandstorm.json',
  blizzard: '/blizzard.json',
  typhoon: '/typhoon.json',
  bushfire: '/fire.json',
  tsunami: '/tsunami.json',
};

function BuildingLottie({ disasterType, damageClass, simPhase }) {
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || simPhase < 2 || !disasterType) {
      if (animationRef.current) {
        animationRef.current.destroy();
        animationRef.current = null;
      }
      return;
    }

    const animationPath = DISASTER_ANIMATIONS[disasterType];
    if (!animationPath) return;

    // Destroy previous animation
    if (animationRef.current) {
      animationRef.current.destroy();
    }

    // Load Lottie animation
    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: animationPath,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice',
      },
    });

    animationRef.current = anim;

    // Adjust speed based on damage
    if (damageClass === 'severe') {
      anim.setSpeed(1.5);
      anim.setDirection(1);
    } else if (damageClass === 'moderate') {
      anim.setSpeed(1.0);
    } else {
      anim.setSpeed(0.6);
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
        animationRef.current = null;
      }
    };
  }, [disasterType, damageClass, simPhase]);

  if (simPhase < 2 || !disasterType) return null;

  const opacity = damageClass ? 0.7 + (damageClass === 'severe' ? 0.3 : 0.1) : 0;

  return (
    <div
      ref={containerRef}
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

export default memo(BuildingLottie);
