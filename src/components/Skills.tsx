import React, { useState, memo, useMemo } from 'react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SkillTag {
  name: string;
  level: number;
}

interface Skill {
  id: string;
  name: string;
  description: string;
  tags: SkillTag[];
  className?: string; // Add styling class back
  iconPath: string;
  specs: string; // Technical specification note for blueprint mode
}

const skills: Skill[] = [
  {
    id: '01',
    name: 'Development',
    description: 'Forging high-performance web applications, modular React engines, and responsive systems.',
    specs: 'React 18+ • TypeScript • Tailwind',
    tags: [
      { name: 'React', level: 95 },
      { name: 'TypeScript', level: 90 },
      { name: 'Node.js', level: 85 },
      { name: 'Tailwind CSS', level: 98 }
    ],
    iconPath: 'M4 8h28v18H4z M2 26h32 M11 15l3 3-3 3 M16 21h6'
  },
  {
    id: '02',
    name: 'Animation',
    description: 'Choreographing interactive motion systems, vector timelines, and fluid physics loops.',
    specs: 'Framer Motion • Vectors',
    tags: [
      { name: 'Framer', level: 96 },
      { name: 'SVG Physics', level: 88 },
      { name: '2D Timelines', level: 82 }
    ],
    iconPath: 'M5 8h26v20H5z M5 8h4v20H5z M27 8h4v20H27z M15 14l0 8l8-4z'
  },
  {
    id: '03',
    name: 'Illustration',
    description: 'Sketching expressive digital artwork, custom design lines, and handmade visual assets.',
    specs: 'Krita • Clip Studio',
    tags: [
      { name: 'Digital Painting', level: 85 },
      { name: 'Bezier Assets', level: 92 },
      { name: 'Vector Kit', level: 94 }
    ],
    iconPath: 'M24 4l8 8-16 16-10 2 2-10 16-16z M21 7l8 8'
  },
  {
    id: '04',
    name: 'Graphic Design',
    description: 'Designing high-contrast layouts, systematic grid rules, and elegant typography formulas.',
    specs: 'Figma • Layout Grids',
    tags: [
      { name: 'Figma System', level: 95 },
      { name: 'Grid Systems', level: 96 },
      { name: 'Typography', level: 90 }
    ],
    iconPath: 'M6 6h10v10H6z M20 6h10v10H20z M6 20h10v10H6z M20 20h10v10H20z'
  }
];

