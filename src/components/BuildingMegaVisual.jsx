import { useRef, useEffect, memo } from 'react';

export const SVGW = 500, SVGH = 600, GROUND = 480;
export const WL_CONST = 100, WR_CONST = 400;
export const WW_CONST = WR_CONST - WL_CONST;
export const MX_CONST = (WL_CONST + WR_CONST) / 2;

// Ultra Visual Particle System
class UltraParticle {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;
    this.vx = options.vx || (Math.random() - 0.5) * 25;
    this.vy = options.vy || -Math.random() * 30;
    this.size = options.size || 2 + Math.random() * 15;
    this.color = options.color || '#78909C';
    this.life = options.life || 100 + Math.random() * 80;
    this.maxLife = this.life;
    this.gravity = options.gravity || 0.6;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.4;
    this.shrink = options.shrink || 0.04;
    this.type = options.type || 'debris'; // 'debris', 'ember', 'smoke'
    this.alpha = 1;
  }

  update() {
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotSpeed;
    this.life--;
    this.size = Math.max(0, this.size - this.shrink);
    this.alpha = Math.max(0, this.life / this.maxLife);
    return this.life > 0 && this.size > 0;
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = this.alpha;
    
    if (this.type === 'ember') {
      ctx.shadowBlur = 20;
      ctx.shadowColor = this.color;
    } else if (this.type === 'smoke') {
      ctx.shadowBlur = 30;
      ctx.shadowColor = 'rgba(117,117,117,0.5)';
    }
    
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.8);
    ctx.restore();
  }
}

// Create MASSIVE explosion (200+ particles)
function createMegaExplosion(x, y, count, color, options = {}) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.random()) * Math.PI * 2;
    const speed = 3 + Math.random() * 25;
    particles.push(new UltraParticle(x, y, {
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 15,
      size: options.size || 4 + Math.random() * 12,
      color: color || '#78909C',
      life: 50 + Math.random() * 100,
      gravity: 0.5,
      type: options.type || 'debris',
    }));
  }
  return particles;
}

