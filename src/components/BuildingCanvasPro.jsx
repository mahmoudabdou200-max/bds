import { useRef, useEffect, useCallback, memo } from 'react';

export const SVGW = 500, SVGH = 600, GROUND = 480;
export const WL_CONST = 100, WR_CONST = 400;
export const WW_CONST = WR_CONST - WL_CONST;
export const MX_CONST = (WL_CONST + WR_CONST) / 2;

// Building data
const wallStyles = {
  wall_concrete: { fill: '#B0BEC5' },
  wall_brick: { fill: '#EF9A9A' },
  wall_wood: { fill: '#BCAAA4' },
  wall_steel: { fill: '#90A4AE' },
  wall_recycled: { fill: '#C8E6C9' },
};

const roofStyles = {
  roof_metal: { fill: '#78909C', shape: 'sloped' },
  roof_tiled: { fill: '#FF8A65', shape: 'peaked' },
  roof_flat_concrete: { fill: '#B0BEC5', shape: 'flat' },
  roof_solar: { fill: '#42A5F5', shape: 'sloped' },
};

const buildingShapes = {
  house: { width: 300, height: 240, roofHeight: 70, doorW: 38, doorH: 70, winRows: 2, winCols: 2 },
  school: { width: 380, height: 320, roofHeight: 40, doorW: 50, doorH: 75, winRows: 3, winCols: 4 },
  hospital: { width: 400, height: 360, roofHeight: 30, doorW: 55, doorH: 80, winRows: 4, winCols: 4 },
  emergency_shelter: { width: 280, height: 180, roofHeight: 50, doorW: 35, doorH: 60, winRows: 1, winCols: 2 },
  farm_house: { width: 320, height: 220, roofHeight: 80, doorW: 36, doorH: 68, winRows: 2, winCols: 2 },
  office_building: { width: 350, height: 400, roofHeight: 25, doorW: 55, doorH: 80, winRows: 5, winCols: 5 },
};

// Particle class for physics-based effects
class Particle {
  constructor(x, y, vx, vy, size, color, life = 100) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.size = size;
    this.color = color;
    this.life = life;
    this.maxLife = life;
    this.gravity = 0.3;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.2;
  }

  update() {
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotSpeed;
    this.life--;
    return this.life > 0;
  }

  draw(ctx) {
    const alpha = this.life / this.maxLife;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }
}

// Building piece for destruction
class BuildingPiece {
  constructor(x, y, width, height, color, type = 'wall') {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.type = type;
    this.vx = (Math.random() - 0.5) * 8;
    this.vy = -Math.random() * 15;
    this.rotation = 0;
    this.rotSpeed = (Math.random() - 0.5) * 0.15;
    this.life = 300;
    this.gravity = 0.4;
  }

  update() {
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotSpeed;
    this.life--;
    return this.life > 0 && this.y < 600;
  }

  draw(ctx) {
    const alpha = Math.min(1, this.life / 50);
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }
}