export default memo(function Skills() {
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);

  const activeSkill = useMemo(() => {
    if (hoveredSkillId) {
      return skills.find(s => s.id === hoveredSkillId) || skills[0];
    }
    return skills[0];
  }, [hoveredSkillId]);

  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, x: -16, y: 8 },
    show: { 
      opacity: 1, 
      x: 0, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 130,
        damping: 15
      }
    }
  } as const;

  return (
    <motion.section 
      id="skills" 
      className="pt-24 pb-20 max-w-[1100px] mx-auto px-5 md:px-10 relative isolate"
      initial={{ opacity: 0, filter: "blur(14px)", y: 45 }}
      whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      viewport={{ once: false, margin: "-120px" }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 md:gap-10 mb-12 md:mb-16 border-b border-pencil-light/30 pb-8">
        <div className="relative">
           <div className="flex items-center gap-3 mb-2">
              <div className="h-[1px] w-10 bg-accent/30" />
              <span className="font-hand text-[0.85rem] tracking-[0.3em] font-bold text-accent uppercase opacity-90">02 Toolkit</span>
           </div>
           <h2 className="font-marker text-[clamp(2.1rem,4.5vw,3.2rem)] text-ink leading-none -tracking-tight">Core Skills</h2>
        </div>
      </div>
 
      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 relative min-h-[50vh]">
        
        {/* Left Side: Scrollable List with Motion to enable staggered fade-in */}
        <motion.div 
          variants={listVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, margin: "-120px" }}
          className="flex flex-col gap-2 relative"
        >
           <div className="absolute top-0 bottom-0 left-[2.5rem] w-px bg-pencil-light/30 -z-10 hidden lg:block" />
           {skills.map((skill, index) => (
             <motion.button
               key={skill.id}
               variants={itemVariants}
               onMouseEnter={() => setHoveredSkillId(skill.id)}
               onFocus={() => setHoveredSkillId(skill.id)}
               whileHover={{ x: 6, transition: { duration: 0.2 } }}
               className={cn(
                 "group flex items-center gap-4 md:gap-6 py-3 md:py-5 px-4 rounded-xl transition-all duration-300 text-left outline-none border-2 border-transparent",
                 "hover:bg-paper focus-visible:border-accent hover:shadow-[4px_4px_0_0_var(--color-pencil-light)]",
                 activeSkill?.id === skill.id ? "opacity-100" : "opacity-50"
               )}
             >
               <span className={cn(
                 "font-mono text-sm font-bold w-6 hidden lg:block transition-colors duration-300",
                 activeSkill?.id === skill.id ? "text-accent" : "text-ink-dim"
               )}>
                 {skill.id}
               </span>
               <div className="flex flex-col gap-1 w-full relative">
                 <div className="flex justify-between items-center w-full">
                    <h3 className={cn(
                      "font-marker text-[1.2rem] md:text-[1.6rem] transition-colors duration-300 -tracking-wide truncate",
                      activeSkill?.id === skill.id ? "text-accent" : "text-ink"
                    )}>
                      {skill.name}
                    </h3>
                 </div>
                 
                 {/* Mobile inline details */}
                 <div className={cn(
                   "lg:hidden grid transition-all duration-500 ease-in-out",
                   activeSkill?.id === skill.id ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                 )}>
                   <div className="overflow-hidden">
                     <div className="pt-2">
                       <p className="font-hand text-base md:text-lg leading-relaxed text-ink-dim mb-2 line-clamp-2">
                         {skill.description}
                       </p>
                       <div className="flex flex-wrap gap-1.5">
                         {skill.tags.map((tag) => (
                           <span key={tag.name} className="font-mono text-[0.6rem] font-bold tracking-widest text-ink-dim bg-charcoal-warm/30 border border-pencil-light/50 px-2 py-1 rounded flex items-center gap-1.5">
                             {tag.name}
                           </span>
                         ))}
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             </motion.button>
           ))}
        </motion.div>

        {/* Right Side: Details Display */}
        <div className="lg:sticky lg:top-32 self-start hidden lg:flex flex-col justify-center h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSkill?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6 bg-paper-light border-2 border-pencil-light p-8 rounded-2xl shadow-[6px_6px_0_0_var(--color-pencil-light)]"
            >
               {activeSkill && (
                 <>
                   <div className="flex items-center gap-4 border-b-2 border-pencil-light/40 pb-5">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 relative overflow-hidden shrink-0",
                        "bg-accent border border-accent text-pencil-dark rotate-3"
                      )}>
                        <svg
                          viewBox="0 0 36 36"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.2"
                          strokeLinecap="round"
                          className="w-5 h-5"
                        >
                           <path d={activeSkill.iconPath} />
                        </svg>
                      </div>
                      <span className="font-hand font-bold text-[0.8rem] text-accent uppercase tracking-widest opacity-80">
                        {activeSkill.specs}
                      </span>
                   </div>

                   <p className="font-hand text-xl md:text-2xl leading-relaxed text-ink font-bold">
                     {activeSkill.description}
                   </p>

                   <div className="flex flex-col gap-3 mt-4">
                     {activeSkill.tags.map((tag, i) => (
                       <div key={tag.name} className="flex flex-col gap-1.5">
                         <div className="flex justify-between items-center">
                           <span className="font-mono text-xs font-bold tracking-widest text-ink">{tag.name}</span>
                           <span className="font-mono text-[0.6rem] text-ink-dim">{tag.level}%</span>
                         </div>
                         <div className="h-1.5 w-full bg-pencil-dark/20 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${tag.level}%` }}
                             transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                             className="h-full bg-accent/80 rounded-full"
                           />
                         </div>
                       </div>
                     ))}
                   </div>
                 </>
               )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
});
