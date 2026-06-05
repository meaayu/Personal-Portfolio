import React from 'react';
import { cn } from '../lib/utils';
import { motion, useScroll, useTransform } from 'motion/react';

interface SectionDividerProps {
  className?: string;
  type?: 'wave' | 'zigzag' | 'scribble' | 'dashed';
}

export default function SectionDivider({ className, type = 'wave' }: SectionDividerProps) {
  const { scrollYProgress } = useScroll();
  
  // A subtle parallax or draw effect could be added if desired, 
  // but a static hand-drawn look is likely what's requested.
  
  const renderPath = () => {
    switch(type) {
      case 'zigzag':
        return <path d="M0,10 L15,2 L35,18 L50,8 L70,18 L85,4 L105,16 L120,6 L140,18 L155,5 L175,17 L190,8 L200,10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />;
      case 'scribble':
        return <path d="M0,10 C 20,25 30,-5 50,10 C 70,25 80,-5 100,10 C 120,25 130,-5 150,10 C 170,25 180,-5 200,10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />;
      case 'dashed':
        return <path d="M0,10 L200,10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="8 12" fill="none" strokeLinecap="round" className="transform -rotate-1 origin-center" />;
      case 'wave':
      default:
        return <path d="M0,10 Q 15,-2 30,10 T 60,10 T 90,10 T 120,10 T 150,10 T 180,10 T 200,10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    }
  };

  return (
    <div className={cn("w-full flex justify-center items-center py-12 md:py-20 opacity-30 text-ink-dim", className)}>
      <svg 
        width="200" 
        height="20" 
        viewBox="0 0 200 20" 
        className="w-48 max-w-full overflow-visible"
      >
        {renderPath()}
      </svg>
    </div>
  );
}
