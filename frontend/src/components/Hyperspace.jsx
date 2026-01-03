import React, { useEffect, useRef } from 'react';

const Hyperspace = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const stars = [];
    const starCount = 300;
    const speed = 25; // Warp speed

    class Star {
      constructor() {
        this.x = (Math.random() - 0.5) * width;
        this.y = (Math.random() - 0.5) * height;
        this.z = Math.random() * width; // Depth
        this.pz = this.z; // Previous z for streaks
      }

      update() {
        this.z -= speed;
        if (this.z < 1) {
          this.z = width;
          this.x = (Math.random() - 0.5) * width;
          this.y = (Math.random() - 0.5) * height;
          this.pz = this.z;
        }
      }

      draw() {
        // Perspective projection
        const sx = (this.x / this.z) * width + width / 2;
        const sy = (this.y / this.z) * height + height / 2;

        const px = (this.x / this.pz) * width + width / 2;
        const py = (this.y / this.pz) * height + height / 2;

        this.pz = this.z;

        // Draw streak
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = `rgba(100, 200, 255, ${Math.min(1, (width - this.z) / width)})`;
        ctx.lineWidth = 2; // Thicker streaks
        ctx.stroke();
      }
    }

    // Init stars
    for (let i = 0; i < starCount; i++) {
       stars.push(new Star());
    }

    const animate = () => {
      // Create trailing effect by filling with semi-transparent black
      // For warp speed, we might want less trail and more streak
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, width, height);
      
      stars.forEach(star => {
        star.update();
        star.draw();
      });
      requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full z-[100] pointer-events-none mix-blend-screen"
    />
  );
};

export default Hyperspace;
