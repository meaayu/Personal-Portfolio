import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform, animate, PanInfo } from 'motion/react';
import { ArrowLeft, X, Maximize2, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../index.css';

import wp1 from './assets/wallhaven-3q3j6y.jpg';
import wp2 from './assets/wallhaven-jev8wy_1920x1080.png';
import wp4 from './assets/wallhaven-qrllkd.png';
import wp5 from './assets/wallhaven-rqjrym.png';
import wp6 from './assets/wallhaven-zp8o3j.jpg';
import wp7 from './assets/wallhaven-3qrdr6.jpg';

const WALLPAPERS = [
  { 
    id: 'wp-1', 
    url: wp1, 
    title: 'Nebula Sketch', 
    sub: 'Ethereal hand-sketched vector cosmos with delicate neon grids',
    tag: '#cosmic'
  },
  { 
    id: 'wp-2', 
    url: wp2, 
    title: 'Synth Slate', 
    sub: 'Retro future terminal styled blueprint and warm analog glow',
    tag: '#synthwave'
  },
  { 
    id: 'wp-4', 
    url: wp4, 
    title: 'Vellum Deck', 
    sub: 'Vintage handcrafted fiber textures from structural notebook grids',
    tag: '#texture'
  },
  { 
    id: 'wp-5', 
    url: wp5, 
    title: 'Zenith Ripple', 
    sub: 'Dynamic topological sketch detailing creative digital focus paths',
    tag: '#vectors'
  },
  { 
    id: 'wp-6', 
    url: wp6, 
    title: 'Crystalline Soul', 
    sub: 'Abstract geometric grid paper with structural crystalline vectors',
    tag: '#abstract'
  },
  { 
    id: 'wp-7', 
    url: wp7, 
    title: 'Cyber Drift', 
    sub: 'Futuristic digital landscapes with high-tech glowing accents',
    tag: '#cyberpunk'
  }
];

interface WallpaperCardProps {
  slotIndex: number;
  diskRotation: any;
  counterRotation: any;
  wallpaper: typeof WALLPAPERS[0];
  spacingAngle: number;
  baseAngle: number;
  radius: number;
  activeIndex: number;
  visualIndex: number;
  onClick: () => void;
}

function WallpaperCard({
  slotIndex,
  diskRotation,
  counterRotation,
  wallpaper,
  spacingAngle,
  baseAngle,
  radius,
  activeIndex,
  visualIndex,
  onClick
}: WallpaperCardProps) {
  const centerRotation = -slotIndex * spacingAngle;

  // GPU-accelerated continuous scaling and opacity mapping via useTransform
  const scale = useTransform(
    diskRotation,
    [
      centerRotation - 3 * spacingAngle,
      centerRotation - 2 * spacingAngle,
      centerRotation - spacingAngle,
      centerRotation,
      centerRotation + spacingAngle,
      centerRotation + 2 * spacingAngle,
      centerRotation + 3 * spacingAngle
    ],
    [0.45, 0.65, 0.85, 1.05, 0.85, 0.65, 0.45]
  );

  const opacity = useTransform(
    diskRotation,
    [
      centerRotation - 4 * spacingAngle,
      centerRotation - 3 * spacingAngle,
      centerRotation - 2 * spacingAngle,
      centerRotation - spacingAngle,
      centerRotation,
      centerRotation + spacingAngle,
      centerRotation + 2 * spacingAngle,
      centerRotation + 3 * spacingAngle,
      centerRotation + 4 * spacingAngle
    ],
    [0, 0.25, 0.50, 0.75, 1.0, 0.75, 0.50, 0.25, 0]
  );

  const isActive = slotIndex === activeIndex;
  const isVisible = Math.abs(slotIndex - visualIndex) <= 3;

  const cardAngle = baseAngle + slotIndex * spacingAngle;
  const angleRad = (cardAngle * Math.PI) / 180;
  const x = radius * Math.cos(angleRad);
  const y = radius * Math.sin(angleRad);

  return (
    <motion.div
      style={{
        x,
        y,
        rotate: counterRotation,
        scale,
        opacity,
        zIndex: isActive ? 50 : 30 - Math.abs(slotIndex - visualIndex),
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
      className="absolute cursor-pointer pointer-events-auto"
      onClick={onClick}
    >
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[105px] h-[160px] sm:w-[135px] sm:h-[205px] md:w-[150px] md:h-[235px] lg:w-[175px] lg:h-[270px] rounded-[1.5rem] md:rounded-[2rem] border overflow-hidden shadow-2xl group bg-[#17141f] select-none transition-colors duration-500 ${isActive ? 'border-accent/40 shadow-[0_15px_40px_rgba(var(--color-accent-rgb),0.25)]' : 'border-pencil-light/10 hover:border-accent/25'}`}
      >
        <div className={`absolute inset-0 border-2 rounded-[1.5rem] md:rounded-[2rem] pointer-events-none z-25 group-hover:border-accent/40 transition-colors duration-500 ${isActive ? 'border-accent/25' : 'border-white/5'}`} />

        <img 
          src={wallpaper.url} 
          alt={wallpaper.title}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-700 pointer-events-none ${isActive ? 'scale-100 brightness-105' : 'scale-105 brightness-[0.62] group-hover:brightness-90'}`}
        />
      </div>
    </motion.div>
  );
}

export default function Wallpapers() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visualIndex, setVisualIndex] = useState(0);
  const [selectedWallpaper, setSelectedWallpaper] = useState<typeof WALLPAPERS[0] | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [radius, setRadius] = useState(380);

  // Framer Motion continuous state values for ultra-smooth wheel rotation
  const diskRotation = useMotionValue(0);
  const counterRotation = useTransform(diskRotation, (r) => -r);
  const constantZero = useMotionValue(0);

  // Store the momentum velocity across state changes to feed into snapping spring solver
  const lastVelocityRef = useRef(0);

  useEffect(() => {
    let resizeTimer: number;
    const handleResize = () => {
      if (resizeTimer) cancelAnimationFrame(resizeTimer);
      resizeTimer = requestAnimationFrame(() => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        if (mobile) {
          setRadius(210);
        } else {
          setRadius(Math.min(window.innerHeight * 0.44, 390));
        }
      });
    };
    // Call once initially to set values
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (mobile) {
      setRadius(210);
    } else {
      setRadius(Math.min(window.innerHeight * 0.44, 390));
    }
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(resizeTimer);
    };
  }, []);

  const nextWallpaper = useCallback(() => {
    setActiveIndex((prev) => prev + 1);
  }, []);

  const prevWallpaper = useCallback(() => {
    setActiveIndex((prev) => prev - 1);
  }, []);

  // Rotation settings per card
  const spacingAngle = isMobile ? 34 : 32; // spacing degrees
  const baseAngle = isMobile ? 270 : 180;  // math start point: 270 = top, 180 = left

  // Real-time tracking of visual index for card rendering
  useEffect(() => {
    return diskRotation.onChange((latest) => {
      setVisualIndex(Math.round(-latest / spacingAngle));
    });
  }, [diskRotation, spacingAngle]);

  // Watch index and animate the wheel seamlessly
  useEffect(() => {
    const targetRotation = -activeIndex * spacingAngle;
    const velocity = lastVelocityRef.current;
    lastVelocityRef.current = 0; // consumed
    animate(diskRotation, targetRotation, { 
      type: "spring", 
      stiffness: 130, 
      damping: 24,
      velocity: velocity 
    });
  }, [activeIndex, spacingAngle, diskRotation]);

  // Real-time drag updates
  const dragStartRotation = useRef(0);

  const handleDragStart = () => {
    dragStartRotation.current = diskRotation.get();
  };

  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Translate the user's manual dragging offset into a fluid circular wheel spin
    const dragFactor = isMobile ? 0.35 : 0.28;
    const offset = isMobile ? info.offset.x : -info.offset.y; 
    diskRotation.set(dragStartRotation.current + offset * dragFactor);
  };

  // Handle dynamic momentum & snapping logic on drag release
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const currentRotation = diskRotation.get();
    
    // Scale velocity from px/sec value to degrees/sec using dragFactor ratio
    const dragFactor = isMobile ? 0.35 : 0.28;
    const velocity = isMobile ? info.velocity.x : -info.velocity.y;
    let angularVelocity = velocity * dragFactor;

    // Limit maximum angular velocity to prevent infinite/excessive spinning
    const maxVelocity = 1500;
    if (angularVelocity > maxVelocity) angularVelocity = maxVelocity;
    if (angularVelocity < -maxVelocity) angularVelocity = -maxVelocity;
    
    // Estimate coast/glide duration in seconds - adjusted to 0.26-0.28s for incredible scroll inertia
    const coastDuration = isMobile ? 0.26 : 0.28; 
    const projectedRotation = currentRotation + (angularVelocity * coastDuration);
    
    // Convert projected resting angle to nearest wallpaper index
    const targetIndex = Math.round(-projectedRotation / spacingAngle);
    
    if (targetIndex !== activeIndex) {
      lastVelocityRef.current = angularVelocity;
      setActiveIndex(targetIndex);
    } else {
      // Re-snap cleanly to current index, carrying across the swipe momentum seamlessly
      const targetRotation = -activeIndex * spacingAngle;
      animate(diskRotation, targetRotation, { 
        type: "spring", 
        stiffness: 130, 
        damping: 24,
        velocity: angularVelocity
      });
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextWallpaper();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        prevWallpaper();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextWallpaper, prevWallpaper]);

  // Mouse wheel navigation
  const accumulatedWheelDelta = useRef({ value: 0, lastTime: 0 });

  const handleWheel = (e: React.WheelEvent) => {
    // Determine the main scroll axis
    const mainDelta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : -e.deltaX;
    
    const now = Date.now();
    // Reset accumulator if user stopped scrolling for a moment
    if (now - accumulatedWheelDelta.current.lastTime > 150) {
      accumulatedWheelDelta.current.value = 0;
    }
    accumulatedWheelDelta.current.lastTime = now;
    
    accumulatedWheelDelta.current.value += mainDelta;
    
    // Higher threshold means less sensitive (requires more scrolling to trigger a card change)
    const threshold = 180;
    
    if (Math.abs(accumulatedWheelDelta.current.value) >= threshold) {
      let steps = Math.trunc(accumulatedWheelDelta.current.value / threshold);
      
      // Limit to max 1 step per threshold burst, so it doesn't spin insanely fast
      if (steps > 1) steps = 1;
      if (steps < -1) steps = -1;
      
      setActiveIndex(prev => prev - steps);
      
      // Reset accumulator after a change
      accumulatedWheelDelta.current.value = 0;
    }
  };

  const getNormalizedIndex = (index: number) => {
    return ((index % WALLPAPERS.length) + WALLPAPERS.length) % WALLPAPERS.length;
  };

  const activeWallpaper = WALLPAPERS[getNormalizedIndex(activeIndex)];

  const handleCardClick = (index: number) => {
    if (index === activeIndex) {
      setSelectedWallpaper(WALLPAPERS[getNormalizedIndex(index)]);
    } else {
      setActiveIndex(index);
    }
  };

  return (
    <div 
      className="h-[100dvh] w-full bg-[#0d0b11] relative overflow-hidden flex flex-col justify-between p-6 md:p-12 font-sans text-ink overscroll-none touch-none"
      onWheel={handleWheel}
    >
      
      {/* Cinematic ambient blurred background tracking active wallpaper */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-[#0d0b11]">
        
        {/* Animated Motion Shapes (Portfolio Style) */}
        <motion.div
          animate={{
            x: [0, 40, -40, 0],
            y: [0, -40, 40, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent/10 blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -50, 50, 0],
            y: [0, 50, -50, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-purple-500/10 blur-[130px]"
        />

        <AnimatePresence mode="wait">
          <motion.img 
            key={activeWallpaper.id}
            src={activeWallpaper.url} 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.12 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            className="absolute inset-0 w-full h-full object-cover filter blur-[100px] scale-110 mix-blend-screen"
          />
        </AnimatePresence>
        
        {/* Deep dark radial fade overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0b11]/20 via-[#0d0b11]/80 to-[#0d0b11] z-0" />
      </div>

      {/* CORE FRAME: Grid Split */}
      <div className="flex-grow grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] lg:grid-cols-[1.2fr_0.8fr] gap-6 items-start md:items-center w-full max-w-[1240px] mx-auto z-10 relative mt-4 md:mt-0">
        
        {/* LEFT COLUMN: Presentation & Active Metadata */}
        <div className="flex flex-col items-start text-left justify-center pr-0 md:pr-10">
          
          <div className="flex flex-col mb-4 select-none pointer-events-none">
            <h1 className="font-marker text-[1.5rem] sm:text-[2rem] md:text-[2.8rem] lg:text-[3.6rem] leading-[0.85] text-ink -tracking-wider">
              WALLPAPER
            </h1>
            <span className="font-hand text-base sm:text-lg md:text-xl text-accent/80 italic mt-1 ml-2 transform -rotate-1 self-start select-text pointer-events-auto">
              collection
            </span>
          </div>

          {/* Elegant Scratched Separator Divider */}
          <div className="w-48 opacity-30 select-none pointer-events-none mb-8">
            <svg className="w-full h-[8px] overflow-visible text-accent stroke-current" viewBox="0 0 280 8" fill="none">
              <path d="M3 4 C 50 1, 140 7, 277 4" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          <div className="mt-8 flex items-center gap-2 text-ink-dim/40 font-mono text-[0.62rem] tracking-widest uppercase select-none pointer-events-none pl-1">
            <HelpCircle size={12} strokeWidth={2} />
            <span>Spins: swipe/drag, scroll, or use keyboard arrows</span>
          </div>

          {/* Inline navigation arrows */}
          <div className="flex gap-2.5 mt-4">
            <button
              onClick={prevWallpaper}
              className="w-10 h-10 flex items-center justify-center bg-paper/30 border border-pencil-light/15 hover:border-accent/40 rounded-xl text-ink-dim hover:text-accent hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-2xs"
              aria-label="Previous Wallpaper"
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={nextWallpaper}
              className="w-10 h-10 flex items-center justify-center bg-paper/30 border border-pencil-light/15 hover:border-accent/40 rounded-xl text-ink-dim hover:text-accent hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-2xs"
              aria-label="Next Wallpaper"
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: The Interactive Curve Spin Disk Area */}
        <div className="absolute md:inset-0 inset-0 w-full flex items-center justify-center pointer-events-none select-none -z-10 md:-z-[5]">
          
          {/* Draggable overlay layer - captures pointer gestures without sliding away */}
          <motion.div
            drag={isMobile ? "x" : "y"}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.02}
            style={{ x: constantZero, y: constantZero }}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            className="absolute z-30 cursor-grab active:cursor-grabbing md:right-0 md:w-[50vw] md:h-full w-full h-[60vh] bottom-0 md:bottom-auto pointer-events-auto flex items-center justify-center overflow-visible touch-none"
          >
            {/* The circular spinning anchor element - rotates physically using diskRotation */}
            <motion.div 
              style={{ rotate: diskRotation }}
              className="absolute md:top-1/2 md:-translate-y-1/2 md:right-[15%] md:left-auto bottom-[-135px] left-1/2 md:translate-x-0 -translate-x-1/2 w-0 h-0 flex items-center justify-center pointer-events-none"
            >
              
              {/* Outer compass rim guiding lines */}
              <div 
                className="absolute border border-dashed border-accent/10 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: radius * 2,
                  height: radius * 2,
                }}
              />
              <div 
                className="absolute border border-dotted border-[#FFEAA7]/5 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: radius * 2 - 30,
                  height: radius * 2 - 30,
                }}
              />

              {/* WALLPAPERS RENDER */}
              {Array.from({ length: 9 }).map((_, i) => {
                const slotIndex = visualIndex - 4 + i;
                const wallpaper = WALLPAPERS[getNormalizedIndex(slotIndex)];
                return (
                  <WallpaperCard
                    key={`${wallpaper.id}-${slotIndex}`}
                    slotIndex={slotIndex}
                    diskRotation={diskRotation}
                    counterRotation={counterRotation}
                    wallpaper={wallpaper}
                    spacingAngle={spacingAngle}
                    baseAngle={baseAngle}
                    radius={radius}
                    activeIndex={activeIndex}
                    visualIndex={visualIndex}
                    onClick={() => handleCardClick(slotIndex)}
                  />
                );
              })}

            </motion.div>
          </motion.div>

        </div>

      </div>

      {/* FOOTER TEXT */}
      <div className="w-full relative z-40 select-none text-center flex flex-col items-center justify-center shrink-0 py-4 mt-8 md:mt-0 pointer-events-none">
        <span className="font-mono text-[0.6rem] tracking-[0.45em] text-accent/35 uppercase leading-none">
          - aayu creative space -
        </span>
        <span className="font-hand text-lg text-accent/70 italic mt-1.5 transform -rotate-1">
          collection
        </span>
      </div>

      {/* LIGHTBOX FOR INSPECT FULL SCREEN */}
      <AnimatePresence>
        {selectedWallpaper && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07060a]/96 backdrop-blur-2xl p-4 sm:p-8"
          >
            <button 
              onClick={() => setSelectedWallpaper(null)}
              className="absolute top-6 right-6 w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all z-50 cursor-pointer"
              aria-label="Close modal"
            >
              <X size={22} />
            </button>
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 26, stiffness: 180 }}
              className="relative w-full max-w-7xl max-h-[85vh] flex flex-col items-center justify-center gap-6 overflow-hidden select-none"
            >
              <img 
                src={selectedWallpaper.url} 
                alt={selectedWallpaper.title}
                className="max-w-full max-h-[75vh] object-contain drop-shadow-[0_20px_50px_rgba(var(--color-accent-rgb),0.35)] rounded-2xl border border-pencil-light/10"
              />
              <div className="flex flex-col items-center text-center">
                <span className="font-marker text-xl sm:text-2xl text-ink tracking-wide">{selectedWallpaper.title}</span>
                <span className="font-sans text-xs text-ink-dim/70 mt-1 max-w-md">{selectedWallpaper.sub}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
