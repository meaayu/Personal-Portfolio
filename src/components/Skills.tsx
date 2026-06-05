import React, { useState, memo } from 'react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { PenTool, Eye } from 'lucide-react';

interface SkillTag {
  name: string;
  level: number; // 0 to 100
}

interface Skill {
  id: string;
  name: string;
  description: string;
  tags: SkillTag[];
  iconPath: string;
  specs: string; // Technical specification note for blueprint mode
}

const skills: Skill[] = [
  {
    id: '01',
    name: 'Development',
    description: 'Forging high-performance web applications, modular React engines, and responsive systems.',
    specs: 'React 18+ • TypeScript • Tailwind • Vite',
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
    specs: 'Framer Motion • WebAnimations • SVG',
    tags: [
      { name: 'Framer Motion', level: 96 },
      { name: 'SVG Physics', level: 88 },
      { name: '2D Timelines', level: 82 },
      { name: 'Keyframing', level: 90 }
    ],
    iconPath: 'M5 8h26v20H5z M5 8h4v20H5z M27 8h4v20H27z M15 14l0 8l8-4z'
  },
  {
    id: '03',
    name: 'Illustration',
    description: 'Sketching expressive digital artwork, custom design lines, and handmade visual assets.',
    specs: 'Krita • Clip Studio • Bezier Vectors • Sketch',
    tags: [
      { name: 'Digital Painting', level: 85 },
      { name: 'Bezier Assets', level: 92 },
      { name: 'UI Vector Kit', level: 94 },
      { name: 'Krita / Clip', level: 80 }
    ],
    iconPath: 'M24 4l8 8-16 16-10 2 2-10 16-16z M21 7l8 8'
  },
  {
    id: '04',
    name: 'Graphic Design',
    description: 'Designing high-contrast layouts, systematic grid rules, and elegant typography formulas.',
    specs: 'Figma • Layout Grids • Corporate Identity',
    tags: [
      { name: 'Figma System', level: 95 },
      { name: 'UI/UX Layout', level: 92 },
      { name: 'Grid Systems', level: 96 },
      { name: 'Typography', level: 90 }
    ],
    iconPath: 'M6 6h10v10H6z M20 6h10v10H20z M6 20h10v10H6z M20 20h10v10H20z'
  }
];

export default memo(function Skills() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <motion.section 
      id="skills" 
      className="pt-8 pb-20 max-w-[1150px] mx-auto px-6 sm:px-10 relative isolate"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] }}
    >
      {/* Header and Live Controls */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="relative inline-block"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-[2px] w-8 bg-accent/40" />
            <span className="font-hand text-[0.8rem] tracking-[0.25em] font-bold text-accent uppercase opacity-95">01 Specifications</span>
          </div>
          <h2 className="font-marker text-[clamp(2.1rem,4.5vw,3.2rem)] text-ink leading-none -tracking-tight">
            What I Craft
          </h2>
        </motion.div>
      </div>
 
      {/* Skills Grid */}
      <div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
      >
        {skills.map((skill, index) => (
          <motion.div
            key={skill.id}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={() => setHoveredCard(skill.id)}
            onMouseLeave={() => setHoveredCard(null)}
            className={cn(
              "group relative bg-paper-light p-6 sm:p-8 rounded-2xl transition-all duration-400 border-2 overflow-hidden",
              "border-solid border-pencil-light shadow-[6px_6px_0_0_var(--color-pencil-light)] hover:border-accent hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_0_var(--color-accent)]"
            )}
          >
            {/* Skill Identifier Tag */}
            <div className="absolute top-5 right-6 flex items-baseline gap-1 select-none">
              <span className="font-marker text-[2rem] text-accent/10 leading-none transition-all duration-500 group-hover:text-accent/20">
                {skill.id}
              </span>
            </div>
 
            {/* Main Title & Description Content Block */}
            <div className="flex flex-col gap-3 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 relative overflow-hidden shrink-0",
                  "bg-pencil-light/10 border border-pencil-light/20 text-ink-dim group-hover:bg-accent group-hover:border-accent group-hover:text-pencil-dark group-hover:rotate-6"
                )}>
                  <svg
                    viewBox="0 0 36 36"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    className="w-6 h-6 transition-transform"
                  >
                     <path d={skill.iconPath} />
                  </svg>
                </div>
                
                <div className="flex flex-col">
                  <span className={cn(
                    "font-marker text-[1.2rem] text-ink transition-colors -tracking-wide",
                    "group-hover:text-accent"
                  )}>
                    {skill.name}
                  </span>
                </div>
              </div>
 
              {/* Description */}
              <p className="font-hand text-[0.98rem] text-ink-dim/95 leading-relaxed pr-6 italic">
                {skill.description}
              </p>
            </div>
 
            {/* Interactive Grid Spec (Mastery metrics / Tool boxes) */}
            <div className="mt-5 pt-4 border-t-2 border-dashed border-pencil-light/15 relative z-10 flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {skill.tags.map((tag, i) => (
                  <span 
                    key={tag.name} 
                    className="font-hand text-[0.82rem] font-semibold text-ink-dim/90 bg-charcoal-warm/40 border border-pencil-light/50 rounded-lg px-2.5 py-1 transition-all duration-300 hover:text-accent hover:border-accent/40 cursor-default"
                    style={{ transitionDelay: `${i * 20}ms` }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
});

