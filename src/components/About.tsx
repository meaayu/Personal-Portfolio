import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';

const OBSESSIONS = [
  {
    name: "VS Code",
    tag: "Core Engine",
    index: "01",
    desc: "Where code breathes & warm custom syntax schemes keep eyes safe."
  },
  {
    name: "Figma",
    tag: "Design Canvas",
    index: "02",
    desc: "Translating organic pencil scribbles into crisp, modern vector logic."
  },
  {
    name: "Krita",
    tag: "Digital Ink",
    index: "03",
    desc: "Where my illustration tablet runs free with messy, high-energy strokes."
  },
  {
    name: "Blender",
    tag: "3D Space",
    index: "04",
    desc: "Low-poly viewport modeling, geometry node systems, and cozy renders."
  },
  {
    name: "Linux",
    tag: "System Soul",
    index: "05",
    desc: "A neat, distraction-free environment driven by personal dotfiles."
  }
];

export default function About() {
  const [activeIdx, setActiveIdx] = useState<number | null>(0);

  return (
    <motion.section 
      id="about" 
      className="py-28 md:py-36 max-w-[1100px] mx-auto px-6 md:px-12 relative isolate text-left"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] }}
    >
      
      {/* Blueprint background grid lines for a subtle design touch */}
      <div className="absolute inset-x-0 -top-12 h-px bg-linear-to-r from-transparent via-pencil-light/15 to-transparent pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-20 items-stretch">
        
        {/* Left Column: Cozy, airy, minimal presentation text */}
        <div className="flex flex-col justify-center gap-6 lg:max-w-[420px]">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex items-center gap-3 mb-1"
          >
            <span className="font-sans text-xs font-bold tracking-[0.2em] text-accent uppercase">03 / Profile</span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent/30" />
          </motion.div>

          <h2 className="font-marker text-[clamp(2.1rem,4.5vw,2.8rem)] text-ink leading-tight -tracking-tight">
            The Artisan Philosophy
          </h2>

          <p className="font-hand text-[1.18rem] md:text-[1.28rem] leading-[1.65] text-ink-dim font-medium italic border-l-4 border-accent/40 pl-5">
            "I write systems that feel human to touch. I construct layouts that choose raw character over sterile symmetry."
          </p>

          <p className="font-hand text-[1.05rem] md:text-[1.12rem] leading-relaxed text-ink-dim/80">
            Based in Kathmandu, Nepal, my craft exists at the intersection of robust web tech, fluid physics animation, and real-world vector art. No heavy layouts—just clean logic paired with a handmade soul.
          </p>


        </div>

        {/* Right Column: Minimalist interactive daily toolkit obsessions */}
        <div className="flex flex-col justify-between p-8 md:p-10 bg-paper-light border-2 border-pencil-light/60 rounded-2xl relative shadow-sm hover:shadow-md transition-all duration-300 flex-grow gpu">
          
          <div className="flex items-center justify-between border-b-2 border-dashed border-pencil-light/15 pb-4 mb-6 select-none">
            <span className="font-mono text-[0.65rem] font-black text-ink-faint uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={11} className="text-accent" />
              Active System Obsessions
            </span>
            <span className="font-mono text-[0.6rem] text-accent/80 font-bold bg-accent/5 px-2 py-0.5 rounded-sm">
              SELECT KEY
            </span>
          </div>

          {/* Interactive Compact Slot Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 select-none mb-6">
            {OBSESSIONS.map((item, idx) => (
              <button
                key={item.name}
                onClick={() => setActiveIdx(idx)}
                onMouseEnter={() => setActiveIdx(idx)}
                className={`px-2 py-4 rounded-xl border-2 font-hand text-[0.95rem] transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-1.5 text-center ${
                  activeIdx === idx
                    ? "bg-paper border-accent text-accent shadow-sm scale-[1.03] -translate-y-[2px]"
                    : "bg-paper/40 border-pencil-light/35 text-ink-dim hover:text-ink hover:border-pencil-light/75 hover:-translate-y-[1px]"
                }`}
              >
                <span className="font-mono text-[0.55rem] tracking-wider opacity-60 font-black">{item.index}</span>
                <span className="font-bold tracking-wide">{item.name}</span>
              </button>
            ))}
          </div>

          {/* Live Description Screen based on active slot Selection */}
          <div className="flex-grow flex items-center min-h-[110px] bg-charcoal-warm/30 rounded-xl p-5 border border-pencil-light/10">
            <AnimatePresence mode="wait">
              {activeIdx !== null && (
                <motion.div
                  key={activeIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="w-full text-left"
                >
                  <div className="flex items-baseline gap-2.5 mb-2 select-none">
                    <span className="font-marker text-[1.25rem] text-ink">{OBSESSIONS[activeIdx].name}</span>
                    <span className="font-mono text-[0.6rem] text-accent uppercase tracking-widest font-bold opacity-85">
                      // {OBSESSIONS[activeIdx].tag}
                    </span>
                  </div>
                  <p className="font-hand text-[1.05rem] md:text-[1.12rem] text-ink-dim leading-relaxed italic">
                    "{OBSESSIONS[activeIdx].desc}"
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Subtle signature metadata in card bottom */}
          <div className="mt-6 pt-4 border-t-2 border-dashed border-pencil-light/15 flex items-center justify-between font-mono text-[0.55rem] text-ink-faint select-none">
            <span>TOOLKIT_SYS_V2.0</span>
            <span className="flex items-center gap-1 text-accent opacity-80 group hover:translate-x-0.5 transition-transform duration-300">
              CRAFT OVER SYSTEM NOISE <ArrowRight size={10} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>

        </div>

      </div>

    </motion.section>
  );
}
