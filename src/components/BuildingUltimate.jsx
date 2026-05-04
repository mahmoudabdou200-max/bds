import { useRef, useEffect, memo } from 'react';

export const SVGW = 500, SVGH = 600, GROUND = 480;
export const WL_CONST = 100, WR_CONST = 400;
export const WW_CONST = WR_CONST - WL_CONST;
export const MX_CONST = (WL_CONST + WR_CONST) / 2;

// ULTRA particle
class UltraParticle {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;
    this.vx = options.vx || (Math.random() - 0.5) * 30;
    this.vy = options.vy || -Math.random() * 35;
    this.size = options.size || 3 + Math.random() * 20;
    this.color = options.color || '#78909C';
    this.life = options.life || 120 + Math.random() * 100;
    this.maxLife = this.life;
    this.gravity = options.gravity || 0.8;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.5;
    this.alpha = 1;
    this.glow = options.glow || false;
    this.type = options.type || 'rect';
  }

  update() {
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotSpeed;
    this.life--;
    this.size = Math.max(0, this.size - 0.05);
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
      ctx.shadowBlur = 25;
      ctx.shadowColor = this.color;
    }
    
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    if (this.type === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'ember') {
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 0.5, 0, Math.PI * 2);
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

function BuildingUltimate({ wallId, roofId, buildingTypeId, damageClass, disasterType, simPhase }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const piecesRef = useRef([]);
  const explosionsRef = useRef([]);
  const shockwavesRef = useRef([]);
  const buildingRef = useRef({ intact: true, x: 250, y: 60, shakeX: 0, shakeY: 0, shakeRot: 0 });
  const animFrameRef = useRef(null);
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

  // Always draw building (even before simulation)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const particles = particlesRef.current;
    const pieces = piecesRef.current;
    const explosions = explosionsRef.current;
    const shockwaves = shockwavesRef.current;
    const building = buildingRef.current;

    const W = 500, H = 600, G = 480;
    const WL = 100, WR = 400, MX = 250;
    const WT = bs.height;
    const WT_TOP = G - WT;
    const ROOF_H = bs.roofH;

    const drawBuilding = () => {
      if (!building.intact) return;
      
      const bx = MX + building.shakeX;
      const by = 60 + building.shakeY + WT;
      const rot = building.shakeRot || 0;
      
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(rot);

      // Walls with gradient
      const wallGrad = ctx.createLinearGradient(-bs.width/4, 0, bs.width/4, 0);
      wallGrad.addColorStop(0, wallColor);
      wallGrad.addColorStop(0.5, wallColor);
      wallGrad.addColorStop(1, '#8E8E8E');
      
      ctx.fillStyle = wallGrad;
      ctx.fillRect(-bs.width/2, -WT, bs.width * 0.48, WT);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.strokeRect(-bs.width/2, -WT, bs.width * 0.48, WT);

      ctx.fillRect(bs.width * 0.02, -WT, bs.width * 0.48, WT);
      ctx.strokeRect(bs.width * 0.02, -WT, bs.width * 0.48, WT);

      // Roof
      ctx.fillStyle = roofColor;
      ctx.beginPath();
      ctx.moveTo(-bs.width/2 - 10, -WT);
      ctx.lineTo(0, -WT - ROOF_H);
      ctx.lineTo(bs.width/2 + 10, -WT);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Door
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(-bs.doorW/2, -bs.doorH, bs.doorW, bs.doorH);
      ctx.strokeRect(-bs.doorW/2, -bs.doorH, bs.doorW, bs.doorH);

      // Door handle
      ctx.fillStyle = '#FFD54F';
      ctx.beginPath();
      ctx.arc(bs.doorW/2 - 8, -bs.doorH + 40, 3, 0, Math.PI * 2);
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
      ctx.globalAlpha = exp.life / exp.maxLife * 0.9;
      ctx.shadowBlur = 60;
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

      // Clear with sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H + 60);
      skyGrad.addColorStop(0, '#64B5F6');
      skyGrad.addColorStop(0.6, '#BBDEFB');
      skyGrad.addColorStop(1, '#E1F5FE');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 500, H + 60);

      // Ground
      ctx.fillStyle = '#66BB6A';
      ctx.fillRect(0, G, 500, H + 60 - G);

      // Draw building
      drawBuilding();

      // Draw pieces
      for (let i = pieces.length - 1; i >= 0; i--) {
        if (!pieces[i].update()) {
          pieces.splice(i, 1);
        } else {
          pieces[i].draw(ctx);
        }
      }

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
      if (disasterType === 'bushfire' && damageClass && Math.random() < 0.5) {
        particles.push(new UltraParticle(
          MX + (Math.random() - 0.5) * 200,
          WT_TOP + Math.random() * WT,
          {
            vy: -3 - Math.random() * 5,
            size: 2 + Math.random() * 6,
            color: ['#FF6F00', '#FFD600', '#FF8A65'][Math.floor(Math.random() * 3)],
            life: 40 + Math.random() * 50,
            gravity: -0.08,
            type: 'ember',
            glow: true,
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

  // Handle damage with 1000+ particles
  useEffect(() => {
    if (!damageClass || simPhase < 2) {
      buildingRef.current = { intact: true, x: 250, y: 60, shakeX: 0, shakeY: 0, shakeRot: 0 };
      return;
    }

    const particles = particlesRef.current;
    const pieces = piecesRef.current;
    const explosions = explosionsRef.current;
    const shockwaves = shockwavesRef.current;
    const building = buildingRef.current;
    const WT = bs.height;
    const WT_TOP = 480 - WT;
    const MX = 250;

    // SEVERE DAMAGE - Building EXPLODES
    if (damageClass === 'severe') {
      // Massive screen shake
      let shakeCount = 0;
      const shakeInterval = setInterval(() => {
        building.shakeX = (Math.random() - 0.5) * 50;
        building.shakeY = (Math.random() - 0.5) * 20;
        building.shakeRot = (Math.random() - 0.5) * 0.1;
        if (shakeCount++ > 60) {
          clearInterval(shakeInterval);
          building.shakeX = 0; building.shakeY = 0; building.shakeRot = 0;
          
          // BUILDING EXPLODES INTO 1000+ PIECES
          building.intact = false;
          
          // Massive debris explosion (1000+ particles)
          for (let i = 0; i < 1000; i++) {
            const angle = (Math.random()) * Math.PI * 2;
            const speed = 3 + Math.random() * 25;
            particles.push(new UltraParticle(
              MX + (Math.random() - 0.5) * 300,
              WT_TOP + Math.random() * WT,
              {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 15,
                size: 3 + Math.random() * 15,
                color: wallColor,
                life: 80 + Math.random() * 120,
                gravity: 0.7,
                type: Math.random() > 0.5 ? 'debris' : 'rect',
              }
            ));
          }
          
          // Fire explosions
          explosions.push({ x: MX, y: WT_TOP + WT / 2, color: '#FF6F00', life: 100, maxLife: 100 });
          explosions.push({ x: MX - 50, y: WT_TOP + WT / 3, color: '#FFD600', life: 80, maxLife: 80 });
          explosions.push({ x: MX + 50, y: WT_TOP + WT / 1.5, color: '#FF8A65', life: 90, maxLife: 90 });
          
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
        building.shakeX = (Math.random() - 0.5) * 25;
        building.shakeRot = (Math.random() - 0.5) * 0.04;
      }, 100);
      setTimeout(() => clearInterval(shakeInterval), 4000);
      
      // Some debris (100 particles)
      setTimeout(() => {
        for (let i = 0; i < 100; i++) {
          particles.push(new UltraParticle(
            MX + (Math.random() - 0.5) * 200,
            WT_TOP + WT * 0.8,
            {
              size: 5,
              color: wallColor,
              life: 60,
            }
          ));
        }
      }, 500);
      return () => clearInterval(shakeInterval);
    }

    // MINOR DAMAGE
    if (damageClass === 'minor') {
      const shakeInterval = setInterval(() => {
        building.shakeX = (Math.random() - 0.5) * 10;
      }, 150);
      setTimeout(() => clearInterval(shakeInterval), 2000);
    }

    // TYPHOON - Building leans and flies apart
    if (disasterType === 'typhoon' && damageClass === 'severe') {
      let lean = 0;
      const leanInterval = setInterval(() => {
        lean += 0.03;
        building.shakeRot = lean;
        building.shakeX = lean * 150;
        if (lean > 0.35) {
          clearInterval(leanInterval);
          building.intact = false;
          // Building flies apart
          for (let i = 0; i < 500; i++) {
            particles.push(new UltraParticle(
              MX + (Math.random() - 0.5) * 300,
              WT_TOP + Math.random() * WT,
              {
                vx: (Math.random() - 0.5) * 30,
                vy: -Math.random() * 20,
                size: 8 + Math.random() * 12,
                life: 100,
              }
            ));
          }
        }
      }, 50);
      return () => clearInterval(leanInterval);
    }

    return () => {
      building.shakeX = 0; building.shakeY = 0; building.shakeRot = 0;
    };
  }, [damageClass, disasterType, simPhase]);

  return (
    <div style={{ width: '100%', maxWidth: 500, margin: '0 auto', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={500}
        height={600}
        style={{ width: '100%', display: 'block', borderRadius: '8px' }}
      />
    </div>
  );
}

export default memo(BuildingUltimate);
