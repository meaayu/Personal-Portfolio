import React, { useState, useMemo } from 'react';
import { PROJECTS } from '../constants';
import { ProjectData } from '../types';
import { cn } from '../lib/utils';
import { ExternalLink, Play, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProjectsProps {
  onOpenProject: (id: string) => void;
}

const MAIN_CATEGORIES = ['Dev', 'Art'] as const;

export default function Projects({ onOpenProject }: ProjectsProps) {
  const [activeTab, setActiveTab] = useState<'Dev' | 'Art'>('Dev');
  const [showAll, setShowAll] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
 
  // Filter projects first by main category
  const projectsInTab = useMemo(() => PROJECTS.filter(p => {
    if (activeTab === 'Dev') return p.category === 'Web Dev';
    return p.category !== 'Web Dev';
  }), [activeTab]);
  
  const DISPLAY_LIMIT = 6;
  const visibleProjects = useMemo(() => 
    showAll ? projectsInTab : projectsInTab.slice(0, DISPLAY_LIMIT),
    [showAll, projectsInTab]
  );
  const hasHiddenProjects = projectsInTab.length > DISPLAY_LIMIT && !showAll;
 
  const handleShowMore = () => {
    if (hasHiddenProjects) {
      setShowAll(true);
    } else {
      setToast("The dedicated archives are currently being sketched!");
      setTimeout(() => setToast(null), 3500);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <motion.section 
      id="work" 
      className="pt-24 pb-16 max-w-[1100px] mx-auto px-5 md:px-10"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] }}
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 md:gap-10 mb-12 md:mb-16 border-b border-pencil-light/30 pb-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="relative"
        >
           <div className="flex items-center gap-3 mb-2">
              <div className="h-[1px] w-10 bg-accent/30" />
              <span className="font-hand text-[0.85rem] tracking-[0.3em] font-bold text-accent uppercase opacity-90">02 Work</span>
           </div>
           <h2 className="font-marker text-[clamp(2.1rem,4.5vw,3.2rem)] text-ink leading-none -tracking-tight">Selected Work</h2>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Main Tactical Switcher */}
          <div className="flex p-1.5 bg-paper/90 border border-pencil-light/40 rounded-xl relative isolate w-full sm:w-auto shadow-inner">
            {MAIN_CATEGORIES.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                }}
                className={cn(
                  "relative z-10 flex-1 sm:flex-none px-6 md:px-8 py-2.5 font-marker text-[0.8rem] md:text-[0.9rem] tracking-widest transition-all duration-300 rounded-lg flex items-center justify-center gap-2 select-none cursor-pointer",
                  activeTab === tab ? "text-pencil-dark font-black" : "text-ink-dim hover:text-ink/80"
                )}
              >
                {activeTab === tab && (
                  <motion.div 
                    layoutId="main-tab-bg"
                    className="absolute inset-0 bg-accent shadow-sm -z-10 sketch-filter"
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

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 gpu"
        >
          {visibleProjects.map((project, index) => (
            <motion.div
              key={project.id}
              variants={itemVariants}
            >
              <ProjectCard
                project={project}
                index={index}
                onClick={() => onOpenProject(project.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      <motion.div 
        className="mt-16 flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
      >
        <button
          onClick={handleShowMore}
          className="group relative inline-flex items-center justify-center gap-3 py-3 px-8 font-hand text-[0.95rem] md:text-[1rem] font-bold text-ink border-2 border-pencil-light/40 rounded-sm hover:-translate-y-1 hover:border-accent hover:text-accent shadow-sm hover:shadow-[4px_4px_0_rgba(212,105,58,0.2)] transition-all overflow-hidden sketch-filter bg-paper/60 backdrop-blur-sm"
          style={{ clipPath: 'polygon(1% 0, 100% 1%, 99% 100%, 0 98%)' }}
        >
          <span className="relative z-10 flex items-center gap-2.5 tracking-widest uppercase mt-0.5">
            {hasHiddenProjects ? (
              <>
                <Sparkles size={16} className="opacity-70 group-hover:animate-pulse-subtle" />
                <span>Show More Projects</span>
              </>
            ) : (
              <>
                <span>View Archive</span>
                <ArrowRight size={16} className="opacity-70 group-hover:translate-x-1 transition-transform" />
              </>
            )}
            {!hasHiddenProjects && (
              <span className="text-[0.62rem] bg-accent/10 border border-accent/20 text-accent px-2 py-0.5 rounded tracking-normal -mt-0.5 whitespace-nowrap hidden sm:inline-block font-mono">
                COMING SOON
              </span>
            )}
          </span>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-accent)_0%,transparent_100%)] opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" />
        </button>
      </motion.div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9, rotate: -1.5 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9, rotate: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-[85px] left-4 right-4 md:left-auto md:bottom-10 md:right-32 z-[500] p-4 md:p-5 bg-paper-light border-2 border-accent text-ink rounded-lg shadow-[4px_4px_0_0_var(--color-accent)] sketch-filter flex flex-col gap-1.5 overflow-hidden mx-auto md:mx-0 max-w-[calc(100vw-2rem)] md:max-w-sm"
          >
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-accent" />
            <div className="flex justify-between items-center">
              <span className="font-mono text-[0.65rem] font-semibold text-accent tracking-wider uppercase">Notice</span>
            </div>
            <p className="font-hand text-[1rem] leading-relaxed text-ink-dim font-bold">{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

interface ProjectCardProps {
  project: ProjectData;
  index: number;
  onClick: () => void;
}

function ProjectCard({ project, index, onClick }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
      style={{ boxShadow: 'var(--shadow-card)' }}
      className={cn(
        "relative bg-paper-light rounded-2xl border-2 border-pencil-light/60 transition-all duration-300 cursor-pointer group flex flex-col h-full gpu overflow-hidden",
        "hover:[box-shadow:var(--shadow-hover)] hover:border-accent/40"
      )}
    >
      {/* Decorative Corner Fold (Subtle) */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none z-10 transition-transform duration-500 group-hover:scale-110">
        <div className="absolute top-0 right-0 w-full h-full bg-accent/5" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
      </div>

      <div className="absolute top-[0.85rem] left-[0.85rem] font-marker text-[0.85rem] text-accent bg-paper/95 border-2 border-accent/25 px-2.5 py-0.5 rounded-xl z-[4] shadow-sm select-none">
        #{index + 1}
      </div>

      {/* Show image/video media block if project has YouTube or images (Web Dev projects only) */}
      {project.category === 'Web Dev' && (project.youtube || (project.images && project.images.length > 0)) && (
        <div className={cn(
          "aspect-video overflow-hidden relative group/thumb border-b-2 border-pencil-light/50 shrink-0 bg-charcoal-warm rounded-t-[14px]",
          project.images && project.images.length > 1 && "grid grid-cols-3 grid-rows-2 gap-1 p-1 bg-pencil-dark/20"
        )}>
           {project.youtube ? (
              <div className="w-full h-full relative group-hover:scale-[1.02] transition-transform duration-700">
                {/* Improved Performance: Show thumbnail initially, load iframe only if needed or keep it lazy */}
                <img 
                  src={`https://img.youtube.com/vi/${project.youtube}/maxresdefault.jpg`}
                  alt={project.title}
                  loading="lazy"
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-accent/90 flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play size={20} fill="currentColor" className="ml-1" />
                  </div>
                </div>
                {isHovered && (
                   <iframe
                    className="absolute inset-0 w-full h-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    src={`https://www.youtube.com/embed/${project.youtube}?rel=0&modestbranding=1&playlist=${project.youtube}&loop=1&controls=0&mute=1&autoplay=1`}
                    title={project.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    tabIndex={-1}
                  />
                )}
              </div>
           ) : project.images && project.images.length > 1 ? (
              <>
               <div className="col-span-2 row-span-2 overflow-hidden relative rounded-sm">
                 <img 
                   src={project.images[0]} 
                   alt={`${project.title} 1`}
                   loading="lazy"
                   decoding="async"
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                 />
               </div>
               <div className="overflow-hidden relative rounded-sm">
                 <img 
                   src={project.images[1]} 
                   alt={`${project.title} 2`}
                   loading="lazy"
                   decoding="async"
                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                 />
               </div>
               <div className="overflow-hidden relative rounded-sm bg-accent/10 flex items-center justify-center">
                 {project.images[2] ? (
                   <img 
                     src={project.images[2]} 
                     alt={`${project.title} 3`}
                     loading="lazy"
                     decoding="async"
                     className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000"
                   />
                 ) : (
                   <span className="font-marker text-accent/20 text-3xl select-none">+</span>
                 )}
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="font-mono text-[0.5rem] text-white tracking-widest">+{project.images.length - 2}</span>
                 </div>
               </div>
             </>
           ) : (
             <img 
               src={project.images[0]} 
               alt={project.title}
               referrerPolicy="no-referrer"
               loading="lazy"
               decoding="async"
               className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:opacity-60 brightness-[1.02] contrast-[0.98]"
             />
           )}

           {/* Refined Hover Overlay */}
           <div className="absolute inset-0 flex items-center justify-center bg-accent/0 group-hover:bg-accent/10 transition-all duration-500 pointer-events-none">
              <span className="font-mono text-[0.68rem] font-bold tracking-wider uppercase text-white px-4 py-2 border border-white/20 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                 View Project
              </span>
           </div>
        </div>
      )}

      {/* Fallback for no media/image (Web Dev only) */}
      {project.category === 'Web Dev' && !project.youtube && (!project.images || project.images.length === 0) && (
        <div className="aspect-video overflow-hidden relative group/thumb border-b-2 border-pencil-light/50 shrink-0 bg-charcoal-warm rounded-t-[14px]">
          <div className="w-full h-full flex items-center justify-center text-ink-faint relative isolate">
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--color-accent) 0.5px, transparent 0.5px)', backgroundSize: '10px 10px' }} />
            <span className="font-marker opacity-10 text-6xl select-none text-accent transition-all duration-700 group-hover:opacity-20 group-hover:scale-110">{project.title.charAt(0)}</span>
          </div>
        </div>
      )}

      <div className="p-6 md:p-8 flex-1 flex flex-col relative">
        <div className="flex flex-col gap-1.5 mb-5 relative z-10">
          <div className="flex justify-between items-start gap-4">
            <h3 className="font-marker text-[1.22rem] md:text-[1.4rem] text-ink leading-tight group-hover:text-accent transition-colors duration-300 -tracking-wide">{project.title}</h3>
            <span className="font-mono text-[0.58rem] font-bold tracking-widest text-accent bg-accent/5 border border-accent/25 px-2 py-0.5 rounded-sm self-start mt-0.5 select-none">
              {project.category.toUpperCase()}
            </span>
          </div>
          <div className="h-[2px] w-0 bg-accent group-hover:w-12 transition-all duration-500 opacity-60" />
        </div>

        <p className="font-hand text-[0.92rem] md:text-[1rem] leading-relaxed text-ink-dim mb-6 line-clamp-3 opacity-85 group-hover:opacity-100 transition-opacity">
          {project.desc}
        </p>

        <div className="flex flex-wrap gap-2 mb-8 mt-auto">
          {project.tags.map((tag) => (
            <span key={tag} className={cn(
              "font-hand text-[0.8rem] font-semibold text-ink-dim/90 bg-charcoal-warm/40 border border-pencil-light/50 px-2.5 py-1 rounded-lg transition-all duration-300 hover:bg-accent/5 hover:text-accent hover:border-accent/40"
            )}>
              {tag}
            </span>
          ))}
        </div>

        <div className="pt-5 border-t-2 border-dashed border-pencil-light/15 flex justify-end items-center text-ink-faint">
           <div className="w-9 h-9 rounded-xl border border-pencil-light/45 flex items-center justify-center opacity-50 group-hover:opacity-100 group-hover:border-accent group-hover:bg-accent/5 transition-all duration-300 animate-pulse-subtle">
             <ExternalLink size={14} className="text-ink-dim group-hover:text-accent transition-colors duration-300" />
           </div>
        </div>
      </div>
    </motion.div>
  );
}
