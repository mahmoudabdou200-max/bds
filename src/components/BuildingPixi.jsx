import { useRef, useEffect, memo } from 'react';
import * as PIXI from 'pixi.js';

export const SVGW = 500, SVGH = 600, GROUND = 480;
export const WL_CONST = 100, WR_CONST = 400;
export const WW_CONST = WR_CONST - WL_CONST;
export const MX_CONST = (WL_CONST + WR_CONST) / 2;

// Building data
const wallStyles = {
  wall_concrete: 0xB0BEC5,
  wall_brick: 0xEF9A9A,
  wall_wood: 0xBCAAA4,
  wall_steel: 0x90A4AE,
  wall_recycled: 0xC8E6C9,
};

const roofStyles = {
  roof_metal: { color: 0x78909C, shape: 'sloped' },
  roof_tiled: { color: 0xFF8A65, shape: 'peaked' },
  roof_flat_concrete: { color: 0xB0BEC5, shape: 'flat' },
  roof_solar: { color: 0x42A5F5, shape: 'sloped' },
};

const buildingShapes = {
  house: { width: 300, height: 240, roofHeight: 70, doorW: 38, doorH: 70 },
  school: { width: 380, height: 320, roofHeight: 40, doorW: 50, doorH: 75 },
  hospital: { width: 400, height: 360, roofHeight: 30, doorW: 55, doorH: 80 },
  emergency_shelter: { width: 280, height: 180, roofHeight: 50, doorW: 35, doorH: 60 },
  farm_house: { width: 320, height: 220, roofHeight: 80, doorW: 36, doorH: 68 },
  office_building: { width: 350, height: 400, roofHeight: 25, doorW: 55, doorH: 80 },
};

