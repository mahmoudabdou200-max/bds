import { useRef, useEffect, memo } from 'react';

export const SVGW = 500, SVGH = 600, GROUND = 480;
export const WL_CONST = 100, WR_CONST = 400;
export const WW_CONST = WR_CONST - WL_CONST;
export const MX_CONST = (WL_CONST + WR_CONST) / 2;

// Vertex shader - handles position/transforms
const vertexShader = `
  attribute vec2 a_position;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_position * 0.5 + 0.5;
  }
`;

// Fragment shader - creates cartoon disaster effects
const fragmentShader = `
  precision mediump float;
  varying vec2 v_texCoord;
  uniform float u_time;
  uniform float u_damage;
  uniform vec2 u_shake;
  uniform float u_disasterType; // 0=earthquake, 1=flood, 2=typhoon, etc.
  
  void main() {
    vec2 pos = v_texCoord;
    
    // Apply shake
    pos += u_shake;
    
    // Building bounds (simplified)
    float wallLeft = 0.2;
    float wallRight = 0.8;
    float wallTop = 0.3;
    float wallBottom = 0.8;
    
    // Earthquake - cracks and distortion
    if (u_disasterType < 0.5 && u_damage > 0.5) {
      // Create crack pattern
      float crack = sin(pos.x * 50.0 + u_time) * cos(pos.y * 30.0) * u_damage * 0.1;
      pos.x += crack;
      
      // Make walls separate
      if (pos.x < 0.5) pos.x -= u_damage * 0.2;
      else pos.x += u_damage * 0.2;
    }
    
    // Typhoon - lean building
    if (u_disasterType > 1.5 && u_disasterType < 2.5) {
      float lean = (pos.y - 0.5) * u_damage * 0.3;
      pos.x += lean;
    }
    
    // Color based on disaster
    vec3 color;
    if (u_disasterType < 0.5) color = vec3(0.69, 0.73, 0.78); // Grey for earthquake
    else if (u_disasterType > 1.5 && u_disasterType < 2.5) color = vec3(0.47, 0.53, 0.6); // Blue-grey for typhoon
    else color = vec3(0.69, 0.73, 0.78);
    
    // Darken with damage
    color *= (1.0 - u_damage * 0.5);
    
    // Add cracks as darker lines
    float crackPattern = sin(pos.x * 100.0 + u_time * 2.0) * sin(pos.y * 80.0);
    if (crackPattern > 0.8 && u_damage > 0.3) color *= 0.5;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

function BuildingShader({ damageClass, disasterType, simPhase }) {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const animFrameRef = useRef(null);

  const disasterTypeMap = {
    earthquake: 0,
    flood: 1,
    heat_wave: 1.5,
    sandstorm: 2,
    blizzard: 2.5,
    typhoon: 3,
    bushfire: 3.5,
    tsunami: 4,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }
    glRef.current = gl;

    // Compile shader
    const compileShader = (source, type) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    };

    const vs = compileShader(vertexShader, gl.VERTEX_SHADER);
    const fs = compileShader(fragmentShader, gl.FRAGMENT_SHADER);

    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Set up geometry (full-screen quad)
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posAttrib = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posAttrib);
    gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const damageLoc = gl.getUniformLocation(program, 'u_damage');
    const shakeLoc = gl.getUniformLocation(program, 'u_shake');
    const disasterLoc = gl.getUniformLocation(program, 'u_disasterType');

    // Animation loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const damage = damageClass ? (damageClass === 'severe' ? 1.0 : damageClass === 'moderate' ? 0.6 : 0.3) : 0.0;
      const shakeX = damage > 0 ? Math.sin(elapsed * 20) * damage * 0.02 : 0;
      const shakeY = damage > 0 ? Math.cos(elapsed * 25) * damage * 0.02 : 0;
      const dType = disasterTypeMap[disasterType] || 0;

      gl.uniform1f(timeLoc, elapsed);
      gl.uniform1f(damageLoc, damage);
      gl.uniform2f(shakeLoc, shakeX, shakeY);
      gl.uniform1f(disasterLoc, dType);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
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

export default memo(BuildingShader);
