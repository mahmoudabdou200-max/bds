import { useRef, useEffect, useCallback, memo } from 'react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import './BuildingCanvas.css';

gsap.registerPlugin(CustomEase);

export const SVGW = 500, SVGH = 600, GROUND = 480;
export const WL_CONST = 100, WR_CONST = 400;
export const WW_CONST = WR_CONST - WL_CONST;
export const MX_CONST = (WL_CONST + WR_CONST) / 2;

// Building data
const wallStyles = {
  wall_concrete: { base: '#B0BEC5', dark: '#90A4AE', line: '#78909C' },
  wall_brick: { base: '#EF9A9A', dark: '#E57373', line: '#C62828' },
  wall_wood: { base: '#BCAAA4', dark: '#A1887F', line: '#6D4C41' },
  wall_steel: { base: '#90A4AE', dark: '#78909C', line: '#455A64' },
  wall_recycled: { base: '#C8E6C9', dark: '#A5D6A7', line: '#66BB6A' },
};

const roofStyles = {
  roof_metal: { fill: '#78909C', line: '#546E7A' },
  roof_tiled: { fill: '#FF8A65', line: '#E64A19' },
  roof_flat_concrete: { fill: '#B0BEC5', line: '#78909C' },
  roof_solar: { fill: '#42A5F5', line: '#1565C0' },
};

const buildingShapes = {
  house: { width: 300, height: 240, roofH: 70, doorW: 38, doorH: 70 },
  school: { width: 380, height: 320, roofH: 40, doorW: 50, doorH: 75 },
  hospital: { width: 400, height: 360, roofH: 30, doorW: 55, doorH: 80 },
  emergency_shelter: { width: 280, height: 180, roofH: 50, doorW: 35, doorH: 60 },
  farm_house: { width: 320, height: 220, roofH: 80, doorW: 36, doorH: 68 },
  office_building: { width: 350, height: 400, roofH: 25, doorW: 55, doorH: 80 },
};

// MASSIVE Particle class
class VisualParticle {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;
    this.vx = options.vx || (Math.random() - 0.5) * 20;
    this.vy = options.vy || -Math.random() * 25;
    this.size = options.size || 3 + Math.random() * 12;
    this.color = options.color || '#78909C';
    this.life = options.life || 80 + Math.random() * 60;
    this.maxLife = this.life;
    this.gravity = options.gravity || 0.5;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.3;
    this.alpha = 1;
    this.shrink = options.shrink || 0.03;
    this.type = options.type || 'rect'; // 'rect', 'circle', 'debris'
    this.glow = options.glow || false;
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
    
    if (this.glow) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = this.color;
    }
    
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    if (this.type === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'debris') {
      ctx.fillRect(-this.size * 2, -this.size, this.size * 4, this.size * 2);
      ctx.strokeRect(-this.size * 2, -this.size, this.size * 4, this.size * 2);
    } else {
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    }
    ctx.restore();
  }
}

// Create MASSIVE explosion
function createMassiveExplosion(x, y, count, color, options = {}) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.random()) * Math.PI * 2;
    const speed = 5 + Math.random() * 20;
    particles.push(new VisualParticle(x, y, {
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 10,
      size: options.size || 5 + Math.random() * 15,
      color: color || '#78909C',
      life: 60 + Math.random() * 100,
      gravity: 0.6,
      type: options.type || 'debris',
      glow: options.glow || false,
    }));
  }
  return particles;
}