function BuildingPixi({ wallId, roofId, buildingTypeId, damageClass, disasterType, simPhase }) {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const buildingRef = useRef(null);
  const particlesRef = useRef([]);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize PixiJS app
    const app = new PIXI.Application({
      width: 500,
      height: 600,
      background: 0x64B5F6,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    containerRef.current.appendChild(app.view);
    appRef.current = app;

    // Create building container
    const building = new PIXI.Container();
    building.x = 250; // Center
    building.y = 60; // Offset from top
    app.stage.addChild(building);
    buildingRef.current = building;

    const wallColor = wallStyles[wallId] || 0xB0BEC5;
    const roofData = roofStyles[roofId] || roofStyles.roof_metal;
    const shape = buildingShapes[buildingTypeId] || buildingShapes.house;

    // Ground
    const ground = new PIXI.Graphics();
    ground.beginFill(0x66BB6A);
    ground.drawRect(-250, 540, 500, 60);
    ground.endFill();
    app.stage.addChild(ground);

    // Walls
    const wallWidth = shape.width * 0.48;
    const wallHeight = shape.height;
    const wallLeft = new PIXI.Graphics();
    wallLeft.beginFill(wallColor);
    wallLeft.drawRect(-shape.width / 4, 0, wallWidth, wallHeight);
    wallLeft.endFill();
    wallLeft.lineStyle(2, 0x333333);
    wallLeft.drawRect(-shape.width / 4, 0, wallWidth, wallHeight);
    building.addChild(wallLeft);

    const wallRight = new PIXI.Graphics();
    wallRight.beginFill(wallColor);
    wallRight.drawRect(shape.width / 4 - wallWidth, 0, wallWidth, wallHeight);
    wallRight.endFill();
    wallRight.lineStyle(2, 0x333333);
    wallRight.drawRect(shape.width / 4 - wallWidth, 0, wallWidth, wallHeight);
    building.addChild(wallRight);

    // Roof
    const roof = new PIXI.Graphics();
    roof.beginFill(roofData.color);
    if (roofData.shape === 'sloped') {
      roof.moveTo(-shape.width / 2 - 10, 0);
      roof.lineTo(0, -shape.roofHeight);
      roof.lineTo(shape.width / 2 + 10, 0);
      roof.closePath();
    } else if (roofData.shape === 'peaked') {
      roof.moveTo(-shape.width / 2 - 10, 0);
      roof.lineTo(-shape.width / 4, -shape.roofHeight * 1.2);
      roof.lineTo(0, -shape.roofHeight * 0.8);
      roof.lineTo(shape.width / 4, -shape.roofHeight * 1.2);
      roof.lineTo(shape.width / 2 + 10, 0);
      roof.lineTo(0, -shape.roofHeight * 0.8);
      roof.closePath();
    } else {
      roof.drawRect(-shape.width / 2 - 10, -15, shape.width + 20, 15);
    }
    roof.endFill();
    roof.lineStyle(2.5, 0x333333);
    building.addChild(roof);

    // Door
    const door = new PIXI.Graphics();
    door.beginFill(0x5D4037);
    door.drawRect(-shape.doorW / 2, wallHeight - shape.doorH, shape.doorW, shape.doorH);
    door.endFill();
    door.lineStyle(1.5, 0x333333);
    building.addChild(door);

    // Door handle
    const handle = new PIXI.Graphics();
    handle.beginFill(0xFFD54F);
    handle.drawCircle(shape.doorW / 2 - 8, wallHeight - shape.doorH + 40, 3);
    handle.endFill();
    building.addChild(handle);

    // Windows
    const winRows = 2, winCols = 2;
    for (let row = 0; row < winRows; row++) {
      for (let col = 0; col < winCols; col++) {
        const winW = 34, winH = 40;
        const gapX = shape.width / (winCols + 1);
        const gapY = wallHeight / (winRows + 1);
        const x = -shape.width / 2 + gapX * (col + 1) - winW / 2;
        const y = gapY * (row + 1) - winH / 2 + 15;
        const win = new PIXI.Graphics();
        win.beginFill(0xB3E5FC);
        win.drawRect(x, y, winW, winH);
        win.endFill();
        win.lineStyle(1.5, 0x333333);
        building.addChild(win);
      }
    }

    // Animation loop
    let shakeTime = 0;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      if (damageClass && simPhase >= 2) {
        shakeTime += 0.1;

        if (disasterType === 'earthquake') {
          if (damageClass === 'severe') {
            building.x = 250 + Math.sin(shakeTime * 10) * 20;
            building.y = 60 + Math.cos(shakeTime * 15) * 5;
            building.rotation = Math.sin(shakeTime * 20) * 0.05;

            // Spawn debris particles
            if (Math.random() < 0.3) {
              const debris = new PIXI.Graphics();
              debris.beginFill([0x78909C, 0x90A4AE, 0xBCAAA4][Math.floor(Math.random() * 3)]);
              debris.drawRect(0, 0, 5 + Math.random() * 10, 5 + Math.random() * 8);
              debris.endFill();
              debris.x = 250 + (Math.random() - 0.5) * 300;
              debris.y = 60 + shape.height - 100;
              debris.vx = (Math.random() - 0.5) * 8;
              debris.vy = -Math.random() * 15;
              debris.gravity = 0.4;
              debris.life = 100;
              particlesRef.current.push(debris);
              app.stage.addChild(debris);
            }
          } else if (damageClass === 'moderate') {
            building.x = 250 + Math.sin(shakeTime * 5) * 10;
            building.rotation = Math.sin(shakeTime * 8) * 0.02;
          }
        }

        if (disasterType === 'typhoon' && damageClass === 'severe') {
          building.rotation = Math.sin(shakeTime * 3) * 0.15;
          if (Math.random() < 0.2) {
            const debris = new PIXI.Graphics();
            debris.beginFill(0x78909C);
            debris.drawRect(0, 0, 8, 6);
            debris.endFill();
            debris.x = 100;
            debris.y = 200;
            debris.vx = 15;
            debris.vy = -5;
            debris.gravity = 0.3;
            debris.life = 80;
            particlesRef.current.push(debris);
            app.stage.addChild(debris);
          }
        }
      }

      // Update particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx || 0;
        p.y += p.vy || 0;
        p.vy = (p.vy || 0) + (p.gravity || 0.3);
        p.rotation += 0.1;
        p.life--;
        if (p.life <= 0 || p.y > 600) {
          app.stage.removeChild(p);
          particlesRef.current.splice(i, 1);
        }
      }
    };
    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      app.destroy(true, { children: true });
    };
  }, [wallId, roofId, buildingTypeId]);

  return (
    <div ref={containerRef} style={{ width: '100%', maxWidth: 500, margin: '0 auto' }} />
  );
}

export default memo(BuildingPixi);
