import { useEffect } from 'react';
import { motion } from 'motion/react';

interface LoaderProps {
  onComplete: () => void;
}

export default function Loader({ onComplete }: LoaderProps) {
  useEffect(() => {
    // Elegant, curated speed that finishes drawing, displays perfectly, then gracefully fades out
    const timer = setTimeout(() => {
      onComplete();
    }, 3100);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Letters of the logo "Aayu"
  const letters = ["A", "a", "y", "u"];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.15
      }
    }
  };

  const letterVariants = {
    hidden: {
      opacity: 0,
      scale: 0.65,
      y: 28
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 14,
        mass: 0.65
      }
    }
  };

  const underlineVariants = {
    hidden: { pathLength: 0, opacity: 0, scale: 0.95 },
    visible: {
      pathLength: 1,
      opacity: 0.9,
      scale: 1,
      transition: {
        delay: 0.85,
        duration: 1.1,
        ease: [0.25, 1, 0.5, 1]
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        scale: 0.98,
        transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } 
      }}
      className="fixed inset-0 w-screen h-[100dvh] z-[9999] flex flex-col items-center justify-center select-none transform-gpu overflow-hidden"
      style={{ 
        backgroundColor: 'var(--color-charcoal)',
        willChange: 'opacity, transform'
      }}
    >
      {/* Blueprint grid layout backdrop with GPU caching */}
      <div 
        className="absolute inset-x-0 inset-y-0 opacity-[0.045] pointer-events-none transform-gpu"
        style={{ 
          backgroundImage: 'linear-gradient(to right, var(--color-accent) 1px, transparent 1px), linear-gradient(to bottom, var(--color-accent) 1px, transparent 1px)', 
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 15%, rgba(0,0,0,0) 80%)',
          WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 15%, rgba(0,0,0,0) 80%)',
          willChange: 'mask-image'
        }} 
      />

      {/* Main Centered Typographic Logo Area */}
      <div className="relative flex flex-col items-center justify-center transform-gpu">
        
        {/* Brand Name Typography Container with active GPU acceleration layers */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative flex items-baseline justify-center mb-1 z-10 transform-gpu"
        >
          {letters.map((char, index) => (
            <motion.span
              key={index}
              variants={letterVariants}
              className="font-marker text-[3.5rem] sm:text-[4.5rem] md:text-[5.5rem] lg:text-[6.5rem] tracking-tight text-ink inline-block origin-bottom leading-none transform-gpu"
              style={{ willChange: 'transform, opacity' }}
            >
              {char}
            </motion.span>
          ))}
          
          {/* Distinctive Orange Accent dot drawing itself organically/stretching, pulsing soft shockwaves */}
          <div className="relative w-[12px] h-[12px] sm:w-[15px] sm:h-[15px] md:w-[19px] md:h-[19px] lg:w-[22px] lg:h-[22px] self-end mb-1 sm:mb-1.5 ml-1 sm:ml-1.5 overflow-visible transform-gpu">
            <svg viewBox="0 0 12 12" className="w-full h-full text-accent" fill="none" strokeWidth="1.6" style={{ willChange: 'transform, opacity' }}>
              {/* Outer soft dynamic expand/ripple */}
              <motion.circle
                cx="6"
                cy="6"
                r="4.5"
                stroke="currentColor"
                strokeWidth="1"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0.2, 2.2],
                  opacity: [0, 0.75, 0],
                }}
                transition={{
                  delay: 1.15,
                  duration: 1.2,
                  ease: "easeOut",
                  repeat: Infinity,
                  repeatDelay: 0.8
                }}
              />
              {/* Internal solid drawing core */}
              <motion.circle
                cx="6"
                cy="6"
                r="3.5"
                stroke="currentColor"
                fill="currentColor"
                variants={{
                  hidden: { 
                    scale: 0,
                    opacity: 0,
                    rotate: -45
                  },
                  visible: {
                    scale: 1,
                    opacity: 1,
                    rotate: 0,
                    transition: {
                      scale: { delay: 0.8, type: "spring", stiffness: 240, damping: 11, mass: 0.85 },
                      opacity: { delay: 0.8, duration: 0.3 }
                    }
                  }
                }}
                initial="hidden"
                animate="visible"
              />
            </svg>
          </div>
        </motion.div>

        {/* Hand-drawn underline effect drawing itself underneath the text */}
        <div className="w-[120px] sm:w-[150px] md:w-[180px] lg:w-[210px] h-2 sm:h-3 relative overflow-visible mb-1 z-10 transform-gpu">
          <svg viewBox="0 0 100 10" className="w-full h-full text-accent stroke-current" fill="none" strokeWidth="2.5" strokeLinecap="round" style={{ willChange: 'transform' }}>
            <motion.path 
              d="M 5,3 C 35,6 65,1 95,5" 
              variants={underlineVariants}
              initial="hidden"
              animate="visible"
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
