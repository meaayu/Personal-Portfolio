import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function FloatingControls() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[200] flex flex-col gap-3 pointer-events-auto gpu">
        
        {/* Back to Top */}
        <AnimatePresence mode="wait">
          {showScrollTop && (
            <motion.button
              key="back-to-top"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={scrollToTop}
              className="group relative flex flex-col items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-paper border-2 border-pencil hover:border-accent text-ink-dim hover:text-accent transition-all duration-300 cursor-pointer sketch-filter z-50 font-hand select-none rounded-[3px]"
              style={{
                clipPath: 'polygon(3% 8%, 95% 3%, 97% 93%, 4% 96%)',
              }}
              aria-label="Back to top"
            >
              {/* Notebook accent texture overlay on hover */}
              <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/8 transition-colors duration-300 pointer-events-none" />
              
              {/* Hand-drawn nested dashed trace border */}
              <div 
                className="absolute inset-[3px] border border-dashed border-pencil/25 pointer-events-none" 
                style={{ clipPath: 'polygon(1% 4%, 98% 2%, 96% 96%, 3% 94%)' }} 
              />

              <ArrowUp size={18} className="md:w-[22px] md:h-[22px] group-hover:-translate-y-1 transition-transform duration-300 relative z-10 text-current" strokeWidth={3} />
              
              <span className="font-hand font-bold text-[0.62rem] md:text-[0.68rem] uppercase tracking-widest relative z-10 -mt-0.5 select-none opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                Top
              </span>
            </motion.button>
          )}
        </AnimatePresence>

      </div>
    </>
  );
}

