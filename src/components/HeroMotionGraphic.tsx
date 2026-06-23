import React, { useEffect, useRef, useState, memo } from 'react';
import { usePerformanceMode } from '../hooks/usePerformanceMode';

interface VectorNode {
  x: number;
  y: number;
  origX: number;
  origY: number;
  vx: number;
  vy: number;
  size: number;
  speed: number;
  angle: number;
  seed: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  strength: number;
  active: boolean;
}

export default memo(function HeroMotionGraphic() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { liteMode } = usePerformanceMode();
  
  const nodesRef = useRef<VectorNode[]>([]);
  const rippleRef = useRef<Ripple[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, active: false, radius: 250 });

  // Initialize nodes
  const initNodes = (width: number, height: number, dpr: number) => {
    const nodes: VectorNode[] = [];
    const count = Math.min(32, Math.floor((width * height) / 18000));
    
    for (let i = 0; i < count; i++) {
      // Align loosely to a grid structure to look like blueprint points, but randomized inside cells
      const cellsX = 6;
      const cellsY = 4;
      const cellW = width / cellsX;
      const cellH = height / cellsY;
      
      const col = i % cellsX;
      const row = Math.floor(i / cellsX) % cellsY;
      
      const px = (col + 0.2 + Math.random() * 0.6) * cellW * dpr;
      const py = (row + 0.2 + Math.random() * 0.6) * cellH * dpr;
      
      nodes.push({
        x: px,
        y: py,
        origX: px,
        origY: py,
        vx: 0,
        vy: 0,
        size: (1.5 + Math.random() * 2) * dpr,
        speed: 0.2 + Math.random() * 0.5,
        angle: Math.random() * Math.PI * 2,
        seed: Math.random() * 100
      });
    }
    nodesRef.current = nodes;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;
    let animationId: number;
    let isVisible = true;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      mouseRef.current.radius = 160 * dpr;
      initNodes(width, height, dpr);
    };

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries && entries.length > 0) {
        resize();
      }
    });
    resizeObserver.observe(container);
    resize();

    // Mouse interactions
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = (e.clientX - rect.left) * dpr;
      mouseRef.current.targetY = (e.clientY - rect.top) * dpr;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = (e.touches[0].clientX - rect.left) * dpr;
      mouseRef.current.targetY = (e.touches[0].clientY - rect.top) * dpr;
      mouseRef.current.active = true;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      const cx = (e.touches[0].clientX - rect.left) * dpr;
      const cy = (e.touches[0].clientY - rect.top) * dpr;
      
      mouseRef.current.targetX = cx;
      mouseRef.current.targetY = cy;
      mouseRef.current.active = true;

      if (liteMode) return;
      rippleRef.current.push({
        x: cx,
        y: cy,
        radius: 0,
        maxRadius: 280 * dpr,
        strength: 22 * dpr,
        active: true
      });
      
      if (rippleRef.current.length > 5) {
        rippleRef.current.shift();
      }
    };

    const handleTouchEnd = () => {
      mouseRef.current.active = false;
    };

    const handleClick = (e: MouseEvent) => {
      if (liteMode) return;
      const rect = canvas.getBoundingClientRect();
      const cx = (e.clientX - rect.left) * dpr;
      const cy = (e.clientY - rect.top) * dpr;
      
      rippleRef.current.push({
        x: cx,
        y: cy,
        radius: 0,
        maxRadius: 280 * dpr,
        strength: 22 * dpr,
        active: true
      });
      
      if (rippleRef.current.length > 5) {
        rippleRef.current.shift();
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('click', handleClick);

    const ctx = canvas.getContext('2d', { alpha: true });
    let time = 0;

    const tick = () => {
      if (!ctx || !canvas || !isVisible) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (liteMode) {
        // Light static placeholder graphics of gridlines
        const accentColor = 'rgba(208, 188, 255, 0.15)';
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1;

        // Draw a simple blueprint wireframe
        ctx.beginPath();
        ctx.moveTo(width * dpr * 0.1, height * dpr * 0.3);
        ctx.quadraticCurveTo(width * dpr * 0.4, height * dpr * 0.1, width * dpr * 0.6, height * dpr * 0.4);
        ctx.bezierCurveTo(width * dpr * 0.8, height * dpr * 0.6, width * dpr * 0.9, height * dpr * 0.2, width * dpr * 0.95, height * dpr * 0.3);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(width * dpr * 0.8, height * dpr * 0.35, 60 * dpr, 0, Math.PI * 2);
        ctx.stroke();
        return;
      }

      time += 0.006;

      // Extract Monet Accent colors from CSS variables
      const bodyStyle = getComputedStyle(document.body);
      const rawAccent = bodyStyle.getPropertyValue('--color-accent').trim() || '#D0BCFF';
      const rawPencil = bodyStyle.getPropertyValue('--color-pencil-light').trim() || '#E6E0E9';
      
      // Interpolate mouse smoothly for organic trailing
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // Update and Draw ripples
      const activeRipples = rippleRef.current.filter(r => r.active);
      activeRipples.forEach(r => {
        r.radius += 5 * dpr;
        if (r.radius >= r.maxRadius) {
          r.active = false;
        }
      });
      rippleRef.current = activeRipples;

      // Draw horizontal dynamic drafting grid coordinates
      ctx.strokeStyle = 'rgba(208, 188, 255, 0.04)';
      ctx.lineWidth = 1;
      const numLines = 8;
      ctx.beginPath();
      for (let i = 1; i < numLines; i++) {
        const yVal = (height * dpr / numLines) * i;
        ctx.moveTo(0, yVal);
        ctx.lineTo(canvas.width, yVal);
      }
      ctx.stroke();

      // Draw math sine-wave generator representing the flow of logical craft
      ctx.strokeStyle = 'rgba(208, 188, 255, 0.12)';
      ctx.lineWidth = 1.2 * dpr;
      ctx.beginPath();
      for (let xPos = 0; xPos <= canvas.width; xPos += 15 * dpr) {
        // Base sine curve
        const ratio = xPos / canvas.width;
        let yWave = (height * dpr * 0.45) + Math.sin(ratio * Math.PI * 2.8 + time * 2) * 60 * dpr;
        
        // Distort with Mouse interaction
        if (mouse.active) {
          const dx = mouse.x - xPos;
          const dy = mouse.y - yWave;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const influence = (1 - dist / mouse.radius);
            yWave += (dy > 0 ? -1 : 1) * influence * 25 * dpr;
          }
        }

        // Ripple distortion
        rippleRef.current.forEach(r => {
          const dx = r.x - xPos;
          const dy = r.y - yWave;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const rippleWidth = 40 * dpr;
          if (Math.abs(dist - r.radius) < rippleWidth) {
            const force = (1 - Math.abs(dist - r.radius) / rippleWidth) * r.strength * (1 - r.radius / r.maxRadius);
            const angle = Math.atan2(dy, dx);
            yWave += Math.sin(angle) * force;
          }
        });

        if (xPos === 0) {
          ctx.moveTo(xPos, yWave);
        } else {
          ctx.lineTo(xPos, yWave);
        }
      }
      ctx.stroke();

      // Process Vector points
      const nodes = nodesRef.current;
      nodes.forEach(p => {
        // Natural Lissajous figure / noise drift
        p.angle += p.speed * 0.06;
        const driftX = Math.cos(p.angle + p.seed) * 12 * dpr;
        const driftY = Math.sin(p.angle * 1.5 + p.seed) * 12 * dpr;

        let targetX = p.origX + driftX;
        let targetY = p.origY + driftY;

        // Apply mouse gravity/repulsion vectors
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < mouse.radius) {
            const push = (1 - dist / mouse.radius) * 45 * dpr;
            const angle = Math.atan2(dy, dx);
            targetX -= Math.cos(angle) * push;
            targetY -= Math.sin(angle) * push;
          }
        }

        // Apply ripples forces
        rippleRef.current.forEach(r => {
          const dx = p.x - r.x;
          const dy = p.y - r.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const rippleWidth = 45 * dpr;
          if (Math.abs(dist - r.radius) < rippleWidth) {
            const force = (1 - Math.abs(dist - r.radius) / rippleWidth) * r.strength * 2 * (1 - r.radius / r.maxRadius);
            const angle = Math.atan2(dy, dx);
            targetX += Math.cos(angle) * force;
            targetY += Math.sin(angle) * force;
          }
        });

        // Basic Euler integration with spring stiffness physics
        const ax = (targetX - p.x) * 0.05;
        const ay = (targetY - p.y) * 0.05;
        
        p.vx = (p.vx + ax) * 0.85;
        p.vy = (p.vy + ay) * 0.85;
        
        p.x += p.vx;
        p.y += p.vy;

        // Render point blueprint ticks
        ctx.strokeStyle = 'rgba(208, 188, 255, 0.22)';
        ctx.lineWidth = 1;
        
        // Draw miniature drafting crosshair (+) for every vector node
        const cross = 4 * dpr;
        ctx.beginPath();
        ctx.moveTo(p.x - cross, p.y);
        ctx.lineTo(p.x + cross, p.y);
        ctx.moveTo(p.x, p.y - cross);
        ctx.lineTo(p.x, p.y + cross);
        ctx.stroke();

        // Glowing center dot
        ctx.fillStyle = rawAccent;
        ctx.globalAlpha = 0.18;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // Draw delicate connective drafting links between adjacent nodes
      ctx.strokeStyle = 'rgba(208, 188, 255, 0.06)';
      ctx.lineWidth = 0.8 * dpr;
      ctx.beginPath();
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          // Connect if they are within standard neighborhood distance
          if (dist < 180 * dpr) {
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
          }
        }
      }
      ctx.stroke();

      // Render orbiting coordinates indicator at Mouse Trail
      if (mouse.active) {
        ctx.strokeStyle = 'rgba(208, 188, 255, 0.16)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Orbit ring
        ctx.arc(mouse.x, mouse.y, 42 * dpr, 0, Math.PI * 2);
        ctx.stroke();

        // Technical drafting coordinate ticks on the orbit
        ctx.fillStyle = rawAccent;
        ctx.font = `600 ${8 * dpr}px 'JetBrains Mono', 'Fira Code', monospace`;
        ctx.fillText(`X:${Math.round(mouse.x / dpr)} Y:${Math.round(mouse.y / dpr)}`, mouse.x + 48 * dpr, mouse.y - 4 * dpr);

        // Compass crosshairs
        ctx.beginPath();
        ctx.moveTo(mouse.x - 52 * dpr, mouse.y);
        ctx.lineTo(mouse.x - 32 * dpr, mouse.y);
        ctx.moveTo(mouse.x + 32 * dpr, mouse.y);
        ctx.lineTo(mouse.x + 52 * dpr, mouse.y);
        ctx.stroke();
      }

      animationId = requestAnimationFrame(tick);
    };

    const visibilityObserver = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
      if (isVisible) {
        animationId = requestAnimationFrame(tick);
      } else {
        cancelAnimationFrame(animationId);
      }
    });
    visibilityObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationId);
    };
  }, [liteMode]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 pointer-events-auto select-none z-0 overflow-hidden cursor-crosshair"
    >
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full transform-gpu"
        style={{ touchAction: 'none', willChange: 'transform' }}
      />
    </div>
  );
});
