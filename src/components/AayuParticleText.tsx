import React, { useEffect, useRef, useState } from 'react';
import { usePerformanceMode } from '../hooks/usePerformanceMode';

interface Particle {
  x: number;
  y: number;
  destX: number;
  destY: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  isDot: boolean;
  alpha: number;
  seed: number;
  mass: number;
  activationTime: number; // progressive delay in ms before magnetic spring forces activate
}

export default function AayuParticleText({ isLoading = false }: { isLoading?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<{ x: number; y: number; active: boolean; radius: number }>({
    x: 0,
    y: 0,
    active: false,
    radius: 12
  });
  
  const isFirstLoadRef = useRef(true);
  const startTimeRef = useRef<number>(Date.now());
  const { liteMode, togglePerformanceMode } = usePerformanceMode();
  const [debugDimensions, setDebugDimensions] = useState({ w: 0, h: 0 });

  // Interactive triggers for sandbox effects
  const triggerScatter = () => {
    if (document.body.classList.contains('perf-lite')) return;
    particlesRef.current.forEach((p) => {
      const angle = Math.random() * Math.PI * 2;
      const force = 12 + Math.random() * 10;
      p.vx = Math.cos(angle) * force;
      p.vy = Math.sin(angle) * force;
    });
  };

  const triggerWave = () => {
    if (document.body.classList.contains('perf-lite')) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Wave ripple sequence from left to right
    particlesRef.current.forEach((p) => {
      const delay = p.destX * 2;
      setTimeout(() => {
        p.vy -= 14 + Math.random() * 8;
        p.vx += (Math.random() - 0.5) * 6;
      }, delay);
    });
  };

  const triggerSwirl = () => {
    if (document.body.classList.contains('perf-lite')) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    particlesRef.current.forEach((p) => {
      const dx = p.x - centerX;
      const dy = p.y - centerY;
      const angle = Math.atan2(dy, dx);
      
      const swirlForce = 8 + Math.random() * 4;
      p.vx += -Math.sin(angle) * swirlForce;
      p.vy += Math.cos(angle) * swirlForce;
    });
  };

  const triggerReassemble = () => {
    if (document.body.classList.contains('perf-lite')) return;
    startTimeRef.current = Date.now() - 3000;
    particlesRef.current.forEach((p) => {
      p.vx = 0;
      p.vy = 0;
      p.activationTime = 0; // force immediate spring snapping
    });
  };

  // Function to scan the text pixels and initiate/update particles
  const scanText = (width: number, height: number, dpr: number, isInitial: boolean) => {
    if (width <= 0 || height <= 0) return;
    
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Scale canvas for high DPI
    tempCanvas.width = width * dpr;
    tempCanvas.height = height * dpr;

    // Clear and draw text offscreen
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Calculate adaptive font size based on container dimensions
    const fontSize = Math.min(height * 0.82, Math.max(42, Math.min(105, width * 0.25))) * dpr;
    
    // Draw the "AAYU" part
    tempCtx.font = `600 ${fontSize}px "Permanent Marker", "Kalam", cursive, sans-serif`;
    tempCtx.textAlign = 'left';
    tempCtx.textBaseline = 'middle';
    
    const nameText = "AAYU";
    const dotText = ".";
    
    const nameWidth = tempCtx.measureText(nameText).width;
    
    // Set a stable, safe left margin to prevent any character clipping on the left edge
    const startX = 8 * dpr;
    const centerY = tempCanvas.height / 2;

    // Render "AAYU" on offscreen to scan
    tempCtx.fillStyle = '#ffffff';
    tempCtx.font = `600 ${fontSize}px "Permanent Marker", "Kalam", cursive, sans-serif`;
    tempCtx.fillText(nameText, startX, centerY);
    
    // Scan Name pixels
    const nameImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Clear back and draw dot separately with pure red to identify it with absolute security
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.fillStyle = '#ff0000'; 
    tempCtx.font = `bold ${fontSize}px "Permanent Marker", "Inter", sans-serif`;
    tempCtx.fillText(dotText, startX + nameWidth - (fontSize * 0.05), centerY + (fontSize * 0.05));
    const dotImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

    // Filter pixels to build particles list
    const newParticles: Particle[] = [];
    
    // Grid step size: dynamic adaptive step based on width scaled with dpr to keep densities stable on high-res displays
    let baseStep = 3.0; 
    if (width < 340) baseStep = 2.6;
    else if (width > 600) baseStep = 3.5;
    
    const step = baseStep * dpr;

    const maxScanWidth = tempCanvas.width;

    // Scan Name
    for (let y = 0; y < tempCanvas.height; y += step) {
      for (let x = 0; x < tempCanvas.width; x += step) {
        const index = (Math.floor(y) * tempCanvas.width + Math.floor(x)) * 4;
        if (index >= nameImageData.data.length) continue;
        const alpha = nameImageData.data[index + 3];
        if (alpha > 60) {
          let spawnX = x;
          let spawnY = y;
          let vx = 0;
          let vy = 0;

          if (isInitial) {
            // Scatter widely into coordinates outside the frame with a beautiful slow drift
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.max(tempCanvas.width, tempCanvas.height) * (0.6 + Math.random() * 1.4);
            spawnX = tempCanvas.width / 2 + Math.cos(angle) * dist;
            spawnY = tempCanvas.height / 2 + Math.sin(angle) * dist;
            
            // Slow orbital swirl momentum
            vx = -Math.sin(angle) * (8 + Math.random() * 10);
            vy = Math.cos(angle) * (8 + Math.random() * 10);
          }

          // Uniform dot sizes for solid, even typography
          const baseSize = 1.6 * dpr;
          const mass = 0.6 + Math.random() * 1.2;

          // Progressive Left-to-Right delays (completed in ~1.1 seconds max)
          const ratioX = x / maxScanWidth;
          const activationTime = isInitial ? ratioX * 1100 + Math.random() * 200 : 0;

          newParticles.push({
            x: spawnX,
            y: spawnY,
            destX: x,
            destY: y,
            vx,
            vy,
            size: baseSize,
            baseSize,
            isDot: false,
            alpha: 1.0,
            seed: Math.random() * 100,
            mass,
            activationTime
          });
        }
      }
    }

    // Scan Dot
    for (let y = 0; y < tempCanvas.height; y += step) {
      for (let x = 0; x < tempCanvas.width; x += step) {
        const index = (Math.floor(y) * tempCanvas.width + Math.floor(x)) * 4;
        if (index >= dotImageData.data.length) continue;
        const red = dotImageData.data[index];
        const alpha = dotImageData.data[index + 3];
        if (alpha > 60 && red > 100) {
          let spawnX = x;
          let spawnY = y;
          let vx = 0;
          let vy = 0;

          if (isInitial) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.max(tempCanvas.width, tempCanvas.height) * (0.8 + Math.random() * 1.0);
            spawnX = tempCanvas.width / 2 + Math.cos(angle) * dist;
            spawnY = tempCanvas.height / 2 + Math.sin(angle) * dist;
            vx = -Math.sin(angle) * (10 + Math.random() * 10);
            vy = Math.cos(angle) * (10 + Math.random() * 10);
          }

          const baseSize = 2.2 * dpr;
          const mass = 1.3 + Math.random() * 0.7; // Heavier mass for structural solid dot

          const ratioX = x / maxScanWidth;
          const activationTime = isInitial ? ratioX * 1100 + Math.random() * 200 : 0;

          newParticles.push({
            x: spawnX,
            y: spawnY,
            destX: x,
            destY: y,
            vx,
            vy,
            size: baseSize,
            baseSize,
            isDot: true,
            alpha: 1.0,
            seed: Math.random() * 100,
            mass,
            activationTime
          });
        }
      }
    }

    // Sync particles
    particlesRef.current = newParticles;
  };

  useEffect(() => {
    if (isLoading) return;

    // Reset starting time for entry wave orchestration
    startTimeRef.current = Date.now();

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let dpr = window.devicePixelRatio || 1;
    let rectWidth = 0;
    let rectHeight = 0;

    const scaleAndScan = () => {
      const rect = container.getBoundingClientRect();
      rectWidth = rect.width;
      rectHeight = rect.height;
      if (rectWidth <= 0 || rectHeight <= 0) return;
      
      canvas.width = rectWidth * dpr;
      canvas.height = rectHeight * dpr;
      canvas.style.width = `${rectWidth}px`;
      canvas.style.height = `${rectHeight}px`;

      mouseRef.current.radius = (rectWidth < 400 ? 12 : 20) * dpr;

      // Scan and spawn
      scanText(rectWidth, rectHeight, dpr, isFirstLoadRef.current);
      isFirstLoadRef.current = false;
      setDebugDimensions({ w: Math.round(rectWidth), h: Math.round(rectHeight) });
      
      // If we are in lite-mode, tick() isn't looping, so we must call it manually to render.
      if (document.body.classList.contains('perf-lite') && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          const style = getComputedStyle(document.body);
          const accentColor = style.getPropertyValue('--color-accent').trim() || '#d4693a';
          const inkColor = style.getPropertyValue('--color-ink').trim() || '#e8ddd0';
          const fontSize = Math.min(rectHeight * 0.82, Math.max(42, Math.min(105, rectWidth * 0.25))) * dpr;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          const centerY = canvas.height / 2;

          ctx.font = `600 ${fontSize}px "Permanent Marker", "Kalam", cursive, sans-serif`;
          ctx.fillStyle = inkColor;
          ctx.fillText("AAYU", 0, centerY);

          const nameWidth = ctx.measureText("AAYU").width;
          ctx.font = `bold ${fontSize}px sans-serif`;
          ctx.fillStyle = accentColor;
          ctx.fillText(".", nameWidth - (fontSize * 0.05), centerY + (fontSize * 0.05));
        }
      }
    };

    // Responsive setup
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      scaleAndScan();
    });
    
    resizeObserver.observe(container);

    if (document.fonts) {
      document.fonts.ready.then(() => {
        scaleAndScan();
      });
    }

    const timeout1 = setTimeout(scaleAndScan, 200);
    const timeout2 = setTimeout(scaleAndScan, 1100);

    // Track Cursor coordinates relative to high-DPI canvas
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) * dpr;
      mouseRef.current.y = (e.clientY - rect.top) * dpr;
      mouseRef.current.active = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = (e.touches[0].clientX - rect.left) * dpr;
      mouseRef.current.y = (e.touches[0].clientY - rect.top) * dpr;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    // Splash dynamic shockwave on canvas clicks
    const handleCanvasClick = (e: MouseEvent) => {
      if (document.body.classList.contains('perf-lite')) return;
      
      const rect = canvas.getBoundingClientRect();
      const clickX = (e.clientX - rect.left) * dpr;
      const clickY = (e.clientY - rect.top) * dpr;

      particlesRef.current.forEach((p) => {
        const dx = p.x - clickX;
        const dy = p.y - clickY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const minExplosionRadius = 40 * dpr;
        const radius = Math.max(minExplosionRadius, dist);
        const force = (360 * dpr) / radius; 
        const angle = Math.atan2(dy, dx);

        p.vx += Math.cos(angle) * force + Math.sin(p.seed) * 4 * dpr;
        p.vy += Math.sin(angle) * force + Math.cos(p.seed) * 4 * dpr;
      });
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleCanvasClick);

    let animationId: number;
    const ctx = canvas.getContext('2d', { alpha: true });

    const tick = () => {
      if (!ctx || !canvas) return;

      // Silky smooth background wipe
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Access active layout colors
      const style = getComputedStyle(document.body);
      const accentColor = style.getPropertyValue('--color-accent').trim() || '#d4693a';
      const inkColor = style.getPropertyValue('--color-ink').trim() || '#e8ddd0';

      const isLiteMode = document.body.classList.contains('perf-lite');

      if (isLiteMode) {
        const fontSize = Math.min(rectHeight * 0.82, Math.max(42, Math.min(105, rectWidth * 0.25))) * dpr;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const centerY = canvas.height / 2;

        ctx.font = `600 ${fontSize}px "Permanent Marker", "Kalam", cursive, sans-serif`;
        ctx.fillStyle = inkColor;
        ctx.fillText("AAYU", 0, centerY);

        const nameWidth = ctx.measureText("AAYU").width;
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = accentColor;
        ctx.fillText(".", nameWidth - (fontSize * 0.05), centerY + (fontSize * 0.05));

        // Skip requestAnimationFrame to save battery/CPU in Lite Mode
        return;
      }

      const mouse = mouseRef.current;
      const elapsedMs = Date.now() - startTimeRef.current;
      const timeSec = Date.now() * 0.0012;

      particlesRef.current.forEach((p) => {
        // Subtle ambient slow-cosmic drift
        const waveX = 0;
        const waveY = 0;

        const targetX = p.destX + waveX;
        const targetY = p.destY + waveY;

        let forceX = 0;
        let forceY = 0;
        
        if (!isLiteMode) {
          // Interactive mouse push
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const distToMouse = Math.sqrt(dx * dx + dy * dy);

          if (mouse.active && distToMouse < mouse.radius) {
            const force = (mouse.radius - distToMouse) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            
            const strength = (24 * dpr) / p.mass; // heavy particles push less, light particles fly further
            forceX = -Math.cos(angle) * force * strength;
            forceY = -Math.sin(angle) * force * strength;
          }
        }

        // Apply Progressive Magnetic attraction
        const returnDx = targetX - p.x;
        const returnDy = targetY - p.y;
        const distToTarget = Math.sqrt(returnDx * returnDx + returnDy * returnDy);

        let springK = 0.0;
        let friction = 0.96; // Higher friction while floating in dark space

        if (elapsedMs >= p.activationTime) {
          // Magnetized capture mode! Pull with snapping physical elastic springs
          springK = 0.14 / p.mass; 
          friction = 0.73; // Classic snapping dampening
        } else {
          // Wandering cosmic stardust mode: drift around gently waiting for attraction
          p.vx += Math.sin(timeSec * 2 + p.seed) * 0.08 * dpr;
          p.vy += Math.cos(timeSec * 2 + p.seed) * 0.08 * dpr;
          
          // Slow down boundaries
          friction = 0.97;
        }

        p.vx += returnDx * springK + forceX;
        p.vy += returnDy * springK + forceY;

        p.vx *= friction;
        p.vy *= friction;

        // Snapping logic to eliminate pixel-vibrations at ultimate rest
        if (elapsedMs >= p.activationTime && distToTarget < 0.25 && Math.abs(p.vx) < 0.15 && Math.abs(p.vy) < 0.15) {
          p.x = targetX;
          p.y = targetY;
          p.vx = 0;
          p.vy = 0;
        } else {
          p.x += p.vx;
          p.y += p.vy;
        }

        // Handle micro visual glow scale changes based on interactivity
        let renderSize = p.baseSize;
        let renderOpacity = p.alpha;

        if (elapsedMs < p.activationTime) {
          // Subtle twinkling visual breathing while assembling
          renderSize = p.baseSize * (0.8 + Math.sin(timeSec * 6 + p.seed) * 0.3);
          renderOpacity = p.alpha * 0.7;
        } else if (!isLiteMode && mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const distToMouse = Math.sqrt(dx * dx + dy * dy);
          if (distToMouse < mouse.radius) {
            // Dynamic pulse enlargement on client Hover interaction
            const magnitude = (mouse.radius - distToMouse) / mouse.radius;
            renderSize = p.baseSize * (1.0 + magnitude * 0.55);
            renderOpacity = 1.0;
          }
        }

        // Keeps opacity stable and rich everywhere without clipping fades

        // Draw perfect crisp high-resolution drawing canvas squares (massively faster than arcs)
        ctx.fillStyle = p.isDot ? accentColor : inkColor;
        ctx.globalAlpha = renderOpacity;
        ctx.fillRect(p.x - renderSize, p.y - renderSize, renderSize * 2, renderSize * 2);
      });

      // Clear remaining alpha
      ctx.globalAlpha = 1.0;

      animationId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(animationId);
    };
  }, [isLoading, liteMode]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[88px] sm:h-[100px] md:h-[110px] overflow-hidden group select-none cursor-crosshair"
    >
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full transform-gpu"
        style={{ touchAction: 'none', willChange: 'transform' }}
      />
    </div>
  );
}