function BuildingUltraVisual({ wallId, roofId, buildingTypeId, damageClass, disasterType, simPhase }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const explosionsRef = useRef([]);
  const shockwavesRef = useRef([]);
  const buildingStateRef = useRef({});
  const animFrameRef = useRef(null);
  const screenShakeRef = useRef({ x: 0, y: 0, intensity: 0 });
  const timeRef = useRef(0);

  const ws = wallStyles[wallId] || wallStyles.wall_concrete;
  const rs = roofStyles[roofId] || roofStyles.roof_metal;
  const bs = buildingShapes[buildingTypeId] || buildingShapes.house;

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
      wallColor: ws.base,
      wallDark: ws.dark,
      roofColor: rs.fill,
      intact: true,
    };
  }, [wallId, roofId, buildingTypeId]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const particles = particlesRef.current;
    const explosions = explosionsRef.current;
    const shockwaves = shockwavesRef.current;
    const shake = screenShakeRef.current;

    const drawBuilding = (state, shakeIntensity = 0) => {
      if (!state.intact) return;

      const bx = state.x + shake.x;
      const by = state.y + shake.y;

      ctx.save();
      ctx.translate(bx, by + state.height);
      ctx.rotate(shake.rot || 0);

      // Left wall with gradient
      const wallGrad = ctx.createLinearGradient(-state.width / 4, 0, state.width / 4, 0);
      wallGrad.addColorStop(0, state.wallDark);
      wallGrad.addColorStop(0.5, state.wallColor);
      wallGrad.addColorStop(1, state.wallDark);
      
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

    const drawExplosion = (exp) => {
      ctx.save();
      ctx.translate(exp.x, exp.y);
      ctx.globalAlpha = exp.life / exp.maxLife * 0.8;
      ctx.shadowBlur = 30;
      ctx.shadowColor = exp.color;
      ctx.fillStyle = exp.color;
      ctx.beginPath();
      ctx.arc(0, 0, (exp.maxLife - exp.life) * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawShockwave = (sw) => {
      ctx.save();
      ctx.translate(sw.x, sw.y);
      ctx.globalAlpha = sw.alpha;
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = sw.width;
      ctx.shadowBlur = 20;
      ctx.shadowColor = sw.color;
      ctx.beginPath();
      ctx.arc(0, 0, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.016;

      // Clear with dramatic sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H + 60 * s);
      const time = timeRef.current;
      
      // Dynamic sky color based on disaster
      if (disasterType === 'bushfire' && damageClass) {
        skyGrad.addColorStop(0, `rgba(255, ${100 + Math.sin(time) * 30}, 0, 0.3)`);
        skyGrad.addColorStop(0.6, `rgba(255, ${150 + Math.sin(time * 0.5) * 30}, 100, 0.4)`);
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
      const shakeIntensity = damageClass ? (damageClass === 'severe' ? 1 : damageClass === 'moderate' ? 0.6 : 0.3) : 0;
      drawBuilding(state, shakeIntensity);

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
          drawExplosion(exp);
        }
      }

      // Add fire embers for bushfire
      if (disasterType === 'bushfire' && damageClass && Math.random() < 0.4) {
        particles.push(new VisualParticle(
          MX + (Math.random() - 0.5) * WW,
          WT_TOP + Math.random() * WT,
          {
            vy: -3 - Math.random() * 5,
            size: 2 + Math.random() * 5,
            color: ['#FF6F00', '#FFD600', '#FF8A65'][Math.floor(Math.random() * 3)],
            life: 40 + Math.random() * 40,
            gravity: -0.05,
            type: 'circle',
            glow: true,
          }
        ));
      }

      // Add smoke for fire
      if (disasterType === 'bushfire' && damageClass && Math.random() < 0.1) {
        explosions.push({
          x: MX + (Math.random() - 0.5) * 100,
          y: WT_TOP - 50,
          color: '#757575',
          life: 60,
          maxLife: 60,
        });
      }
    };

    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [wallId, roofId, buildingTypeId, damageClass, disasterType, simPhase]);

  // Handle damage with GSAP + massive effects
  useEffect(() => {
    if (!damageClass || simPhase < 2) {
      screenShakeRef.current = { x: 0, y: 0, rot: 0, intensity: 0 };
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
        shake.x = (Math.random() - 0.5) * 40;
        shake.y = (Math.random() - 0.5) * 15;
        shake.rot = (Math.random() - 0.5) * 0.08;
        if (shakeCount++ > 40) {
          clearInterval(shakeInterval);
          shake.x = 0; shake.y = 0; shake.rot = 0;
          
          // BUILDING EXPLODES INTO PIECES
          state.intact = false;
          
          // Massive debris explosion (100+ particles)
          const debris = createMassiveExplosion(MX, WT_TOP + WT / 2, 100, ws.base, { size: 10, type: 'debris' });
          particles.push(...debris);
          
          // Fire explosion
          explosions.push({ x: MX, y: WT_TOP + WT / 2, color: '#FF6F00', life: 80, maxLife: 80 });
          explosions.push({ x: MX - 50, y: WT_TOP + WT / 3, color: '#FFD600', life: 60, maxLife: 60 });
          explosions.push({ x: MX + 50, y: WT_TOP + WT / 1.5, color: '#FF8A65', life: 70, maxLife: 70 });
          
          // Shockwaves
          shockwaves.push({ x: MX, y: WT_TOP + WT / 2, radius: 10, speed: 12, alpha: 1, color: '#FFD600', width: 8 });
          setTimeout(() => {
            shockwaves.push({ x: MX, y: WT_TOP + WT / 2, radius: 20, speed: 10, alpha: 0.8, color: '#FF6F00', width: 6 });
          }, 200);
          
          // More debris waves
          setTimeout(() => {
            const debris2 = createMassiveExplosion(MX - 80, WT_TOP + WT / 2, 50, ws.dark, { size: 8 });
            particles.push(...debris2);
          }, 300);
          setTimeout(() => {
            const debris3 = createMassiveExplosion(MX + 80, WT_TOP + WT / 2, 50, '#90A4AE', { size: 8 });
            particles.push(...debris3);
          }, 600);
        }
      }, 50);
      return () => clearInterval(shakeInterval);
    }

    // MODERATE DAMAGE
    if (damageClass === 'moderate') {
      const shakeInterval = setInterval(() => {
        shake.x = (Math.random() - 0.5) * 20;
        shake.rot = (Math.random() - 0.5) * 0.03;
      }, 100);
      setTimeout(() => clearInterval(shakeInterval), 3000);
      
      // Some debris
      setTimeout(() => {
        const debris = createMassiveExplosion(MX, WT_TOP + WT * 0.8, 30, ws.base, { size: 5 });
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
        lean += 0.02;
        shake.rot = lean;
        shake.x = lean * 100;
        if (lean > 0.3) {
          clearInterval(leanInterval);
          state.intact = false;
          const leftDebris = createMassiveExplosion(WL + WW * 0.25, WT_TOP + WT / 2, 60, ws.base, { size: 12, type: 'debris' });
          const rightDebris = createMassiveExplosion(WL + WW * 0.75, WT_TOP + WT / 2, 60, ws.base, { size: 12, type: 'debris' });
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

export default memo(BuildingUltraVisual);
