import { useRef, useEffect, useCallback, memo } from 'react';
import * as THREE from 'three';

export const SVGW = 500, SVGH = 600, GROUND = 480;
export const WL_CONST = 100, WR_CONST = 400;
export const WW_CONST = WR_CONST - WL_CONST;
export const MX_CONST = (WL_CONST + WR_CONST) / 2;

function Building3D({ wallId, roofId, foundationId, buildingTypeId, damageClass, disasterType, isShaking, onShakeComplete }) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const buildingPartsRef = useRef({});
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  // Building data
  const wallColors = {
    wall_concrete: 0xB0BEC5,
    wall_brick: 0xEF9A9A,
    wall_wood: 0xBCAAA4,
    wall_steel: 0x90A4AE,
    wall_recycled: 0xC8E6C9,
  };

  const roofColors = {
    roof_metal: 0x78909C,
    roof_tiled: 0xFF8A65,
    roof_flat_concrete: 0xB0BEC5,
    roof_solar: 0x42A5F5,
  };

  const buildingDims = {
    house: { width: 300, height: 240, roofHeight: 70 },
    school: { width: 380, height: 320, roofHeight: 40 },
    hospital: { width: 400, height: 360, roofHeight: 30 },
    emergency_shelter: { width: 280, height: 180, roofHeight: 50 },
    farm_house: { width: 320, height: 220, roofHeight: 80 },
    office_building: { width: 350, height: 400, roofHeight: 25 },
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x64B5F6);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.OrthographicCamera(-250, 250, 300, -300, 1, 1000);
    camera.position.set(0, 0, 500);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
    renderer.setSize(500, 600);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(500, 120);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x66BB6A });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.position.y = -240;
    scene.add(ground);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(100, 200, 100);
    scene.add(directionalLight);

    // Building group
    const buildingGroup = new THREE.Group();
    scene.add(buildingGroup);

    const dims = buildingDims[buildingTypeId] || buildingDims.house;
    const wallColor = wallColors[wallId] || 0xB0BEC5;
    const roofColor = roofColors[roofId] || 0x78909C;

    // Walls
    const wallGeometry = new THREE.BoxGeometry(dims.width, dims.height, 10);
    const wallMaterial = new THREE.MeshLambertMaterial({ color: wallColor });

    const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    leftWall.position.set(-dims.width * 0.25, dims.height / 2 - 240, 0);
    leftWall.name = 'leftWall';
    buildingGroup.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
    rightWall.position.set(dims.width * 0.25, dims.height / 2 - 240, 0);
    rightWall.name = 'rightWall';
    buildingGroup.add(rightWall);

    // Roof
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-dims.width / 2 - 10, 0);
    roofShape.lineTo(0, dims.roofHeight);
    roofShape.lineTo(dims.width / 2 + 10, 0);
    roofShape.lineTo(-dims.width / 2 - 10, 0);

    const roofGeometry = new THREE.ExtrudeGeometry(roofShape, { depth: 10, bevelEnabled: false });
    const roofMaterial = new THREE.MeshLambertMaterial({ color: roofColor });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = dims.height - 240;
    roof.name = 'roof';
    buildingGroup.add(roof);

    // Foundation
    const fndGeometry = new THREE.BoxGeometry(dims.width - 20, 50, 10);
    const fndMaterial = new THREE.MeshLambertMaterial({ color: 0x78909C });
    const foundation = new THREE.Mesh(fndGeometry, fndMaterial);
    foundation.position.set(0, -240, 0);
    foundation.name = 'foundation';
    buildingGroup.add(foundation);

    // Door
    const doorGeometry = new THREE.BoxGeometry(38, 70, 12);
    const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x5D4037 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 35 - 240, 6);
    buildingGroup.add(door);

    // Windows
    const winGeometry = new THREE.BoxGeometry(34, 40, 12);
    const winMaterial = new THREE.MeshLambertMaterial({ color: 0xB3E5FC, transparent: true });
    const winPositions = [
      { x: -60, y: 50 }, { x: 60, y: 50 },
      { x: -60, y: -30 }, { x: 60, y: -30 },
    ];
    winPositions.forEach((pos, i) => {
      const win = new THREE.Mesh(winGeometry, winMaterial.clone());
      win.position.set(pos.x, pos.y - 240, 6);
      win.name = `window${i}`;
      buildingGroup.add(win);
    });

    buildingPartsRef.current = {
      group: buildingGroup,
      leftWall, rightWall, roof, foundation, door, windows: buildingGroup.children.filter(c => c.name.startsWith('window')),
    };

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      renderer.dispose();
      scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
    };
  }, [wallId, roofId, foundationId, buildingTypeId]);

  // Damage animations
  useEffect(() => {
    if (!buildingPartsRef.current.group) return;

    const { group, leftWall, rightWall, roof, foundation, windows } = buildingPartsRef.current;

    // Reset transforms
    group.rotation.z = 0;
    group.position.x = 0;
    group.scale.set(1, 1, 1);
    leftWall.position.x = -leftWall.geometry.parameters.width * 0.25;
    rightWall.position.x = rightWall.geometry.parameters.width * 0.25;
    roof.position.y = (buildingDims[buildingTypeId] || buildingDims.house).height - 240;

    if (damageClass === 'severe' && disasterType === 'earthquake') {
      // Severe shake with 3D rotation
      let shakeCount = 0;
      const shake = () => {
        if (shakeCount++ > 20) {
          // Roof slides off
          const roofSlide = () => {
            roof.position.x += 2;
            roof.rotation.z -= 0.02;
            if (roof.position.x < 100) requestAnimationFrame(roofSlide);
          };
          roofSlide();

          // Walls crack and separate
          leftWall.position.x -= 1;
          rightWall.position.x += 1;
          leftWall.material.opacity = Math.max(0.5, leftWall.material.opacity - 0.01);
          rightWall.material.opacity = Math.max(0.5, rightWall.material.opacity - 0.01);
          return;
        }
        group.rotation.z = (Math.random() - 0.5) * 0.1;
        group.position.x = (Math.random() - 0.5) * 20;
        group.scale.y = 1 + (Math.random() - 0.5) * 0.05;
        group.scale.x = 1 + (Math.random() - 0.5) * 0.03;
        setTimeout(shake, 50);
      };
      shake();
    }

    if (damageClass === 'moderate' && disasterType === 'earthquake') {
      let shakeCount = 0;
      const shake = () => {
        if (shakeCount++ > 10) return;
        group.rotation.z = (Math.random() - 0.5) * 0.05;
        group.position.x = (Math.random() - 0.5) * 10;
        setTimeout(shake, 100);
      };
      shake();
    }

    if (damageClass && disasterType === 'typhoon') {
      // Building leans in wind
      const lean = damageClass === 'severe' ? 0.15 : 0.08;
      group.rotation.z = lean;

      if (damageClass === 'severe') {
        // Roof flies off
        const flyOff = () => {
          roof.position.y += 2;
          roof.position.x += 3;
          roof.rotation.z -= 0.03;
          if (roof.position.y < 100) requestAnimationFrame(flyOff);
        };
        flyOff();
      }
    }

    if (damageClass && disasterType === 'bushfire') {
      // Walls darken
      const intensity = damageClass === 'severe' ? 0.5 : 0.8;
      [leftWall, rightWall].forEach(wall => {
        wall.material.color.setRGB(
          wall.material.color.r * intensity,
          wall.material.color.g * intensity,
          wall.material.color.b * intensity
        );
      });
    }

  }, [damageClass, disasterType, buildingTypeId]);

  return (
    <div style={{ width: '100%', maxWidth: 500, margin: '0 auto' }}>
      <canvas ref={canvasRef} style={{ width: '100%', display: 'block' }} />
    </div>
  );
}

export default memo(Building3D);
