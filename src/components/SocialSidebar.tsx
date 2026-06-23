import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Github, Instagram, Mail, User } from 'lucide-react';
import { cn } from '../lib/utils';

const SOCIALS = [
  { name: 'Instagram', icon: Instagram, url: 'https://instagram.com/m__aayu__' },
  { name: 'GitHub', icon: Github, url: 'https://github.com/meaayu' },
  { name: 'Email', icon: Mail, url: 'mailto:itsaayush.m@gmail.com' },
];

export default function SocialSidebar() {
  const [showSoon, setShowSoon] = useState(false);

  // Generate a sketchy hand-drawn single path
  const sketchPath = useMemo(() => {
    let path = "M 10,0";
    const seed = 0;
    const amp = 0.7;
    for (let i = 1; i <= 60; i++) {
      const y = i * (100 / 60);
      // Combine sine waves for macro curves and micro jitter
      const macroCurve = Math.sin(y * 0.08 + seed) * 3.5;
      const microJitter = Math.cos(y * 0.6 + seed * 2.5) * amp;
      const x = 10 + macroCurve + microJitter;
      path += ` L ${x},${y}`;
    }
    return path;
  }, []);

  const handleResumeClick = () => {
    setShowSoon(true);
    setTimeout(() => setShowSoon(false), 2000);
  };

  return (
    <div className="fixed left-4 md:left-6 xl:left-8 top-0 h-[100dvh] z-[200] hidden lg:flex flex-col items-center justify-center gpu">
      
      {/* Top hand-drawn vertical line */}
      <motion.div 
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
        style={{ transformOrigin: "top" }}
        className="w-[24px] flex-1 mb-4 pointer-events-none"
      >
        <svg viewBox="0 0 20 100" preserveAspectRatio="none" className="w-full h-full text-ink stroke-current">
          <path 
            d={sketchPath} 
            strokeWidth="1.2" 
            fill="none" 
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="opacity-30"
          />
        </svg>
      </motion.div>

      <div className="flex flex-col items-center gap-6 z-10 py-2">
        {/* Resume Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group hidden md:block"
        >
          {/* Tape Effect */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-3 bg-accent/20 rotate-[-4deg] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
          
          <motion.button
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleResumeClick}
            className={cn(
              "relative flex items-center justify-center w-11 h-11",
              "bg-paper border-2 border-solid border-pencil-light text-accent rounded-xl shadow-[4px_4px_0_0_var(--color-pencil-light)]",
              "transition-all duration-300 hover:border-accent hover:shadow-[6px_6px_0_0_var(--color-accent)] hover:-translate-x-[2px] hover:-translate-y-[2px] overflow-hidden"
            )}
          >
            {/* Sketchy background inside button */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,20 L100,50 L0,80" stroke="currentColor" fill="none" strokeWidth="1" />
                <path d="M20,0 L50,100 L80,0" stroke="currentColor" fill="none" strokeWidth="1" />
              </svg>
            </div>
            
            <User size={19} className={cn("transition-transform duration-500 z-10", showSoon && "rotate-180")} />
          </motion.button>

          {/* Tooltip (Tape Note) */}
          <AnimatePresence>
            {showSoon && (
              <motion.div 
                initial={{ opacity: 0, x: -20, rotate: -15 }}
                animate={{ opacity: 1, x: 0, rotate: -8 }}
                exit={{ opacity: 0, x: -10, rotate: -5 }}
                className={cn(
                  "absolute left-14 top-0 py-2 px-4 bg-paper-light border-2 border-accent text-ink shadow-xl min-w-[140px]",
                  "text-[0.7rem] font-hand tracking-tight flex flex-col items-center justify-center font-bold z-50 border border-black/10"
                )}
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-4 bg-accent/30 rotate-1" />
                <span className="relative z-10">Building workspace...</span>
                <span className="text-[0.6rem] opacity-70 mt-0.5">Will be ready soon!</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Default Label (Flyout) */}
          {!showSoon && (
            <span 
              className={cn(
                "absolute left-14 top-1/2 -translate-y-1/2 py-1.5 px-3 bg-paper border border-accent/30 text-accent shadow-lg",
                "text-[0.7rem] font-kalam tracking-wider uppercase whitespace-nowrap font-bold",
                "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none origin-left"
              )}
            >
              AAYU PERSONAL WORKSPACE
            </span>
          )}
        </motion.div>

        {/* Social Icons (Hidden on mobile) */}
        <div className="hidden md:flex flex-col items-center gap-5">
          {SOCIALS.map((social, i) => (
            <motion.a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
              className="group relative flex items-center justify-center w-10 h-10 text-ink-dim hover:text-accent transition-all duration-300"
            >
              {/* Hover Circle Background (Sketchy) */}
              <div className="absolute inset-0 bg-accent/5 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 border border-dashed border-accent/20" />
              
              <social.icon size={20} className="group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 relative z-10" />
              
              {/* Tooltip (Pencil Label) */}
              <span 
                className={cn(
                  "absolute left-12 py-1 px-3 bg-paper border border-pencil-light/20 text-ink shadow-md",
                  "text-[0.85rem] font-caveat tracking-wide whitespace-nowrap font-medium",
                  "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none"
                )}
              >
                {social.name}
              </span>
            </motion.a>
          ))}
        </div>
      </div>

      {/* Bottom hand-drawn vertical line */}
      <motion.div 
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
        style={{ transformOrigin: "bottom" }}
        className="w-[24px] flex-1 mt-4 pointer-events-none"
      >
        <svg viewBox="0 0 20 100" preserveAspectRatio="none" className="w-full h-full text-ink stroke-current">
          <path 
            d={sketchPath} 
            strokeWidth="1.2" 
            fill="none" 
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="opacity-30"
          />
        </svg>
      </motion.div>
    </div>
  );
}
