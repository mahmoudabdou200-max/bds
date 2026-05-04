import { useRef, useEffect, memo } from 'react';

function BuildingVideo({ disasterType, damageClass, simPhase }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || simPhase < 2 || !damageClass) return;

    video.playbackRate = damageClass === 'severe' ? 1.5 : 1.0;
    
    if (damageClass === 'severe') {
      video.style.opacity = '0.8';
    }

    video.play().catch(() => {});
  }, [damageClass, simPhase]);

  if (simPhase < 2) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, width: '100%', height: '100%',
      zIndex: 10, pointerEvents: 'none',
      opacity: damageClass ? 0.7 + (damageClass === 'severe' ? 0.3 : 0.1) : 0,
    }}>
      <video
        ref={videoRef}
        src="/disaster.mp4"
        loop
        muted
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  );
}

export default memo(BuildingVideo);
