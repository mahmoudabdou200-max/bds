import { useState, useEffect } from 'react';

export default function TestAnimation() {
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    // Test if Canvas is working
    const canvas = document.getElementById('test-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(50, 50, 100, 100);
        setStatus('Canvas working!');
      } else {
        setStatus('Canvas context failed');
      }
    } else {
      setStatus('Canvas element not found');
    }
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Animation Test Page</h2>
      <p>Status: {status}</p>
      
      <canvas id="test-canvas" width={500} height={300} style={{ border: '1px solid #ccc' }} />
      
      <div style={{ marginTop: 20 }}>
        <h3>Lottie Test</h3>
        <div id="lottie-test" style={{ width: 200, height: 200, border: '1px solid #ccc' }} />
      </div>
      
      <script dangerouslySetInnerHTML={{
        __html: `
          if (window.lottie) {
            lottie.loadAnimation({
              container: document.getElementById('lottie-test'),
              path: '/working_earthquake.json',
              loop: true,
              autoplay: true,
            });
          }
        `,
      }} />
    </div>
  );
}