function BuildingMegaVisual({ wallId, roofId, buildingTypeId, damageClass, disasterType, simPhase }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const explosionsRef = useRef([]);
  const shockwavesRef = useRef([]);
  const buildingStateRef = useRef({});
  const animFrameRef = useRef(null);
  const screenShakeRef = useRef({ x: 0, y: 0, rot: 0 });
  const timeRef = useRef(0);

  // Building data
  const wallColor = {
    wall_concrete: '#B0BEC5',
    wall_brick: '#EF9A9A',
    wall_wood: '#BCAAA4',
    wall_steel: '#90A4AE',
    wall_recycled: '#C8E6C9',
  }[wallId] || '#B0BEC5';

  const roofColor = {
    roof_metal: '#78909C',
    roof_tiled: '#FF8A65',
    roof_flat_concrete: '#B0BEC5',
    roof_solar: '#42A5F5',
  }[roofId] || '#78909C';

  const bs = {
    house: { width: 300, height: 240, roofH: 70, doorW: 38, doorH: 70 },
    school: { width: 380, height: 320, roofH: 40, doorW: 50, doorH: 75 },
    hospital: { width: 400, height: 360, roofH: 30, doorW: 55, doorH: 80 },
    emergency_shelter: { width: 280, height: 180, roofH: 50, doorW: 35, doorH: 60 },
    farm_house: { width: 320, height: 220, roofH: 80, doorW: 36, doorH: 68 },
    office_building: { width: 350, height: 400, roofH: 25, doorW: 55, doorH: 80 },
  }[buildingTypeId] || { width: 300, height: 240, roofH: 70, doorW: 38, doorH: 70 };

  const s = 1;
  const W = SVGW * s;
  const H = SVGH * s;
  const G = GROUND * s;
  const WL = WL_CONST * s;
  const WR = WR_CONST * s;
  const WW = WR - WL;
  const MX = MX_CONST * s;
  const WT = bs.height * s;
  const WT_TOP = G - WT;
  const ROOF_H = bs.roofH * s;

  // Initialize building
  useEffect(() => {
    buildingStateRef.current = {
      x: WL + WW / 2,
      y: WT_TOP,
      width: bs.width * s,
      height: WT,
      roofHeight: ROOF_H,
      wallColor: wallColor,
      roofColor: roofColor,
      intact: true,
    };
  }, [wallId, roofId, buildingTypeId]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || simPhase < 2) return;

    const ctx = canvas.getContext('2d');
    const particles = particlesRef.current;
    const explosions = explosionsRef.current;
    const shockwaves = shockwavesRef.current;
    const shake = screenShakeRef.current;

    const drawBuilding = (state) => {
      if (!state.intact) return;
      
      ctx.save();
      ctx.translate(state.x + shake.x, state.y + shake.y + state.height);
      ctx.rotate(shake.rot || 0);

      // Left wall with gradient
      const wallGrad = ctx.createLinearGradient(-state.width / 4, 0, state.width / 4, 0);
      wallGrad.addColorStop(0, state.wallDark || '#90A4AE');
      wallGrad.addColorStop(0.5, state.wallColor);
      wallGrad.addColorStop(1, state.wallDark || '#90A4AE');
      
      ctx.fillStyle = wallGrad;
      ctx.fillRect(-state.width / 2, -state.height, state.width * 0.48, state.height);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.strokeRect(-state.width / 2, -state.height, state.width * 0.48, state.height);

      // Right wall
      ctx.fillRect(state.width * 0.02, -state.height, state.width * 0.48, state.height);
      ctx.strokeRect(state.width * 0.02, -state.height, state.width * 0.48, state.height);

      // Roof
      ctx.fillStyle = state.roofColor;
      ctx.beginPath();
      ctx.moveTo(-state.width / 2 - 10, -state.height);
      ctx.lineTo(0, -state.height - state.roofHeight);
      ctx.lineTo(state.width / 2 + 10, -state.height);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Door
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(-bs.doorW / 2, -bs.doorH, bs.doorW, bs.doorH);
      ctx.strokeRect(-bs.doorW / 2, -bs.doorH, bs.doorW, bs.doorH);

      // Door handle
      ctx.fillStyle = '#FFD54F';
      ctx.beginPath();
      ctx.arc(bs.doorW / 2 - 8, -bs.doorH + 40, 3, 0, Math.PI * 2);
      ctx.fill();

      // Windows
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 2; col++) {
          const wx = -60 + col * 120;
          const wy = -180 + row * 80;
          ctx.fillStyle = '#B3E5FC';
          ctx.fillRect(wx, wy, 34, 40);
          ctx.strokeRect(wx, wy, 34, 40);
        }
      }

      ctx.restore();
    };

    const drawShockwave = (sw) => {
      ctx.save();
      ctx.translate(sw.x, sw.y);
      ctx.globalAlpha = sw.alpha;
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = sw.width;
      ctx.shadowBlur = 30;
      ctx.shadowColor = sw.color;
      ctx.beginPath();
      ctx.arc(0, 0, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.016;

      // Clear with dynamic sky
      const time = timeRef.current;
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H + 60 * s);
      
      // Dynamic sky color based on disaster
      if (disasterType === 'bushfire' && damageClass) {
        skyGrad.addColorStop(0, `rgba(255, ${100 + Math.sin(time) * 50}, 0, 0.4)`);
        skyGrad.addColorStop(0.6, `rgba(255, ${150 + Math.sin(time * 0.5) * 50}, 100, 0.5)`);
      } else if (disasterType === 'typhoon' && damageClass) {
        skyGrad.addColorStop(0, '#2C3E50');
        skyGrad.addColorStop(0.6, '#34495E');
      } else {
        skyGrad.addColorStop(0, '#64B5F6');
        skyGrad.addColorStop(0.6, '#BBDEFB');
      }
      skyGrad.addColorStop(1, '#E1F5FE');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H + 60 * s);

      // Ground
      const groundGrad = ctx.createLinearGradient(0, G, 0, H + 60 * s);
      groundGrad.addColorStop(0, '#66BB6A');
      groundGrad.addColorStop(1, '#388E3C');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, G, W, H + 60 * s - G);

      // Apply screen shake
      ctx.save();
      ctx.translate(shake.x, shake.y);

      // Draw building
      const state = buildingStateRef.current;
      drawBuilding(state);

      ctx.restore(); // Restore shake

      // Draw shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += sw.speed;
        sw.alpha -= 0.015;
        if (sw.alpha <= 0) {
          shockwaves.splice(i, 1);
        } else {
          drawShockwave(sw);
        }
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        if (!particles[i].update()) {
          particles.splice(i, 1);
        } else {
          particles[i].draw(ctx);
        }
      }

      // Update and draw explosions
      for (let i = explosions.length - 1; i >= 0; i--) {
        const exp = explosions[i];
        exp.life--;
        if (exp.life <= 0) {
          explosions.splice(i, 1);
        } else {
          // Draw explosion flash
          ctx.save();
          ctx.translate(exp.x, exp.y);
          ctx.globalAlpha = (exp.life / exp.maxLife) * 0.9;
          ctx.shadowBlur = 60;
          ctx.shadowColor = exp.color;
          ctx.fillStyle = exp.color;
          ctx.beginPath();
          ctx.arc(0, 0, (exp.maxLife - exp.life) * 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Add fire embers for bushfire
      if (disasterType === 'bushfire' && damageClass && Math.random() < 0.5) {
        particles.push(new UltraParticle(
          MX + (Math.random() - 0.5) * WW,
          WT_TOP + Math.random() * WT,
          {
            vy: -3 - Math.random() * 5,
            size: 2 + Math.random() * 6,
            color: ['#FF6F00', '#FFD600', '#FF8A65'][Math.floor(Math.random() * 3)],
            life: 30 + Math.random() * 50,
            gravity: -0.08,
            type: 'ember',
          }
        ));
      }

      // Add smoke for fire
      if (disasterType === 'bushfire' && damageClass && Math.random() < 0.15) {
        explosions.push({
          x: MX + (Math.random() - 0.5) * 100,
          y: WT_TOP - 50,
          color: '#757575',
          life: 80,
          maxLife: 80,
        });
      }
    };

    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [wallId, roofId, buildingTypeId, damageClass, disasterType, simPhase]);

  // Handle damage with 200+ particles
  useEffect(() => {
    if (!damageClass || simPhase < 2) {
      screenShakeRef.current = { x: 0, y: 0, rot: 0 };
      return;
    }

    const particles = particlesRef.current;
    const explosions = explosionsRef.current;
    const shockwaves = shockwavesRef.current;
    const shake = screenShakeRef.current;
    const state = buildingStateRef.current;

    // SEVERE DAMAGE - Building EXPLODES
    if (damageClass === 'severe') {
      // Massive screen shake
      let shakeCount = 0;
      const shakeInterval = setInterval(() => {
        shake.x = (Math.random() - 0.5) * 50;
        shake.y = (Math.random() - 0.5) * 20;
        shake.rot = (Math.random() - 0.5) * 0.1;
        if (shakeCount++ > 50) {
          clearInterval(shakeInterval);
          shake.x = 0; shake.y = 0; shake.rot = 0;
          
          // BUILDING EXPLODES INTO 200+ PIECES
          state.intact = false;
          
          // Mega explosion (200+ particles)
          const debris1 = createMegaExplosion(MX, WT_TOP + WT / 2, 100, wallColor, { size: 12, type: 'debris' });
          const debris2 = createMegaExplosion(MX - 50, WT_TOP + WT / 3, 80, '#90A4AE', { size: 10 });
          const debris3 = createMegaExplosion(MX + 50, WT_TOP + WT / 1.5, 80, '#B0BEC5', { size: 10 });
          particles.push(...debris1, ...debris2, ...debris3);
          
          // Fire explosions
          explosions.push({ x: MX, y: WT_TOP + WT / 2, color: '#FF6F00', life: 100, maxLife: 100 });
          explosions.push({ x: MX - 30, y: WT_TOP + WT / 3, color: '#FFD600', life: 80, maxLife: 80 });
          explosions.push({ x: MX + 30, y: WT_TOP + WT / 1.5, color: '#FF8A65', life: 90, maxLife: 90 });
          
          // Shockwaves
          shockwaves.push({ x: MX, y: WT_TOP + WT / 2, radius: 10, speed: 15, alpha: 1, color: '#FFD600', width: 10 });
          setTimeout(() => {
            shockwaves.push({ x: MX, y: WT_TOP + WT / 2, radius: 20, speed: 12, alpha: 0.8, color: '#FF6F00', width: 8 });
          }, 200);
        }
      }, 30);
      return () => clearInterval(shakeInterval);
    }

    // MODERATE DAMAGE
    if (damageClass === 'moderate') {
      const shakeInterval = setInterval(() => {
        shake.x = (Math.random() - 0.5) * 25;
        shake.rot = (Math.random() - 0.5) * 0.04;
      }, 100);
      setTimeout(() => clearInterval(shakeInterval), 4000);
      
      // Some debris (50 particles)
      setTimeout(() => {
        const debris = createMegaExplosion(MX, WT_TOP + WT * 0.8, 50, wallColor, { size: 6 });
        particles.push(...debris);
      }, 500);
      return () => clearInterval(shakeInterval);
    }

    // MINOR DAMAGE
    if (damageClass === 'minor') {
      const shakeInterval = setInterval(() => {
        shake.x = (Math.random() - 0.5) * 10;
      }, 150);
      setTimeout(() => clearInterval(shakeInterval), 2000);
    }

    // TYPHOON - Building leans and flies apart
    if (disasterType === 'typhoon' && damageClass === 'severe') {
      let lean = 0;
      const leanInterval = setInterval(() => {
        lean += 0.03;
        shake.rot = lean;
        shake.x = lean * 150;
        if (lean > 0.35) {
          clearInterval(leanInterval);
          state.intact = false;
          const leftDebris = createMegaExplosion(WL + WW * 0.25, WT_TOP + WT / 2, 80, wallColor, { size: 15, type: 'debris' });
          const rightDebris = createMegaExplosion(WL + WW * 0.75, WT_TOP + WT / 2, 80, wallColor, { size: 15, type: 'debris' });
          particles.push(...leftDebris, ...rightDebris);
        }
      }, 50);
      return () => clearInterval(leanInterval);
    }

    return () => {
      shake.x = 0; shake.y = 0; shake.rot = 0;
    };
  }, [damageClass, disasterType, simPhase]);

  return (
    <div style={{ width: '100%', maxWidth: W, margin: '0 auto', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={W}
        height={H + 60 * s}
        style={{ width: '100%', display: 'block', borderRadius: '8px' }}
      />
    </div>
  );
}

export default memo(BuildingMegaVisual);
