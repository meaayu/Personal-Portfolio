import React, { useEffect, useState, memo } from 'react';
import { Github, Mail, Code, PenTool, Sparkles, Heart, Activity, Cpu, Zap, Sliders, Grid, Check, MapPin } from 'lucide-react';
import { smoothScrollTo } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import AayuParticleText from './AayuParticleText';
import avatarImg from '../assets/avatar.png';
import { usePerformanceMode } from '../hooks/usePerformanceMode';

interface HeroProps {
  isLoading?: boolean;
  liveStatus?: string;
  avatarUrl?: string;
}

export default memo(function Hero({ isLoading = false, liveStatus, avatarUrl }: HeroProps) {
  const [kathmanduTime, setKathmanduTime] = useState<string>('');
  const [hoveredCard, setHoveredCard] = useState<'sketch' | 'code' | null>(null);

  // Quotes Section States
  const [quoteIndex, setQuoteIndex] = useState<number>(0);
  const quotes = [
    { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
    { text: "Make it simple, but significant.", author: "Don Draper" },
    { text: "The details are not the details. They make the design.", author: "Charles Eames" },
    { text: "Clean code always looks like it was written by someone who cares.", author: "Michael Feathers" },
    { text: "Simplicity is about subtracting the obvious and adding the meaningful.", author: "John Maeda" }
  ];

  // Tab state for the multi-tab coding card
  const [activeCodeTab, setActiveCodeTab] = useState<'soul.ts' | 'physics.css' | 'canvas.tsx'>('soul.ts');

  // Live Kathmandu relative time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const ktOffset = 5.75 * 3600000; // Kathmandu is UTC +5:45
      const ktDate = new Date(utc + ktOffset);
      
      let hoursRaw = ktDate.getHours();
      const ampm = hoursRaw >= 12 ? 'PM' : 'AM';
      hoursRaw = hoursRaw % 12;
      hoursRaw = hoursRaw ? hoursRaw : 12; // the hour '0' should be '12'
      
      const hours = hoursRaw.toString().padStart(2, '0');
      const minutes = ktDate.getMinutes().toString().padStart(2, '0');
      const seconds = ktDate.getSeconds().toString().padStart(2, '0');
      setKathmanduTime(`${hours}:${minutes}:${seconds} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper code contents based on selected file tabs in mini editor
  const getTabCode = () => {
    switch (activeCodeTab) {
      case 'soul.ts':
        return `import { Soul, Art } from "@aayu/core";

// Bring lifeless bits to motion...
const space = new CraftEngine({
  vintagePaper: true, 
  characterMode: "warm",
  soul: new Soul({
    inputs: "analog-feel",
    interactive: true
  })
});

space.ignitEngine();`;
      case 'physics.css':
        return `/* Inertial spring kinematics */
@theme {
  --spring-bouncy: cubic-bezier(0.18, 0.9, 0.32, 1.25);
  --spring-magnetic: cubic-bezier(0.35, 1.6, 0.65, 1);
}

.card-layer-lift {
  transform: translate3d(0, -8px, 15px);
  box-shadow: var(--shadow-hover);
  transition: all .4s var(--spring-bouncy);
}`;
      case 'canvas.tsx':
        return `import { motion } from "motion/react";

export function ActivePencil() {
  return (
    <motion.svg
      animate={{ rotate: 360 }}
      transition={{ duration: 12, repeat: Infinity }}
      className="stroke-accent fill-none"
    >
      <circle cx="12" cy="12" r="10" strokeDasharray="5 4" />
    </motion.svg>
  );
}`;
    }
  };

  // Bespoke syntax tokenizer for the simulated IDE code card
  const highlightCode = (code: string) => {
    return code.split('\n').map((line, lineIdx) => {
      if (!line && lineIdx !== code.split('\n').length - 1) {
        return <div key={lineIdx} className="h-[1.12rem]">&nbsp;</div>;
      }
      
      const isLastLine = lineIdx === code.split('\n').length - 1;

      // Handle comments quickly
      if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
        return (
          <div key={lineIdx} className="h-[1.12rem] truncate text-ink-faint/50 italic">
            {line}
            {isLastLine && (
              <span className="inline-block w-[6px] h-3 bg-accent/80 align-middle ml-0.5 animate-pulse" />
            )}
          </div>
        );
      }

      const parts: React.ReactNode[] = [];
      let currentIdx = 0;
      
      // Token regex for strings, keywords, custom classes, custom variables/handlers, numbers, and brackets
      const regex = /("[^"]*"|'[^']*'|\/\/.*|\b(?:import|const|let|new|export|function|from|return|true|false)\b|\b(?:Soul|Art|CraftEngine|ActivePencil|motion)\b|\b[a-zA-Z_]\w*(?=\()|\b\d+\b)/g;
      
      let match;
      while ((match = regex.exec(line)) !== null) {
        const matchText = match[0];
        const matchIdx = match.index;
        
        if (matchIdx > currentIdx) {
          parts.push(line.substring(currentIdx, matchIdx));
        }
        
        if (matchText.startsWith('"') || matchText.startsWith("'")) {
          // String literal - glowing soft purple lavender/rose tone
          parts.push(<span key={matchIdx} className="text-[#F472B6]">{matchText}</span>);
        } else if (/^(?:import|const|let|new|export|function|from|return|true|false)$/.test(matchText)) {
          // Keywords - bright signature accent
          parts.push(<span key={matchIdx} className="text-accent font-semibold">{matchText}</span>);
        } else if (/^(?:Soul|Art|CraftEngine|ActivePencil|motion)$/.test(matchText)) {
          // Tech constructs - vibrant material cyan
          parts.push(<span key={matchIdx} className="text-[#38BDF8] font-semibold">{matchText}</span>);
        } else if (/^\d+$/.test(matchText)) {
          // Numbers - golden yellow
          parts.push(<span key={matchIdx} className="text-amber-300 font-medium">{matchText}</span>);
        } else {
          // Method triggers - deep royal/indigo glow tint
          parts.push(<span key={matchIdx} className="text-[#A78BFA] font-medium">{matchText}</span>);
        }
        
        currentIdx = regex.lastIndex;
      }
      
      if (currentIdx < line.length) {
        parts.push(line.substring(currentIdx));
      }

      return (
        <div key={lineIdx} className="h-[1.12rem] truncate">
          {parts}
          {isLastLine && (
            <span className="inline-block w-[6px] h-3 bg-accent/80 align-middle ml-0.5 animate-pulse" />
          )}
        </div>
      );
    });
  };

  return (
    <header 
      className="min-h-[75vh] lg:min-h-[75vh] grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-center max-w-[1200px] mx-auto px-6 md:px-12 pt-32 md:pt-40 pb-8 md:pb-12 relative isolate text-left gpu overflow-hidden" 
      id="hero"
    >
      {/* Hand-drawn blueprint/draft guidelines background floating organically */}
      <div className="absolute inset-0 pointer-events-none opacity-20 select-none z-0">
        <svg viewBox="0 0 1000 500" className="w-full h-full text-accent/15 stroke-current" fill="none" strokeWidth="1" strokeLinecap="round">
          {/* Main design line curves */}
          <path d="M 50,150 Q 300,50 500,180 T 950,160" strokeDasharray="4,8" />
          <path d="M 120,240 Q 350,120 520,250 T 880,210" strokeDasharray="1,6" className="opacity-60" />
          {/* Geometric plotting markers */}
          <circle cx="820" cy="180" r="80" strokeDasharray="3,10" />
          <circle cx="150" cy="350" r="40" strokeDasharray="2,6" />
          <line x1="720" y1="180" x2="920" y2="180" strokeDasharray="4 4" />
          <line x1="820" y1="80" x2="820" y2="280" strokeDasharray="4 4" />
        </svg>
      </div>

      {/* LEFT COLUMN: Narrative description & Interactive links */}
      <motion.div 
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-start gap-6 md:gap-7 relative z-10 w-full text-left"
      >
        <div className="flex items-center gap-4">
           {/* Beautiful rustic avatar block */}
           <div className="w-[72px] h-[72px] md:w-[84px] md:h-[84px] rounded-[24%] overflow-hidden relative shrink-0 shadow-lg group transition-transform duration-300 hover:scale-104 gpu">
              <img
                src={avatarUrl && avatarUrl.trim() !== '' ? avatarUrl : avatarImg}
                alt="Aayu"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover block group-hover:scale-105 transition-transform duration-500 ease-out will-change-transform"
              />
              <div className="absolute inset-0 border border-accent/15 rounded-[24%] pointer-events-none group-hover:border-accent/40 transition-colors" />
           </div>

           <div className="flex flex-col ml-2 border-l-2 border-pencil-light/40 pl-4 py-1 justify-center gap-[2px] italic">
             <span className="font-mono text-[0.68rem] text-ink tracking-[0.25em] uppercase font-bold opacity-90">Developer</span>
             <div className="flex items-center relative -ml-[17px]">
               <div className="w-3 h-[2px] bg-accent/60 mr-2" />
               <span className="font-mono text-accent text-[0.9rem] font-bold leading-none">×</span>
             </div>
             <span className="font-mono text-[0.68rem] text-ink tracking-[0.25em] uppercase font-bold opacity-90">Artist</span>
           </div>
        </div>

        {/* Brand Display Name with Interactive Typography Particles */}
        <div className="w-full max-w-[340px] sm:max-w-[450px] md:max-w-xl select-none mt-1">
          <AayuParticleText isLoading={isLoading} />
        </div>

        {/* Kathmandu Live Clock */}
        <div className="flex flex-col gap-4 max-w-[500px] w-full mt-1">
          {kathmanduTime && (
            <div className="flex flex-wrap items-center gap-2 select-none cursor-default">
              <span className="flex items-center gap-1.5 font-mono text-[0.68rem] font-bold text-accent px-3 py-1 bg-accent/8 border-l-2 border-accent rounded-r-md uppercase tracking-wider shadow-2xs">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
                </span>
                Kathmandu: {kathmanduTime}
              </span>
              
              {liveStatus && (
                <span className="flex items-center gap-1.5 font-mono text-[0.68rem] font-bold text-ink px-3 py-1 bg-pencil-light/10 border border-pencil-light/30 rounded-md tracking-wider shadow-2xs">
                  {liveStatus}
                </span>
              )}
            </div>
          )}

          {/* Core Handcrafted Philosophy Statement */}
          <p className="font-kalam text-[15.52px] leading-[1.62] text-ink-dim/95 tracking-wider font-light">
            I weave <span className="text-ink font-bold hover:text-accent duration-200 transition-colors select-none">logic into motion</span> and <span className="text-ink font-bold hover:text-accent duration-200 transition-colors select-none">code into art</span>, designing responsive digital spaces with a <span className="font-marker text-accent text-[1.08em] whitespace-nowrap inline-block -rotate-2 hover:rotate-0 transition-all duration-300 cursor-default select-none">handmade soul</span>.
          </p>
        </div>

        {/* Call to Actions & Interactions */}
        <div className="flex flex-wrap items-center gap-4 mt-3">
          <a
             href="#work"
             onClick={(e) => { e.preventDefault(); smoothScrollTo('work'); }}
             className="group relative inline-flex items-center gap-2.5 py-2.5 px-7 font-hand font-bold text-pencil-dark bg-accent rounded-xl transition-all duration-200 hover:-translate-y-[2px] border-2 border-solid border-pencil-light hover:border-accent text-[0.95rem] select-none cursor-pointer"
             style={{ clipPath: 'polygon(0% 2%, 2% 0%, 98% 1%, 100% 4%, 99% 96%, 98% 100%, 2% 99%, 0% 96%)' }}
          >
            Explore Projects
            <span className="group-hover:translate-x-0.5 transition-transform duration-300">
              →
            </span>
          </a>
          
          <div className="flex items-center gap-4.5">
            <a
               href="#contact"
               onClick={(e) => { e.preventDefault(); smoothScrollTo('contact'); }}
               className="flex items-center gap-2 py-2.5 px-5.5 font-hand text-ink-dim border-2 border-solid border-pencil-light shadow-[4px_4px_0_0_var(--color-pencil-light)] rounded-xl transition-all duration-150 hover:bg-white/5 hover:text-ink hover:-translate-y-[2px] hover:-translate-x-[2px] hover:shadow-[6px_6px_0_0_var(--color-accent)] hover:border-accent text-[0.95rem] cursor-pointer"
            >
               Say Hello
            </a>

            <div className="flex gap-[0.4rem]">
              {[
                { icon: <Github size={14} />, url: 'https://github.com/meaayu', label: 'GitHub' },
                { icon: <Mail size={14} />, url: 'mailto:itsaayush.m@gmail.com', label: 'Email' }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener"
                  aria-label={social.label}
                  className="w-[34px] h-[34px] flex items-center justify-center border border-dashed border-ink/25 text-ink-dim rounded-sm transition-all duration-150 hover:text-accent hover:border-accent hover:bg-accent/5 hover:-translate-y-0.5 btn-sketch-hover"
                  style={{ clipPath: 'polygon(0% 6%, 2% 0%, 98% 1%, 100% 6%, 99% 94%, 97% 100%, 3% 99%, 0% 94%)' }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-14 sm:mt-16 flex items-start auto-cols-auto gap-3 relative pointer-events-none"
        >
          <div className="flex flex-col items-center gap-1.5 opacity-60">
            <span className="font-hand text-[0.85rem] text-ink-dim uppercase tracking-[0.2em] -ml-2">Scroll To Explore</span>
            <svg width="24" height="40" viewBox="0 0 100 150" className="text-accent origin-top animate-pulse" xmlns="http://www.w3.org/2000/svg">
              {/* Hand-drawn curly arrow down */}
              <path d="M 50,10 C 60,40 20,80 50,130" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M 35,115 L 50,135 L 75,110" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
        </motion.div>
      </motion.div>

      {/* RIGHT COLUMN: Overlapping, Beautifully Interactive Code & Calibration Card Deck */}
      <div 
        className="hidden md:flex relative items-center justify-center h-[380px] md:h-full mt-6 md:mt-0 min-h-[380px] md:min-h-[460px] md:pl-10"
        onMouseLeave={() => {
          setHoveredCard(null);
        }}
      >
        {/* Notebook rings drafting line anchoring side view */}
        <div className="absolute top-[5%] left-0 w-[95%] h-[88%] border-l-2 border-dashed border-accent/15 pointer-events-none select-none z-0" />

        <div className="relative w-full max-w-[420px] h-full flex items-center justify-center">
          
          {/* Paperclip design ornament */}
          <div className="absolute top-[-25px] right-[45px] z-40 rotate-[-12deg] pointer-events-none select-none text-accent/30 hover:text-accent/60 transition-colors">
            <svg width="28" height="42" viewBox="0 0 24 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12,4 L12,30 A6,6 0 0,0 24,30 L24,12 A3,3 0 0,0 18,12 L18,26 A1,1 0 0,0 20,26 L20,14" />
            </svg>
          </div>

          {/* --- LAYER 1: THE INSPIRATIONAL QUOTES CARD --- */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              rotate: hoveredCard === 'sketch' ? -1 : (hoveredCard === 'code' ? -9 : -5),
              scale: hoveredCard === 'sketch' ? 1.04 : (hoveredCard === 'code' ? 0.96 : 1),
              x: hoveredCard === 'sketch' ? -8 : (hoveredCard === 'code' ? -18 : 0),
              y: hoveredCard === 'sketch' ? -3 : (hoveredCard === 'code' ? 10 : 0),
              zIndex: hoveredCard === 'sketch' ? 30 : 10
            }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            onMouseEnter={() => {
              setHoveredCard('sketch');
            }}
            className="absolute w-[295px] h-[395px] bg-paper border border-pencil-light/40 shadow-xl rounded-sm p-5 pr-6 pl-8 overflow-hidden group/sketch cursor-default gpu will-change-transform flex flex-col justify-between"
          >
            {/* Fine graph grid layer for draft paper feel */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
              backgroundImage: 'radial-gradient(var(--color-accent) 0.7px, transparent 0.7px)',
              backgroundSize: '12px 12px'
            }} />

            {/* Loose-leaf paper red margin rule */}
            <div className="absolute top-0 bottom-0 left-[1.95rem] w-[1px] bg-red-500/18 pointer-events-none select-none" />

            {/* Punched notebook spiral rings holes */}
            <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-around py-12 pointer-events-none select-none z-20">
              <div className="w-2.5 h-2.5 rounded-full bg-charcoal-warm/95 border border-pencil-light/60 shadow-inner" />
              <div className="w-2.5 h-2.5 rounded-full bg-charcoal-warm/95 border border-pencil-light/60 shadow-inner" />
              <div className="w-2.5 h-2.5 rounded-full bg-charcoal-warm/95 border border-pencil-light/60 shadow-inner" />
            </div>

            {/* Inked specimen stamp watermark ornament in bottom center */}
            <div className="absolute bottom-16 right-5 w-14 h-14 rounded-full border border-dashed border-accent/22 flex items-center justify-center -rotate-12 select-none pointer-events-none opacity-40">
              <div className="text-[0.43rem] font-mono text-accent text-center font-bold tracking-tighter leading-none">
                AAYU<br/>SPEC<br/>★ OK ★
              </div>
            </div>

            <div className="absolute top-1.5 right-3 left-3 flex items-center justify-between border-b border-pencil-light/20 pb-1.5 opacity-65 select-none pl-[1.2rem]">
              <div className="flex items-center gap-1.5">
                <Sparkles size={10} className="text-accent animate-pulse" />
                <span className="font-mono text-[0.6rem] text-accent font-bold uppercase tracking-wider">Mindful Drafts</span>
              </div>
              <span className="font-mono text-[0.52rem] text-ink-faint">
                {quoteIndex + 1} of {quotes.length}
              </span>
            </div>

            {/* Main Quote Content Zone - Ruled horizontal line backgrounds */}
            <div 
              className="flex-grow flex flex-col justify-center items-start pt-6 text-left relative z-10"
              style={{
                backgroundImage: 'linear-gradient(rgba(var(--color-pencil-light-rgb), 0.08) 1px, transparent 1px)',
                backgroundSize: '100% 27px',
              }}
            >
              <span className="font-marker text-[4rem] text-accent/10 leading-none h-4 -mt-2 -ml-1 select-none">
                “
              </span>
              <AnimatePresence mode="wait">
                <motion.div
                  key={quoteIndex}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4 w-full"
                >
                  <p className="font-caveat text-[1.4rem] text-ink leading-[27px] tracking-wide mt-2">
                    {quotes[quoteIndex].text}
                  </p>
                  <div className="flex items-center gap-1 ml-auto justify-end">
                    <span className="font-mono text-[0.55rem] uppercase tracking-widest text-accent/70">&mdash;</span>
                    <p className="font-caveat text-[1.2rem] text-accent italic font-medium">
                      {quotes[quoteIndex].author}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Quote controls bottom deck */}
            <div className="relative z-20 pt-4 border-t border-dashed border-pencil-light/30 flex items-center justify-end select-none">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setQuoteIndex((prev) => (prev + 1) % quotes.length);
                }}
                className="py-1 px-3 rounded-xs border border-accent/25 bg-accent/8 hover:bg-accent text-accent hover:text-pencil-dark font-hand font-bold text-[0.82rem] transition-all duration-200 cursor-pointer shadow-2xs flex items-center gap-1 active:scale-95"
                style={{ clipPath: 'polygon(1% 0%, 99% 2%, 98% 97%, 95% 100%, 3% 98%, 0% 4%)' }}
              >
                Next &rarr;
              </button>
            </div>
          </motion.div>

          {/* --- LAYER 2: THE INTERACTIVE CODE EMBED CARD --- */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              rotate: hoveredCard === 'code' ? 1 : (hoveredCard === 'sketch' ? 8 : 4),
              scale: hoveredCard === 'code' ? 1.04 : (hoveredCard === 'sketch' ? 0.96 : 1),
              x: hoveredCard === 'code' ? 8 : (hoveredCard === 'sketch' ? 18 : 0),
              y: hoveredCard === 'code' ? -3 : (hoveredCard === 'sketch' ? 10 : 0),
              zIndex: hoveredCard === 'code' ? 30 : 20
            }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            onMouseEnter={() => {
              setHoveredCard('code');
            }}
            className="absolute w-[300px] h-[400px] border border-pencil-light/50 shadow-2xl rounded-sm p-4.5 overflow-hidden font-mono cursor-default gpu will-change-transform flex flex-col"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-pencil-dark) 45%, var(--color-paper))' }}
          >
            {/* Interactive File tab selections */}
            <div className="flex items-center justify-between mb-3 border-b border-pencil-light/20 pb-2.5 select-none shrink-0">
              <div className="flex gap-1">
                {(['soul.ts', 'physics.css', 'canvas.tsx'] as const).map((tab) => {
                  const isActive = activeCodeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCodeTab(tab);
                      }}
                      className={`px-2.5 py-0.5 rounded text-[0.55rem] tracking-wide border transition-all cursor-pointer flex items-center gap-1 ${
                        isActive
                          ? 'bg-pencil-light/70 text-accent border-accent/30 shadow-xs'
                          : 'bg-transparent text-ink-faint border-transparent hover:text-ink hover:bg-pencil-light/20'
                      }`}
                    >
                      <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-accent' : 'bg-transparent'}`} />
                      {tab}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Glowing syntax code execution block with real typing content changes */}
            <div className="text-[0.62rem] text-ink-dim/90 leading-relaxed text-left flex-grow overflow-hidden focus:outline-none relative select-text">
               <AnimatePresence mode="wait">
                 <motion.div
                   key={activeCodeTab}
                   initial={{ opacity: 0, y: 4 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -4 }}
                   transition={{ duration: 0.18 }}
                   className="font-mono h-full"
                 >
                   {/* Adding real line numbers along side editor view */}
                   <div className="grid grid-cols-[16px_1fr] gap-2 h-full">
                     <div className="text-ink-faint/25 text-right select-none pr-1.5 border-r border-pencil-light/20 space-y-[0rem] h-full">
                       {getTabCode().split('\n').map((_, index) => (
                         <div key={index} className="h-[1.12rem]">{index + 1}</div>
                       ))}
                     </div>
                     <div className="whitespace-pre overflow-hidden h-full">
                       {highlightCode(getTabCode())}
                     </div>
                   </div>
                 </motion.div>
               </AnimatePresence>
            </div>


          </motion.div>

        </div>
      </div>



    </header>
  );
});
