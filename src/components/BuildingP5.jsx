import { useRef, useEffect, memo } from 'react';

function BuildingP5({ disasterType, damageClass, simPhase }) {
  const containerRef = useRef(null);
  const p5Ref = useRef(null);
  const particlesRef = useRef([]);
  const buildingRef = useRef({ x: 250, y: 300, scale: 1, rot: 0, destroyed: false });

  useEffect(() => {
    if (!containerRef.current) return;

    // Dynamically import p5
    import('p5').then(p5Module => {
      const p5 = p5Module.default;

      const sketch = (p) => {
        let particles = [];
        let building = { ...buildingRef.current };
        let shakeTime = 0;
        let cracked = false;

        p.setup = () => {
          p.createCanvas(500, 600).parent(containerRef.current);
          p.background(100, 181, 246); // Sky blue
        };

        p.draw = () => {
          p.background(100, 181, 246, 50); // Semi-transparent sky

          // Ground
          p.fill(102, 187, 106);
          p.noStroke();
          p.rect(0, 540, 500, 60);

          if (simPhase < 2 || !damageClass) {
            // Draw intact building
            drawBuilding(p, 250, 300, 1, 0);
            return;
          }

          // Apply damage effects
          if (disasterType === 'earthquake') {
            if (damageClass === 'severe') {
              shakeTime += 0.1;
              building.x = 250 + Math.sin(shakeTime * 10) * 30;
              building.y = 300 + Math.cos(shakeTime * 15) * 10;
              building.rot = Math.sin(shakeTime * 20) * 0.05;

              if (!cracked && shakeTime > 2) {
                cracked = true;
                building.destroyed = true;
                // Create debris particles
                for (let i = 0; i < 30; i++) {
                  particles.push({
                    x: building.x + (Math.random() - 0.5) * 300,
                    y: building.y + (Math.random() - 0.5) * 200,
                    vx: (Math.random() - 0.5) * 8,
                    vy: -Math.random() * 15,
                    size: 5 + Math.random() * 10,
                    color: p.color(176, 190, 197),
                    life: 100,
                  });
                }
              }
            } else if (damageClass === 'moderate') {
              shakeTime += 0.05;
              building.x = 250 + Math.sin(shakeTime * 5) * 15;
              building.rot = Math.sin(shakeTime * 8) * 0.02;
            }
          }

          // Draw building with transformations
          p.push();
          p.translate(building.x, building.y);
          p.rotate(building.rot);

          if (building.destroyed) {
            // Draw debris pieces
            p.fill(176, 190, 197);
            p.rect(-150, -120, 140, 240);
            p.rect(10, -120, 140, 240);
          } else {
            drawBuilding(p, 0, 0, building.scale, 0);
          }

          p.pop();

          // Update and draw particles
          for (let i = particles.length - 1; i >= 0; i--) {
            const pt = particles[i];
            pt.x += pt.vx;
            pt.y += pt.vy;
            pt.vy += 0.4; // gravity
            pt.life--;

            p.fill(pt.color);
            p.noStroke();
            p.rect(pt.x, pt.y, pt.size, pt.size * 0.8);

            if (pt.life <= 0 || pt.y > 600) {
              particles.splice(i, 1);
            }
          }

          // Impact stars for severe
          if (damageClass === 'severe' && p.frameCount % 20 === 0) {
            p.push();
            p.translate(250, 200);
            p.stroke(255, 214, 0);
            p.strokeWeight(3);
            for (let i = 0; i < 4; i++) {
              p.rotate(Math.PI / 4);
              p.line(0, -20, 0, 20);
            }
            p.pop();
          }
        };

        function drawBuilding(p, x, y, scale, rot) {
          p.push();
          p.translate(x, y);
          p.scale(scale);

          // Left wall
          p.fill(176, 190, 197);
          p.stroke(51, 51, 51);
          p.strokeWeight(2);
          p.rect(-150, -240, 140, 240);

          // Right wall
          p.rect(10, -240, 140, 240);

          // Roof
          p.fill(120, 144, 156);
          p.beginShape();
          p.vertex(-160, -240);
          p.vertex(0, -310);
          p.vertex(160, -240);
          p.endShape(p.CLOSE);

          // Door
          p.fill(93, 64, 55);
          p.rect(-19, 170, 38, 70);

          // Windows
          p.fill(179, 229, 252);
          for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 2; col++) {
              const wx = -130 + col * 100;
              const wy = -180 + row * 80;
              p.rect(wx, wy, 34, 40);
            }
          }

          p.pop();
        }
      };

      p5Ref.current = new p5(sketch);
    });

    return () => {
      if (p5Ref.current) {
        p5Ref.current.remove();
        p5Ref.current = null;
      }
    };
  }, [disasterType, damageClass, simPhase]);

  return (
    <div ref={containerRef} style={{ width: '100%', maxWidth: 500, margin: '0 auto' }} />
  );
}

export default memo(BuildingP5);
