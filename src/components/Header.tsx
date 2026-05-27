import React, { useEffect, useState } from 'react';
import { X, ArrowDown, Github, Instagram, Mail } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent, useSpring } from 'motion/react';
import { cn, smoothScrollTo, throttle } from '../lib/utils';
import ThemeSwitcher from './ThemeToggle';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { usePerformanceMode } from '../hooks/usePerformanceMode';

export default function Header() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { liteMode } = usePerformanceMode();

  useLockBodyScroll(isMobileNavOpen);

  // Faster, snappier spring physics transition for a quicker floating response
  const springConfig = { stiffness: 450, damping: 32, restDelta: 0.001 };
  
  const rawTop = useTransform(scrollY, [0, 100], [0, 16]);
  const navTop = useSpring(rawTop, springConfig);

  const rawPaddingNum = useTransform(scrollY, [0, 100], [1.2, 0.6]);
  const navPaddingNum = useSpring(rawPaddingNum, springConfig);
  const navPadding = useTransform(navPaddingNum, (v) => `${v}rem`);

  const rawRadius = useTransform(scrollY, [0, 100], [0, 16]);
  const navRadius = useSpring(rawRadius, springConfig);

  const rawWidthPercent = useTransform(scrollY, [0, 100], [100, isMobile ? 92 : 92]);
  const navWidthSpring = useSpring(rawWidthPercent, springConfig);
  const navWidth = useTransform(navWidthSpring, (v) => isMobile && v === 100 ? "100%" : `${v}%`);
  
  const navBg = useTransform(
    scrollY,
    [0, 80],
    ["rgba(var(--color-paper-rgb), 0)", isMobile ? "rgba(var(--color-paper-rgb), 1)" : "rgba(var(--color-paper-rgb), 0.85)"]
  );
  
  const navBorder = useTransform(
    scrollY,
    [0, 80],
    ["rgba(var(--color-pencil-light-rgb), 0)", "rgba(var(--color-pencil-light-rgb), 0.6)"]
  );

  // Toggle shadows and other non-interpolatable states efficiently
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 80 && !isScrolled) setIsScrolled(true);
    if (latest <= 80 && isScrolled) setIsScrolled(false);
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
    const handleScroll = throttle(() => {
      // Show floating nav after a certain threshold
      setIsScrolled(window.scrollY > 80);
    }, 20);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sections = ['hero', 'skills', 'work', 'garden', 'about', 'contact'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { 
        rootMargin: '-20% 0px -20% 0px', 
        threshold: 0.1 
      }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const handleClearActive = throttle(() => {
      if (window.scrollY < 100) {
        setActiveSection('hero');
      }
    }, 150);
    window.addEventListener('scroll', handleClearActive, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleClearActive);
    };
  }, []);

  const navLinks = [
    { label: 'Skills', id: 'skills', num: '01' },
    { label: 'Work', id: 'work', num: '02' },
    { label: 'About', id: 'about', num: '03' },
    { label: 'Contact', id: 'contact', num: '04' },
  ];

  return (
    <>
      <motion.nav
        id="mainNav"
        style={{
          top: navTop,
          width: navWidth,
          paddingTop: navPadding,
          paddingBottom: navPadding,
          borderRadius: navRadius,
          backgroundColor: liteMode ? (isScrolled ? "var(--color-paper)" : "transparent") : navBg,
          borderColor: liteMode ? (isScrolled ? "rgba(var(--color-pencil-light-rgb), 0.6)" : "transparent") : navBorder,
          backdropFilter: isScrolled && !isMobile && !liteMode ? 'blur(12px)' : 'none',
          boxShadow: isScrolled ? '0 25px 60px -15px rgba(0, 0, 0, 0.4)' : 'none',
          willChange: 'top, width, padding, background-color, border-radius',
          maxWidth: 1100
        }}
        className="fixed inset-x-0 mx-auto z-[900] px-0 gpu border-2 flex items-center justify-center"
      >
        <div className="w-full flex justify-between items-center px-6 md:px-10 relative group/nav">
          {/* Logo & Section Tracking */}
          <div className="flex-1 flex items-center">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex flex-col no-underline transition-all duration-500 hover:scale-105 group/logo gpu"
            >
              <div className="flex items-center gap-2">
                <span className="font-marker text-[1.5rem] tracking-tight text-ink leading-none transition-colors group-hover/logo:text-accent group-hover/logo:scale-105 duration-300">Aayu<span className="text-accent underline decoration-accent/30 underline-offset-4">.</span></span>
                <div className="h-5 w-[1px] bg-accent/20 rotate-12 hidden sm:block mx-1" />
              </div>
              <span className="font-mono text-[0.6rem] text-ink-dim tracking-[0.35em] pl-0.5 leading-none mt-1.5 opacity-60 uppercase transition-all group-hover/logo:text-accent group-hover/logo:opacity-100">creative_folio</span>
            </a>
          </div>

          {/* Right: Desktop Navigation */}
          <div className="hidden md:flex flex-1 items-center justify-end">
            <ul className="flex list-none gap-0.5 items-center">
              {navLinks.map((link) => (
                <li key={link.id} className="relative">
                  <a
                    href={`#${link.id}`}
                    onClick={(e) => { e.preventDefault(); smoothScrollTo(link.id); }}
                    className={cn(
                      'font-sans text-ink-dim no-underline text-[0.72rem] px-4 py-2 rounded-full transition-all duration-300 hover-instant relative tracking-[0.12em] font-medium uppercase flex items-center gap-3 group/link gpu',
                      activeSection === link.id ? 'text-accent' : 'hover:text-ink'
                    )}
                  >
                    <span className={cn(
                      "font-mono text-[0.6rem] opacity-30 transition-all duration-300",
                      activeSection === link.id && "opacity-100 text-accent scale-110"
                    )}>{link.num}</span>
                    <span className="relative z-10">{link.label}</span>
                    
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-accent/0 group-hover/link:bg-accent/5 transition-colors -z-10" />
                    
                    {/* Active Scribble Underline */}
                    {activeSection === link.id && (
                      <motion.svg
                        layoutId="nav-underline"
                        className="absolute -bottom-1 left-4 right-4 h-1.5 overflow-visible"
                        viewBox="0 0 100 8"
                        preserveAspectRatio="none"
                      >
                        <motion.path
                          d="M0 4 Q25 1 50 4 Q75 7 100 4"
                          stroke="var(--color-accent)"
                          strokeWidth="3"
                          fill="none"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          opacity="0.6"
                        />
                      </motion.svg>
                    )}

                    {/* Active Dot Indicator */}
                    {activeSection === link.id && (
                      <motion.div 
                        layoutId="nav-dot"
                        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-accent rounded-full"
                        transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                      />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-end gap-3 min-w-fit md:hidden">
            {/* Mobile Actions */}
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.92, y: 2 }}
                className="w-11 h-11 bg-paper border-2 border-pencil-light/80 rounded-xl flex flex-col items-center justify-center gap-[4px] hover:border-accent hover:bg-accent/5 transition-all duration-200 cursor-pointer group/toggle sketch-filter shadow-[3px_3px_0px_0px_rgba(var(--color-pencil-light-rgb),0.3)] hover:shadow-[1px_1px_0px_0px_rgba(var(--color-pencil-light-rgb),0.3)] hover:translate-x-[2px] hover:translate-y-[2px]"
                onClick={() => setIsMobileNavOpen(true)}
                aria-label="Open menu"
              >
                <span className="block w-4 h-[2px] bg-accent/80 rounded-full transition-all group-hover/toggle:w-5 group-hover/toggle:bg-accent" />
                <span className="block w-5 h-[2px] bg-ink-dim rounded-full transition-all group-hover/toggle:bg-ink" />
                <span className="block w-3 h-[2px] bg-accent/80 rounded-full transition-all group-hover/toggle:w-5 group-hover/toggle:bg-accent" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileNavOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[950]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-[88vw] max-w-[360px] bg-charcoal border-l border-accent/25 shadow-[0_0_50px_rgba(0,0,0,0.85)] z-[1000] flex flex-col overflow-y-auto overscroll-contain gpu"
              style={{ transform: 'translateZ(0)' }}
            >
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-transparent via-accent to-transparent opacity-60" />

              {/* Faded Grid Background inside Side Panel */}
              <div 
                className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
                style={{ 
                  backgroundImage: 'linear-gradient(to right, var(--color-accent) 1px, transparent 1px), linear-gradient(to bottom, var(--color-accent) 1px, transparent 1px)', 
                  backgroundSize: '20px 20px',
                  maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)',
                  WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)'
                }} 
              />

              {/* Header inside Panel */}
              <div className="p-7 pb-3 flex justify-between items-center relative z-50 mt-1">
                <div className="flex flex-col">
                  <span className="font-marker text-[1.6rem] text-ink leading-none">
                    Aayu<span className="text-accent">.</span>
                  </span>
                  <span className="font-mono text-[0.55rem] text-accent font-bold tracking-[0.3em] pl-0.5 leading-none mt-1.5 opacity-80 uppercase">
                    index_folio
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <ThemeSwitcher />
                  <motion.button
                     whileTap={{ scale: 0.9 }}
                     onClick={() => setIsMobileNavOpen(false)}
                     className="w-10 h-10 bg-paper/80 border-2 border-pencil-light/60 rounded-xl flex items-center justify-center text-ink-dim hover:text-accent hover:border-accent hover:rotate-90 transition-all duration-300 shadow-sm active:scale-90 cursor-pointer"
                  >
                    <X size={18} strokeWidth={2.5} />
                  </motion.button>
                </div>
              </div>

              {/* Sketched Horizon Divider */}
              <div className="px-7 py-3 opacity-25 relative z-10 select-none pointer-events-none">
                  <svg className="w-full h-[10px] overflow-visible text-accent stroke-current" viewBox="0 0 280 10" fill="none">
                      <path d="M2 5 Q70 -1, 140 5 T 278 5" strokeWidth="2.2" strokeLinecap="round"/>
                      <circle cx="10" cy="5" r="2.5" className="fill-accent stroke-none" />
                      <circle cx="270" cy="5" r="2.5" className="fill-accent stroke-none" />
                  </svg>
              </div>

              {/* Links List Navigation */}
              <nav className="flex-1 flex flex-col gap-2.5 px-5 py-4 relative z-10 mt-1 select-none">
                {navLinks.map((link) => {
                  // Generates custom handwritten explanations
                  const descriptions: Record<string, string> = {
                    skills: 'capabilities & gears',
                    work: 'case studies & craft',
                    about: 'philosophy & story',
                    contact: 'say hello or collaborate'
                  };
                  const active = activeSection === link.id;

                  return (
                    <a
                      key={link.id}
                      href={`#${link.id}`}
                      onClick={(e) => { 
                        e.preventDefault(); 
                        setIsMobileNavOpen(false); 
                        setTimeout(() => smoothScrollTo(link.id), 300);
                      }}
                      className={cn(
                        'flex items-center gap-5 p-4 rounded-2xl border border-transparent transition-all duration-300 relative group active:scale-[0.98]'
                      )}
                    >
                      {/* Interactive Active Highlight: Looks like hand-made craft sticker card */}
                      {active && (
                        <motion.div 
                          layoutId="mobile-nav-active"
                          className="absolute inset-0 bg-paper/70 border-2 border-dashed border-accent/25 rounded-2xl shadow-[3px_3px_0_rgba(var(--color-pencil-light-rgb),0.35)] -z-10" 
                          transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        />
                      )}
                      
                      {/* Number Index Block */}
                      <span className={cn(
                        "text-[0.62rem] font-mono w-9 h-9 flex items-center justify-center border rounded-lg tracking-widest transition-all duration-300 shrink-0",
                        active 
                          ? "bg-accent/10 border-accent/30 text-accent font-semibold" 
                          : "bg-paper/40 border-pencil-light/60 text-ink-dim/70 group-hover:border-accent/20 group-hover:text-amber-500"
                      )}>{link.num}</span>
                      
                      {/* Text Column */}
                      <div className="flex-grow flex flex-col items-start text-left">
                        <span className={cn(
                          "font-sans text-[0.92rem] font-semibold tracking-wider uppercase transition-colors duration-300 leading-tight",
                          active ? "text-accent" : "text-ink group-hover:text-accent"
                        )}>
                          {link.label}
                        </span>
                        <span className="font-hand text-[0.85rem] text-ink-dim/60 italic leading-none mt-1 group-hover:text-accent/60 transition-colors">
                          {descriptions[link.id]}
                        </span>
                      </div>
                      
                      {/* Right Indicator Key */}
                      <div className={cn(
                        "w-7 h-7 rounded-lg border border-pencil-light/30 flex items-center justify-center opacity-0 transition-all duration-300 shrink-0",
                        active ? "opacity-100 bg-accent/5 border-accent/30" : "group-hover:opacity-40"
                      )}>
                        <ArrowDown size={12} className={cn(
                          "transition-transform duration-300",
                          active ? "-rotate-90 translate-x-0.5 text-accent" : "-rotate-95 group-hover:-rotate-90"
                        )} />
                      </div>
                    </a>
                  );
                })}
              </nav>

              {/* Sketchpad mountains & Coordinates Section */}
              <div 
                className="p-7 border-t-2 border-dashed border-pencil-light/30 flex flex-col gap-6 mt-auto relative z-10 bg-charcoal"
              >
                  {/* Small mountains drawing representing Himalayan heritage */}
                  <div className="flex items-center justify-between opacity-30 select-none px-1">
                    <svg viewBox="0 0 100 35" className="w-16 h-7 text-accent stroke-current" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M 5,30 L 30,12 L 48,24 L 62,16 L 85,30" strokeWidth="1.2" />
                      <path d="M 18,30 L 48,5 L 75,30" strokeWidth="2" />
                    </svg>
                    <span className="font-mono text-[0.55rem] tracking-widest text-ink-dim/90">KTM_LAT.27.7N</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2.5 items-center">
                      {[
                        { icon: Instagram, url: 'https://instagram.com/m__aayu__', label: 'IG' },
                        { icon: Github, url: 'https://github.com/meaayu', label: 'GH' },
                        { icon: Mail, url: 'mailto:itsaayush.m@gmail.com', label: 'Mail' },
                      ].map((social) => (
                        <a 
                          key={social.label} 
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-lg bg-paper border-2 border-pencil-light/60 flex items-center justify-center text-ink-dim hover:text-accent hover:border-accent transition-all cursor-pointer rotate-1 hover:rotate-0 active:scale-90 shadow-sm active:shadow-none"
                        >
                          <social.icon size={15} />
                        </a>
                      ))}
                    </div>
                  </div>
                 
                  <div className="flex justify-end items-end">
                    <div className="text-right flex flex-col gap-1">
                       <span className="font-mono text-[0.5rem] text-ink-dim/40 uppercase tracking-[0.4em] mb-0.5">EST // 2026 // NEPAL</span>
                       <span className="font-hand text-[0.82rem] text-accent/80 italic leading-none">Handmade with soul</span>
                    </div>
                  </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Fixed Resume Button - Bottom Left */}
    </>
  );
}
