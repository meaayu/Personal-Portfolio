import React, { useState, useMemo, memo } from 'react';
import { PROJECTS as ALL_PROJECTS } from '../constants';
import { ProjectData } from '../types';
import { cn } from '../lib/utils';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProjectsProps {
  projects?: ProjectData[];
  onOpenProject: (id: string) => void;
}

const MAIN_CATEGORIES = ['Dev', 'Art'] as const;

export default memo(function Projects({ projects = ALL_PROJECTS, onOpenProject }: ProjectsProps) {
  const [activeTab, setActiveTab] = useState<'Dev' | 'Art'>('Dev');
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);

  // Filter projects first by main category
  const projectsInTab = useMemo(() => projects.filter(p => {
    if (activeTab === 'Dev') return p.category === 'Web Dev';
    return p.category !== 'Web Dev';
  }), [activeTab, projects]);
  
  const activeProject = useMemo(() => {
    if (hoveredProjectId) {
      return projectsInTab.find(p => p.id === hoveredProjectId) || projectsInTab[0];
    }
    return projectsInTab[0];
  }, [hoveredProjectId, projectsInTab]);

  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
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
      id="work" 
      className="pt-24 pb-16 max-w-[1100px] mx-auto px-5 md:px-10"
      initial={{ opacity: 0, filter: "blur(14px)", y: 45 }}
      whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      viewport={{ once: false, margin: "-120px" }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 md:gap-10 mb-12 md:mb-16 border-b border-pencil-light/30 pb-8">
        <div className="relative">
           <div className="flex items-center gap-3 mb-2">
              <div className="h-[1px] w-10 bg-accent/30" />
              <span className="font-hand text-[0.85rem] tracking-[0.3em] font-bold text-accent uppercase opacity-90">02 Work</span>
           </div>
           <h2 className="font-marker text-[clamp(2.1rem,4.5vw,3.2rem)] text-ink leading-none -tracking-tight">Selected Work</h2>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Main Tactical Switcher */}
          <div className="flex p-1.5 bg-paper/90 border border-pencil-light/40 rounded-xl relative isolate w-full sm:w-auto shadow-inner">
            {MAIN_CATEGORIES.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setHoveredProjectId(null);
                }}
                className={cn(
                  "relative z-10 flex-1 sm:flex-none px-6 md:px-8 py-2.5 font-marker text-[0.8rem] md:text-[0.9rem] tracking-widest transition-all duration-300 rounded-lg flex items-center justify-center gap-2 select-none cursor-pointer",
                  activeTab === tab ? "text-pencil-dark font-black" : "text-ink-dim hover:text-ink/80"
                )}
               >
                {activeTab === tab && (
                  <motion.div 
                    layoutId="main-tab-bg"
                    className="absolute inset-0 bg-accent shadow-sm -z-10"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    style={{ clipPath: 'polygon(1.5% 2.5%, 98.5% 1.5%, 100% 97.5%, 0% 96.5%)' }}
                  />
                )}
                {tab === 'Dev' ? 'DEVELOPMENT' : 'CREATIVE'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 relative min-h-[50vh]">
        {/* Left Side: Scrollable List with Motion key for smooth stagger switches */}
        <motion.div 
          key={activeTab}
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-2 relative"
        >
           <div className="absolute top-0 bottom-0 left-[2.5rem] w-px bg-pencil-light/30 -z-10 hidden lg:block" />
           {projectsInTab.map((project, index) => (
             <motion.button
               key={project.id}
               variants={itemVariants}
               onMouseEnter={() => setHoveredProjectId(project.id)}
               onFocus={() => setHoveredProjectId(project.id)}
               onClick={() => onOpenProject(project.id)}
               whileHover={{ x: 6, transition: { duration: 0.2 } }}
               className={cn(
                 "group flex items-center gap-4 md:gap-6 py-3 md:py-5 px-4 rounded-xl transition-all duration-300 text-left outline-none border-2 border-transparent",
                 "hover:bg-paper focus-visible:border-accent hover:shadow-[4px_4px_0_0_var(--color-pencil-light)] lg:hover:opacity-100",
                 activeProject?.id === project.id ? "opacity-100" : "opacity-100 lg:opacity-50"
               )}
             >
               <span className={cn(
                 "font-mono text-sm font-bold w-6 hidden lg:block transition-colors duration-300",
                 activeProject?.id === project.id ? "text-accent" : "text-ink-dim"
               )}>
                 {String(index + 1).padStart(2, '0')}
               </span>
               <div className="flex flex-col gap-1 w-full relative">
                 <div className="flex justify-between items-center w-full">
                    <h3 className={cn(
                      "font-marker text-[1.2rem] md:text-[1.6rem] transition-colors duration-300 -tracking-wide truncate",
                      activeProject?.id === project.id ? "text-ink lg:text-accent" : "text-ink group-hover:text-accent"
                    )}>
                      {project.title}
                    </h3>
                    <div className={cn(
                      "opacity-0 transition-opacity duration-300 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 text-ink-dim"
                    )}>
                       <ArrowRight size={20} />
                    </div>
                 </div>
                 
                 {/* Mobile inline details */}
                 <div className={cn(
                   "lg:hidden grid transition-all duration-500 ease-in-out grid-rows-[1fr] opacity-100"
                 )}>
                   <div className="overflow-hidden">
                     <div className="pt-2 flex flex-col gap-2">
                       <div className="flex flex-wrap gap-1.5">
                         {project.tags.slice(0, 3).map((tag) => (
                           <span key={tag} className="font-mono text-[0.6rem] font-bold tracking-widest text-ink-dim bg-charcoal-warm/30 border border-pencil-light/50 px-2 py-1 rounded">
                             {tag}
                           </span>
                         ))}
                         {project.tags.length > 3 && (
                           <span className="font-mono text-[0.6rem] font-bold tracking-widest text-ink-dim bg-charcoal-warm/30 border border-pencil-light/50 px-2 py-1 rounded">
                             +{project.tags.length - 3}
                           </span>
                         )}
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
               key={activeProject?.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               transition={{ duration: 0.3 }}
               className="flex flex-col gap-6 bg-paper-light border-2 border-pencil-light p-8 rounded-2xl shadow-[6px_6px_0_0_var(--color-pencil-light)]"
             >
                {activeProject && (
                  <>
                    <div className="flex items-center gap-4 border-b-2 border-pencil-light/40 pb-5">
                       <span className="font-mono text-xs font-bold tracking-widest text-accent bg-accent/10 px-3 py-1 rounded">
                         {activeProject.category.toUpperCase()}
                       </span>
                    </div>

                    {activeProject.images && activeProject.images.length > 0 && (
                      <div className="w-full aspect-video rounded-xl overflow-hidden border-2 border-pencil-light/40 shadow-sm relative group overflow-hidden">
                        <img 
                          src={activeProject.images[0]} 
                          alt={activeProject.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors z-10" />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 mt-4">
                      {activeProject.tags.map((tag) => (
                        <span key={tag} className="font-mono text-xs font-bold tracking-widest text-ink bg-charcoal-warm/50 border border-pencil-light px-3 py-1.5 rounded-lg">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-6 pt-5 border-t-2 border-pencil-light/40 flex justify-between items-center group cursor-pointer" onClick={() => activeProject && onOpenProject(activeProject.id)}>
                       <button className="font-marker text-[1.1rem] text-ink group-hover:text-accent transition-colors flex items-center gap-2">
                          Explore Project
                          <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                       </button>
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