function BuildingCanvasPro({ wallId, roofId, foundationId, featureIds, buildingTypeId, size = 'large', damageClass, disasterType, simPhase }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const piecesRef = useRef([]);
  const shakeRef = useRef({ x: 0, y: 0, rot: 0 });
  const animFrameRef = useRef(null);
  const buildingStateRef = useRef({});

  const ws = wallStyles[wallId] || wallStyles.wall_concrete;
  const rs = roofStyles[roofId] || roofStyles.roof_metal;
  const bs = buildingShapes[buildingTypeId] || buildingShapes.house;

  const s = size === 'large' ? 1 : size === 'medium' ? 0.75 : 0.55;
  const W = SVGW * s;
  const H = SVGH * s;
  const G = GROUND * s;
  const WL = WL_CONST * s;
  const WR = WR_CONST * s;
  const WW = WR - WL;
  const MX = MX_CONST * s;
  const WT = bs.height * s;
  const WT_TOP = G - WT;
  const ROOF_H = bs.roofHeight * s;

  // Initialize building state
  useEffect(() => {
    buildingStateRef.current = {
      wallColor: ws.fill,
      roofColor: rs.fill,
      roofShape: rs.shape,
      width: bs.width * s,
      height: bs.height * s,
      roofHeight: ROOF_H,
      doorW: bs.doorW * s,
      doorH: bs.doorH * s,
      intact: true,
    };
  }, [wallId, roofId, buildingTypeId]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const particles = particlesRef.current;
    const pieces = piecesRef.current;
    const shake = shakeRef.current;

    const animate = () => {
      ctx.clearRect(0, 0, W, H + 60 * s);

      // Draw sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, '#64B5F6');
      skyGrad.addColorStop(0.6, '#BBDEFB');
      skyGrad.addColorStop(1, '#E1F5FE');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H + 60 * s);

      // Draw ground
      const groundGrad = ctx.createLinearGradient(0, G, 0, H + 60 * s);
      groundGrad.addColorStop(0, '#66BB6A');
      groundGrad.addColorStop(1, '#388E3C');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, G, W, H + 60 * s - G);

      // Apply shake
      ctx.save();
      ctx.translate(shake.x, shake.y);
      ctx.rotate(shake.rot);

      const state = buildingStateRef.current;

      // Draw building pieces (if destroyed) or intact building
      if (pieces.length > 0) {
        // Draw destroyed pieces
        for (let i = pieces.length - 1; i >= 0; i--) {
          if (!pieces[i].update()) {
            pieces.splice(i, 1);
          } else {
            pieces[i].draw(ctx);
          }
        }
      } else if (state.intact) {
        // Draw intact building
        const wallW = state.width;
        const wallH = state.height;
        const wallX = MX - wallW / 2;
        const wallY = G - wallH;

        // Left wall
        ctx.fillStyle = state.wallColor;
        ctx.fillRect(wallX, wallY, wallW * 0.48, wallH);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2 * s;
        ctx.strokeRect(wallX, wallY, wallW * 0.48, wallH);

        // Right wall
        ctx.fillRect(MX + wallW * 0.02, wallY, wallW * 0.48, wallH);
        ctx.strokeRect(MX + wallW * 0.02, wallY, wallW * 0.48, wallH);

        // Door
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(MX - (state.doorW / 2), G - state.doorH, state.doorW, state.doorH);
        ctx.strokeStyle = '#333';
        ctx.strokeRect(MX - (state.doorW / 2), G - state.doorH, state.doorW, state.doorH);

        // Door handle
        ctx.fillStyle = '#FFD54F';
        ctx.beginPath();
        ctx.arc(MX + (state.doorW / 2 - 8 * s), G - state.doorH + 40 * s, 3 * s, 0, Math.PI * 2);
        ctx.fill();

        // Windows
        for (let row = 0; row < bs.winRows; row++) {
          for (let col = 0; col < bs.winCols; col++) {
            const winW = 34 * s;
            const winH = 40 * s;
            const gapX = WW / (bs.winCols + 1);
            const gapY = WT > 250 ? (WT - 80 * s) / (bs.winRows + 1) : WT / (bs.winRows + 1);
            const x = WL + gapX * (col + 1) - winW / 2;
            const y = WT_TOP + gapY * (row + 1) - winH / 2 + 15 * s;
            ctx.fillStyle = '#B3E5FC';
            ctx.fillRect(x, y, winW, winH);
            ctx.strokeStyle = '#333';
            ctx.strokeRect(x, y, winW, winH);
          }
        }

        // Roof
        ctx.fillStyle = state.roofColor;
        if (state.roofShape === 'sloped') {
          ctx.beginPath();
          ctx.moveTo(wallX - 10 * s, wallY);
          ctx.lineTo(MX, wallY - state.roofHeight);
          ctx.lineTo(wallX + wallW + 10 * s, wallY);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else if (state.roofShape === 'peaked') {
          ctx.beginPath();
          ctx.moveTo(wallX - 10 * s, wallY);
          ctx.lineTo(MX, wallY - state.roofHeight * 1.2);
          ctx.lineTo(MX, wallY - state.roofHeight * 0.8);
          ctx.lineTo(wallX + wallW + 10 * s, wallY);
          ctx.lineTo(MX, wallY - state.roofHeight * 0.8);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillRect(wallX - 10 * s, wallY - 15 * s, wallW + 20 * s, 15 * s);
          ctx.strokeRect(wallX - 10 * s, wallY - 15 * s, wallW + 20 * s, 15 * s);
        }
      }

      ctx.restore(); // Restore shake

      // Draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        if (!particles[i].update()) {
          particles.splice(i, 1);
        } else {
          particles[i].draw(ctx);
        }
      }

      // Draw impact stars and crash lines
      if (damageClass === 'severe' && simPhase === 2) {
        const time = Date.now() * 0.005;
        if (Math.sin(time) > 0.8) {
          // Impact star
          ctx.save();
          ctx.translate(MX, WT_TOP + 50 * s);
          ctx.rotate(time);
          ctx.strokeStyle = '#FFD600';
          ctx.lineWidth = 3;
          for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(0, -20);
            ctx.lineTo(0, 20);
            ctx.stroke();
            ctx.rotate(Math.PI / 4);
          }
          ctx.restore();
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [damageClass, disasterType, simPhase, wallId, roofId, buildingTypeId, s, W, H, G, WL, WR, WW, MX, WT, WT_TOP, ROOF_H, bs]);

  // Handle damage animations
  useEffect(() => {
    if (!damageClass || simPhase < 2) return;

    const particles = particlesRef.current;
    const pieces = piecesRef.current;
    const shake = shakeRef.current;

    // Generate debris particles
    const generateDebris = (count) => {
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(
          WL + Math.random() * WW,
          WT_TOP + Math.random() * WT,
          (Math.random() - 0.5) * 10,
          -Math.random() * 20,
          3 + Math.random() * 5,
          ['#78909C', '#90A4AE', '#B0BEC5'][Math.floor(Math.random() * 3)],
          80 + Math.random() * 40
        ));
      }
    };

    // Earthquake - building shakes and breaks
    if (disasterType === 'earthquake') {
      if (damageClass === 'severe') {
        // Violent shake
        let shakeCount = 0;
        const shakeInterval = setInterval(() => {
          shake.x = (Math.random() - 0.5) * 30 * s;
          shake.y = (Math.random() - 0.5) * 10 * s;
          shake.rot = (Math.random() - 0.5) * 0.1;
          if (shakeCount++ > 30) {
            clearInterval(shakeInterval);
            shake.x = 0; shake.y = 0; shake.rot = 0;
            // Crumble building
            buildingStateRef.current.intact = false;
            // Create wall pieces
            const wallW = (buildingShapes[buildingTypeId] || buildingShapes.house).width * s;
            pieces.push(
              new BuildingPiece(MX - wallW / 2, WT_TOP, wallW * 0.48, WT, ws.fill),
              new BuildingPiece(MX + wallW * 0.02, WT_TOP, wallW * 0.48, WT, ws.fill),
            );
            generateDebris(30);
          }
        }, 50);
        return () => clearInterval(shakeInterval);
      } else if (damageClass === 'moderate') {
        const shakeInterval = setInterval(() => {
          shake.x = (Math.random() - 0.5) * 15 * s;
          shake.rot = (Math.random() - 0.5) * 0.05;
        }, 100);
        setTimeout(() => clearInterval(shakeInterval), 3000);
        return () => clearInterval(shakeInterval);
      }
    }

    // Typhoon - building leans and roof flies off
    if (disasterType === 'typhoon' && damageClass === 'severe') {
      let lean = 0;
      const leanInterval = setInterval(() => {
        lean += 0.02;
        shake.rot = lean;
        if (lean > 0.3) {
          clearInterval(leanInterval);
          buildingStateRef.current.intact = false;
          pieces.push(
            new BuildingPiece(MX - bs.width * s * 0.25, WT_TOP, bs.width * s * 0.5, WT, ws.fill),
            new BuildingPiece(MX + bs.width * s * 0.25, WT_TOP, bs.width * s * 0.5, WT, ws.fill),
          );
          generateDebris(40);
        }
      }, 50);
      return () => clearInterval(leanInterval);
    }

    // Flood - building sways
    if (disasterType === 'flood' && damageClass) {
      let swayCount = 0;
      const swayInterval = setInterval(() => {
        shake.x = Math.sin(swayCount * 0.3) * 10 * s;
        swayCount++;
      }, 100);
      setTimeout(() => clearInterval(swayInterval), 5000);
      return () => clearInterval(swayInterval);
    }

    // Reset shake when phase changes
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

export default memo(BuildingCanvasPro);
