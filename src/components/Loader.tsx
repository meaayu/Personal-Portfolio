import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface LoaderProps {
  onComplete: () => void;
}

export default function Loader({ onComplete }: LoaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = 4000; // Hold strict 4000ms (4s) before entering
    const progressDuration = 3500; // Reach 100% at 3.5s allowing 0.5s hold at 100%
    const startTime = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const ratio = Math.min(1, elapsed / progressDuration);
      
      // Smooth cinematic ease matching the progress curve
      const easeRatio = ratio === 1 ? 1 : 1 - Math.pow(2, -10 * ratio);
      setProgress(Math.floor(easeRatio * 100));

      if (elapsed < totalDuration) {
        requestAnimationFrame(updateProgress);
      } else {
        onComplete();
      }
    };

    const animFrame = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animFrame);
  }, [onComplete]);

  // Typography stagger animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  } as const;

  const letterVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 220, mass: 0.8, damping: 14 }
    }
  } as const;

  return (
    <motion.div
      id="minimal-loader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.7, ease: [0.2, 1, 0.3, 1] } }}
      className="fixed inset-0 w-screen h-[100dvh] z-[9999] flex flex-col items-center justify-center select-none bg-charcoal overflow-hidden transform-gpu"
    >
      <div className="flex flex-col items-center justify-center gap-14 w-full max-w-sm px-6">
        
        {/* Minimalist Brand Typography */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex items-baseline justify-center tracking-tight"
        >
          {["a", "a", "y", "u"].map((char, index) => (
            <motion.span 
              key={index} 
              variants={letterVariants} 
              className="font-marker text-[4.5rem] sm:text-[5.5rem] md:text-[6.5rem] text-ink leading-none px-0.5 lowercase origin-bottom"
            >
              {char}
            </motion.span>
          ))}
          <motion.span 
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.85, type: "spring", stiffness: 240, damping: 12 }}
            className="text-accent text-[4.5rem] sm:text-[5.5rem] md:text-[6.5rem] font-sans inline-block origin-bottom leading-none select-none pl-1"
          >
            .
          </motion.span>
        </motion.div>

        {/* Minimalist Loading Progress UI */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-[200px] flex flex-col gap-4"
        >
          {/* Progress Indicators */}
          <div className="flex justify-between items-end w-full font-mono text-[9px] sm:text-[10px] tracking-[0.2em] text-ink-dim/50 uppercase">
            <span>Loading</span>
            <span className="tabular-nums font-bold text-accent/90">{String(progress).padStart(3, '0')}%</span>
          </div>

          {/* Core Loading Line */}
          <div className="h-[2px] w-full bg-pencil-dark/15 relative overflow-hidden rounded-full">
            <div 
              className="h-full bg-accent relative rounded-full will-change-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
