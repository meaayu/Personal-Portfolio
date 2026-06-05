import React, { useEffect, useState, useRef, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink, Play, Clock } from 'lucide-react';
import { ProjectData } from '../types';
import { cn, throttle } from '../lib/utils';
import { motion, AnimatePresence, useScroll, useSpring, useTransform, useDragControls } from 'motion/react';
import { usePerformanceMode } from '../hooks/usePerformanceMode';

interface ProjectModalProps {
  project: ProjectData | null;
  onClose: () => void;
  onNavigate: (dir: number) => void;
  projectIndex: number;
  totalProjects: number;
}

export default function ProjectModal({ project, onClose, onNavigate, projectIndex, totalProjects }: ProjectModalProps) {
  const images = project?.images || [];
  const { liteMode } = usePerformanceMode();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  
  // Calculate average reading time dynamically based on the total content of the project
  const readingTime = useMemo(() => {
    if (!project) return 0;
    
    let text = `${project.category || ''} ${project.title || ''} ${project.desc || ''}`;
    
    if (project.items) {
      project.items.forEach(item => {
        text += ` ${item.title || ''} ${item.body || ''}`;
      });
    }
    
    if (project.process) {
      project.process.forEach(step => {
        text += ` ${step || ''}`;
      });
    }
    
    if (project.footerNote) {
      text += ` ${project.footerNote}`;
    }
    
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    // Standard adult reading speed is ~200 WPM
    return Math.max(1, Math.ceil(words / 200));
  }, [project]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [containerNode, setContainerNode] = useState<HTMLDivElement | null>(null);
  const dragControls = useDragControls();

  // Framer Motion Scroll Progress for better performance (no state re-renders)
  const { scrollYProgress } = useScroll({
    container: containerNode ? { current: containerNode } : undefined,
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const checkMobile = throttle(() => {
      setIsMobile(window.innerWidth < 768);
    }, 200);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (project) {
      setActiveImageIdx(0);
      setIsLightboxOpen(false);
      setIsPlayingVideo(false);
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }
  }, [project]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isLightboxOpen) setIsLightboxOpen(false);
        else onClose();
      }
      if (e.key === 'ArrowRight') {
        if (isLightboxOpen) setActiveImageIdx(p => (p + 1) % images.length);
        else onNavigate(1);
      }
      if (e.key === 'ArrowLeft') {
        if (isLightboxOpen) setActiveImageIdx(p => (p - 1 + images.length) % images.length);
        else onNavigate(-1);
      }
    };
    if (project) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [project, onClose, onNavigate, isLightboxOpen, images.length]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    
    // Use a separate throttled function for state updates
    debouncedScrollCheck(scrollTop);
  };

  const debouncedScrollCheck = useMemo(() => throttle((scrollTop: number) => {
    const currentScrolled = scrollTop > 50;
    if (currentScrolled !== isScrolled) {
      setIsScrolled(currentScrolled);
    }
  }, 100), [isScrolled]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div 
          exit={{ opacity: 1, transition: { duration: 0.4 } }}
          className={cn(
          "fixed inset-0 z-[1000] flex overflow-hidden",
          isMobile ? "items-end" : "justify-end"
        )}>
          {/* Isolation Layer - Darkened backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 z-0 cursor-zoom-out gpu transition-all duration-300 backdrop-blur-sm"
          />
 
          {/* Creative Studio Drawer */}
          <motion.div
            initial={isMobile ? { y: '100%' } : { x: '100%', opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            exit={isMobile ? { y: '100%' } : { x: '100%', opacity: 0 }}
            transition={isMobile 
              ? { type: "spring", damping: 25, stiffness: 300, mass: 0.8 } 
              : { type: "spring", damping: 30, stiffness: 300 }
            }
            drag={isMobile ? "y" : "x"}
            dragControls={dragControls}
            dragListener={!isMobile} // Disable default drag listener on mobile so only the grabber initiates drag
            dragConstraints={isMobile ? { top: 0, bottom: 0 } : { left: 0, right: 0 }}
            dragElastic={isMobile ? { top: 0, bottom: 0.8 } : 0.1}
            onDragEnd={(_, info) => {
              if (isMobile) {
                if (info.offset.y > 100 || info.velocity.y > 500) {
                  onClose();
                }
              } else {
                if (info.offset.x > 100) onNavigate(-1);
                else if (info.offset.x < -100) onNavigate(1);
              }
            }}
            className={cn(
              "relative flex flex-col z-10 bg-paper overflow-hidden gpu will-change-transform",
              isMobile ? "w-full h-[92vh] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.4)] border-t border-pencil-light/30" : "h-full w-[min(680px,80vw)] border-l-2 border-pencil-light/65 shadow-[-15px_0_45px_rgba(0,0,0,0.35)]"
            )}
          >
            {/* Visual HUD & Blueprint Texture */}
            {/* Background grid removed as per instructions */}

            {/* Mobile Grabber */}
            {isMobile && (
              <div 
                className="shrink-0 h-8 mt-2 flex items-center justify-center relative z-[100] touch-none cursor-grab active:cursor-grabbing w-full"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="w-12 h-1.5 bg-ink/20 rounded-full" />
              </div>
            )}

            {/* Tactical Status Bar */}
            <header className={cn(
              "h-16 md:h-24 flex items-center justify-between px-5 md:px-12 shrink-0 z-50 transition-all duration-300 relative gpu",
              isScrolled ? "bg-paper/95 backdrop-blur-sm border-b border-pencil-light/35 shadow-sm" : "bg-transparent",
              isMobile && !isScrolled && "mt-1"
            )}>
              <div className="flex items-center gap-4 md:gap-8">
                <div className="flex items-center gap-6 md:gap-8">
                  <div className="h-10 md:h-12 w-[2px] bg-gradient-to-b from-accent/50 to-transparent rotate-12 hidden md:block" />
                  <div className="flex flex-col">
                    <span className="font-mono text-[0.68rem] text-accent font-semibold tracking-wider uppercase select-none">
                      Project 0{projectIndex + 1}
                    </span>
                    <h3 className="font-marker text-[1.4rem] md:text-[1.80rem] text-ink leading-none mt-1 uppercase select-none tracking-tight">
                      {project.title}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Hand-drawn status line under header when not scrolled */}
              {!isScrolled && (
                <div className="absolute bottom-0 inset-x-0 px-4 md:px-12 opacity-30 select-none pointer-events-none">
                  <svg className="w-full h-[8px] overflow-visible text-accent stroke-current" viewBox="0 0 500 8" fill="none">
                    <path d="M2 4 Q125 -1, 250 4 T 498 4" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </div>
              )}

              <div className="flex items-center gap-3.5 md:gap-5">
                {project.link && (
                  <motion.a 
                    whileTap={{ scale: 0.95 }}
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 border-2 border-solid border-pencil-light bg-accent/5 hover:bg-accent/15 rounded-xl transition-all duration-300 cursor-pointer text-ink group relative select-none shadow-[4px_4px_0_0_var(--color-pencil-light)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--color-accent)] hover:border-accent"
                  >
                    <span className="font-sans text-[0.72rem] md:text-[0.78rem] font-bold tracking-wider uppercase">
                      Live Project
                    </span>
                    <ExternalLink size={11} className="text-accent group-hover:rotate-45 transition-transform duration-300 shrink-0" />
                  </motion.a>
                )}
                
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-10 h-10 bg-paper/85 border-2 border-solid border-pencil-light rounded-xl flex items-center justify-center text-ink-dim transition-all duration-300 shadow-[4px_4px_0_0_var(--color-pencil-light)] cursor-pointer hover:shadow-[6px_6px_0_0_var(--color-accent)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:border-accent hover:text-accent group"
                  aria-label="Close modal"
                >
                  <X size={18} strokeWidth={2.5} />
                </motion.button>
              </div>
            </header>

            {/* Scrollable Creative Space */}
            <div 
              ref={(node) => {
                // @ts-ignore
                scrollRef.current = node;
                setContainerNode(node);
              }}
              onScroll={handleScroll}
              data-lenis-prevent
              className="flex-1 overflow-y-auto overflow-x-hidden relative overscroll-contain touch-pan-y no-scrollbar"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <div className="max-w-[580px] mx-auto px-5 md:px-8 py-5 md:py-8 space-y-12 md:space-y-14">
                
                {/* 01. NARRATIVE_CORE */}
                <motion.section 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="relative group"
                >
                  <div className="space-y-4 md:space-y-6">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[0.68rem] text-accent font-semibold tracking-wider uppercase select-none">
                        <div className="flex items-center gap-1.5">
                          <span>Category:</span>
                          <span className="text-ink font-sans font-semibold">{project.category}</span>
                        </div>
                        <span className="text-pencil-light/60 select-none">•</span>
                        <div className="flex items-center gap-1.5 text-accent/90">
                          <Clock size={11} strokeWidth={2.5} />
                          <span className="font-sans font-bold text-ink">{readingTime} min read</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 md:gap-2 pt-1">
                        {project.tags.map((tag) => (
                          <span 
                            key={tag} 
                            className="font-mono text-[0.52rem] border border-pencil-light/60 bg-paper-light/30 px-2.5 py-1 text-ink-dim/90 rounded-md uppercase font-semibold tracking-widest hover:border-accent hover:text-accent transition-all duration-300 select-none"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="relative">
                      <motion.div 
                        initial={{ opacity: 0, rotate: -0.5 }}
                        whileInView={{ opacity: 1, rotate: 0.3 }}
                        transition={{ duration: 0.4 }}
                        className="relative font-hand text-[1.10rem] md:text-[1.20rem] text-ink-dim leading-relaxed bg-paper-light/40 p-6 md:p-8 rounded-[1.5rem] border border-dashed border-pencil-light font-hand italic shadow-md overflow-hidden"
                      >
                        {/* Top Margin Sketched Line representing a notebook page */}
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
                        
                        <span className="relative z-10 block pr-6 text-ink/90">
                          {project.desc}
                        </span>
                      </motion.div>
                    </div>
                  </div>
                </motion.section>

                {/* PROJECT_METADATA_ARRAY */}
                {project.artMeta && (
                  <motion.section 
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-transparent rounded-lg overflow-hidden"
                  >
                    {[
                      { label: 'MEDIUM', value: project.artMeta.medium, icon: '✎' },
                      { label: 'TIMELINE', value: project.artMeta.year, icon: '⏱' },
                      { label: 'STYLE', value: project.artMeta.style, icon: '✦' },
                      { label: 'TOOLS', value: project.artMeta.tools, icon: '⚙' }
                    ].map((m, i) => (
                      <div key={i} className="bg-paper border border-pencil-light/60 border-dashed rounded-xl p-3.5 flex flex-col gap-1 hover:bg-accent/5 hover:border-accent/45 hover:scale-[1.02] transition-all duration-300 group/meta relative overflow-hidden shadow-sm">
                        <span className="font-mono text-[0.52rem] text-accent font-bold tracking-[0.22em] uppercase mb-0.5">{m.label}</span>
                        <span className="font-hand text-[0.88rem] leading-none text-ink-dim group-hover/meta:text-accent font-semibold truncate transition-colors">{m.value}</span>
                      </div>
                    ))}
                  </motion.section>
                )}

                {/* 02. VISUAL_ARRAY */}
                <motion.section 
                   initial={{ opacity: 0 }}
                   whileInView={{ opacity: 1 }}
                   viewport={{ once: true }}
                   className="relative group"
                >
                   <div className={cn("relative group/media", images.length > 0 && "cursor-zoom-in")} onClick={() => images.length > 0 && setIsLightboxOpen(true)}>
                      <div className="absolute -inset-10 bg-accent/5 blur-xl md:blur-3xl opacity-0 group-hover/media:opacity-100 transition-opacity duration-1000 animate-pulse" />
                      
                      {/* Hand-sketched paste-tape graphic */}
                      {!liteMode && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-accent/25 border border-accent/35 opacity-80 select-none rotate-[-1.5deg] z-20 pointer-events-none shadow-[2px_2px_5px_rgba(0,0,0,0.05)]" style={{ clipPath: 'polygon(0% 12%, 3% 0%, 97% 4%, 100% 15%, 98% 88%, 91% 100%, 8% 97%, 2% 84%)' }} />
                      )}

                      <div className="relative aspect-[16/10] bg-charcoal-warm shadow-2xl rounded-2xl overflow-hidden border-2 border-pencil-light/60 group-hover:border-accent/40 group-hover:scale-[1.01] transition-transform duration-700 ease-[0.16,1,0.3,1] shadow-[5px_5px_0_var(--color-pencil-light)]">
                        {project.youtube ? (
                          <div className="w-full h-full relative bg-black">
                            {!isPlayingVideo ? (
                              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#130d0a] cursor-pointer group/vid" onClick={(e) => { e.stopPropagation(); setIsPlayingVideo(true); }}>
                                <img
                                  src={`https://img.youtube.com/vi/${project.youtube}/maxresdefault.jpg`}
                                  alt={project.title}
                                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover/vid:scale-[1.02] transition-transform duration-700"
                                  onError={(e) => { e.currentTarget.src = `https://img.youtube.com/vi/${project.youtube}/0.jpg`; }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40 group-hover/vid:from-black/70 group-hover/vid:via-black/20 transition-all" />
                                <div className="relative z-20 w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center shadow-2xl group-hover/vid:scale-110 active:scale-95 transition-transform duration-300">
                                  <Play size={26} fill="currentColor" className="ml-1" />
                                </div>
                                <span className="relative z-20 font-marker text-[0.9rem] text-white/95 mt-4 px-4 py-1 bg-black/55 border border-white/10 rounded-xl select-none group-hover/vid:bg-accent group-hover/vid:text-white transition-all shadow-sm">
                                  Click to Play Video
                                </span>
                              </div>
                            ) : (
                              <iframe
                                className="w-full h-full absolute inset-0 z-0 bg-black"
                                src={`https://www.youtube.com/embed/${project.youtube}?autoplay=1&rel=0&modestbranding=1&playlist=${project.youtube}&loop=1`}
                                title={project.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            )}
                          </div>
                        ) : images.length > 0 ? (
                          <div className="w-full h-full relative group/gallery">
                            <AnimatePresence mode="wait">
                              <motion.img
                                key={activeImageIdx}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                src={images[activeImageIdx]}
                                alt={project.title}
                                loading="lazy"
                                className="w-full h-full object-cover"
                              />
                            </AnimatePresence>
                            
                            {images.length > 1 && (
                              <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover/gallery:opacity-100 transition-opacity duration-300 pointer-events-none">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setActiveImageIdx(p => (p - 1 + images.length) % images.length); }}
                                  className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-xl bg-charcoal/80 border border-white/10 text-white hover:bg-accent hover:text-charcoal transition-all shadow-xl active:scale-95 cursor-pointer"
                                >
                                  <ChevronLeft size={20} />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setActiveImageIdx(p => (p + 1) % images.length); }}
                                  className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-xl bg-charcoal/80 border border-white/10 text-white hover:bg-accent hover:text-charcoal transition-all shadow-xl active:scale-95 cursor-pointer"
                                >
                                  <ChevronRight size={20} />
                                </button>
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
 
                      {/* Tactical Image Paging */}
                      {images.length > 1 && (
                        <div className="flex justify-center gap-1.5 mt-4">
                           {images.map((_, i) => (
                             <button
                               key={i}
                               onClick={(e) => { e.stopPropagation(); setActiveImageIdx(i); }}
                               className={cn(
                                 "h-3 rounded-full transition-all duration-500 ease-[0.16,1,0.3,1] flex items-center justify-center cursor-pointer",
                                 i === activeImageIdx ? "bg-accent w-6" : "bg-pencil-light/20 w-3 hover:bg-accent/40"
                                )}
                             />
                           ))}
                        </div>
                      )}
                   </div>
                </motion.section>

                {/* 03. ANALYTICAL_LOG */}
                {project.items && project.items.length > 0 && (
                  <section className="space-y-6 md:space-y-8">
                     <div className="flex items-center gap-4 select-none">
                        <h4 className="font-mono text-[0.62rem] font-bold text-accent tracking-[0.3em] uppercase whitespace-nowrap">Key Features</h4>
                        <div className="flex-1 h-[2px] bg-dashed border-t border-dashed border-pencil-light/60 relative" />
                     </div>
                     
                     <div className="grid grid-cols-1 gap-6 md:gap-8">
                        {project.items.map((item, i) => (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.03 }}
                            key={i} 
                            className="group/item relative grid grid-cols-1 md:grid-cols-[50px_1fr] gap-2 md:gap-4"
                          >
                             <div className="hidden md:flex flex-col items-end pt-1.5">
                                <div className="text-[1.5rem] font-marker text-ink/10 leading-none group-hover/item:text-accent/30 transition-colors duration-500">
                                   {String(i+1).padStart(2, '0')}
                                 </div>
                             </div>
                             <div className="space-y-1.5 md:space-y-2 flex-grow">
                                <h5 className="font-sans text-[0.9rem] font-bold tracking-wider uppercase text-ink group-hover/item:text-accent transition-colors duration-300">
                                  {item.title}
                                </h5>
                                <div className="relative p-4 md:p-5 bg-paper border border-pencil-light/60 rounded-xl group-hover/item:bg-accent/[0.02] group-hover/item:border-accent/40 group-hover/item:shadow-[4px_4px_0_0_var(--color-accent)] transition-all duration-300 overflow-hidden">
                                   <p className="font-hand text-[0.95rem] md:text-[1.05rem] text-ink-dim/90 leading-relaxed italic relative z-10">{item.body}</p>
                                </div>
                             </div>
                          </motion.div>
                        ))}
                     </div>
                  </section>
                )}

                {/* 04. EVOLUTION_TRAJECTORY */}
                {project.process && (
                  <motion.section 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="space-y-6 md:space-y-8"
                  >
                     <div className="flex items-center gap-4 select-none">
                        <div className="flex-1 h-[2px] bg-dashed border-t border-dashed border-pencil-light/60 relative" />
                        <h4 className="font-mono text-[0.62rem] font-bold text-accent tracking-[0.3em] uppercase whitespace-nowrap font-sans">Development Milestones</h4>
                     </div>

                     <div className="relative p-1 bg-pencil-light/45 border border-pencil-light/60 rounded-2xl shadow-xl overflow-hidden group/process select-none">
                        <div 
                          className="absolute inset-0 opacity-[0.035] pointer-events-none" 
                          style={{ 
                            backgroundImage: 'linear-gradient(to right, var(--color-accent) 1px, transparent 1px), linear-gradient(to bottom, var(--color-accent) 1px, transparent 1px)', 
                            backgroundSize: '20px 20px',
                          }} 
                        />
                        
                        <div className="relative bg-[#130d0a]/95 p-5 md:p-6 space-y-6 md:space-y-8 rounded-2xl">
                           <div className="absolute left-9 md:left-12 top-0 bottom-0 w-[2px] bg-pencil-light/40 hidden md:block" />
                           
                           {project.process.map((step, i) => (
                             <motion.div 
                               initial={{ opacity: 0 }}
                               whileInView={{ opacity: 1 }}
                               transition={{ delay: i * 0.05 }}
                               key={i} 
                               className="relative flex gap-5 md:gap-8 items-start group/step"
                             >
                                 <div className="z-10 bg-[#130d0a] p-0.5">
                                   <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-md bg-paper/5 border border-pencil-light text-accent font-mono text-[0.7rem] md:text-[0.8rem] font-black group-hover/step:bg-accent group-hover/step:text-charcoal transition-all duration-300">
                                      0{i+1}
                                   </div>
                                </div>
                                <div className="flex-1 pt-1 md:pt-2">
                                   <p className="font-hand text-[0.95rem] md:text-[1.05rem] text-ink-dim opacity-75 group-hover/step:opacity-100 transition-opacity duration-300 leading-tight italic">
                                      {step}
                                   </p>
                                </div>
                             </motion.div>
                           ))}
                        </div>
                     </div>
                  </motion.section>
                )}


                {/* Footer Insight */}
                {project.footerNote && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="pt-8 md:pt-12 text-center select-none flex flex-col items-center"
                  >
                    <div className="h-[2px] w-full max-w-[124px] mx-auto bg-dashed border-t border-dashed border-pencil-light/60 mb-6" />
                    
                    <p className="font-hand text-[1.10rem] md:text-[1.30rem] text-ink-dim italic max-w-lg mx-auto leading-relaxed">
                      "{project.footerNote}"
                    </p>

                    {project.footerLink && (
                      <motion.a
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        href={project.footerLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex mt-4 items-center gap-2 font-mono text-[0.62rem] font-black tracking-wider uppercase text-accent bg-accent/5 border border-accent/25 px-4 py-2 rounded-xl hover:bg-accent hover:text-white hover:border-accent transition-all duration-300 shadow-xs cursor-pointer"
                      >
                        {project.footerLinkText || 'Watch Video ↗'}
                      </motion.a>
                    )}
                  </motion.div>
                )}

              </div>
            </div>

            {/* Tactical Navigation Footer */}
            <footer className="h-16 md:h-20 flex items-center justify-between px-4 md:px-10 bg-paper-light border-t-2 border-dashed border-pencil-light/30 shrink-0 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
               <button 
                  disabled={projectIndex === 0}
                  onClick={() => onNavigate(-1)}
                  className="group flex items-center gap-2 disabled:opacity-10 transition-all text-left cursor-pointer text-ink-dim hover:text-accent"
               >
                  <ChevronLeft size={18} className="text-accent/60 group-hover:text-accent group-hover:-translate-x-1.5 transition-all duration-300" />
                  <span className="font-mono text-[0.68rem] font-bold tracking-wider uppercase">Prev</span>
               </button>
               
                <div className="flex flex-col items-center">
                   <div className="flex gap-1 mb-1.5 md:gap-1.5 md:mb-2">
                     {Array.from({ length: totalProjects }).map((_, i) => (
                       <button
                         key={i} 
                         onClick={() => onNavigate(i - projectIndex)}
                         className={cn(
                           "h-1 rounded-full transition-all duration-700 ease-[0.16,1,0.3,1] cursor-pointer", 
                           i === projectIndex ? "bg-accent w-4 md:w-6" : "bg-ink/10 w-1 md:w-1.5 hover:bg-ink/20"
                         )} 
                       />
                     ))}
                   </div>
                   <span className="font-mono text-[0.6rem] text-ink/40 font-bold tracking-widest uppercase">{projectIndex + 1} / {totalProjects}</span>
                </div>
 
               <button 
                  disabled={projectIndex === totalProjects - 1}
                  onClick={() => onNavigate(1)}
                  className="group flex items-center gap-2 disabled:opacity-10 transition-all text-right cursor-pointer text-ink-dim hover:text-accent"
               >
                  <span className="font-mono text-[0.68rem] font-bold tracking-wider uppercase">Next</span>
                  <ChevronRight size={18} className="text-accent/60 group-hover:text-accent group-hover:translate-x-1.5 transition-all duration-300" />
               </button>
            </footer>


            {/* Dynamic Scroll Indicator */}
            <div className="absolute top-24 right-4 bottom-24 w-1 bg-pencil-light/5 pointer-events-none z-[100] rounded-full overflow-hidden">
              <motion.div 
                className="w-full bg-accent rounded-full origin-top"
                style={{ scaleY }}
              />
            </div>
          </motion.div>

          {/* Full-Screen Immersive Lightbox */}
          <AnimatePresence>
            {isLightboxOpen && images.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[2000] bg-black/95 flex flex-col items-center justify-center p-4 md:p-12"
              >
                {/* Lightbox HUD Header */}
                <header className="absolute top-0 inset-x-0 h-24 flex items-center justify-between px-8 md:px-12 z-50">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="font-mono text-[0.6rem] text-accent font-black tracking-[0.4em] mb-1">LIGHTBOX_VIEW</span>
                      <span className="font-mono text-[0.8rem] text-white/40">{activeImageIdx + 1} / {images.length}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setIsLightboxOpen(false)}
                    className="w-14 h-14 flex items-center justify-center bg-white/10 hover:bg-accent text-white rounded-2xl transition-all duration-200 hover:scale-110 active:scale-95"
                  >
                    <X size={28} />
                  </button>
                </header>

                {/* Main Lightbox Content */}
                <div className="relative w-full max-w-7xl h-full flex items-center justify-center group/lightbox">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImageIdx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      src={images[activeImageIdx]}
                      alt={`${project.title} - Full Size`}
                      className="max-w-full max-h-full object-contain shadow-[0_40px_100px_rgba(0,0,0,0.8)] rounded-xl"
                    />
                  </AnimatePresence>

                  {images.length > 1 && (
                    <>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveImageIdx(p => (p - 1 + images.length) % images.length); }}
                        className="absolute left-4 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-charcoal/40 hover:bg-accent border border-white/10 hover:border-transparent text-white/80 hover:text-charcoal transition-all duration-300 shadow-xl active:scale-95 cursor-pointer"
                      >
                        <ChevronLeft size={28} strokeWidth={2} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveImageIdx(p => (p + 1) % images.length); }}
                        className="absolute right-4 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-charcoal/40 hover:bg-accent border border-white/10 hover:border-transparent text-white/80 hover:text-charcoal transition-all duration-300 shadow-xl active:scale-95 cursor-pointer"
                      >
                        <ChevronRight size={28} strokeWidth={2} />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail Strip HUD */}
                <div className="absolute bottom-12 inset-x-8 md:inset-x-20 overflow-x-auto pb-4 no-scrollbar">
                  <div className="flex justify-center gap-4 min-w-max px-4">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImageIdx(i)}
                        className={cn(
                          "relative w-20 h-14 md:w-32 md:h-20 rounded-xl overflow-hidden transition-all duration-500 border-2",
                          i === activeImageIdx ? "border-accent scale-105 shadow-lg" : "border-transparent opacity-40 hover:opacity-100"
                        )}
                      >
                        <img src={img} loading="lazy" className="w-full h-full object-cover" alt={`Thumb ${i}`} />
                        {i === activeImageIdx && <div className="absolute inset-0 bg-accent/20" />}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
