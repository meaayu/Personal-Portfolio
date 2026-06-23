import React, { useEffect, useState, memo } from "react";
import { X, ArrowDown, Instagram, PenTool, Github, Linkedin, ExternalLink } from "lucide-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useSpring,
} from "motion/react";
import { cn, smoothScrollTo, throttle } from "../lib/utils";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";

export default memo(function Header() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useLockBodyScroll(isMobileNavOpen);

  // Faster, snappier spring physics transition for a quicker floating response
  const springConfig = { stiffness: 450, damping: 32, restDelta: 0.001 };

  const rawTop = useTransform(scrollY, [0, 100], [0, 24]);
  const navTop = useSpring(rawTop, springConfig);

  const rawPaddingNum = useTransform(scrollY, [0, 100], [1.1, 0.45]);
  const navPaddingNum = useSpring(rawPaddingNum, springConfig);
  const navPadding = useTransform(navPaddingNum, (v) => `${v}rem`);

  const rawRadius = useTransform(scrollY, [0, 100], [0, 16]);
  const navRadius = useSpring(rawRadius, springConfig);

  const rawWidthPercent = useTransform(
    scrollY,
    [0, 100],
    [100, isMobile ? 94 : 85],
  );
  const navWidthSpring = useSpring(rawWidthPercent, springConfig);
  const navWidth = useTransform(navWidthSpring, (v) =>
    isMobile && v === 100 ? "100%" : `${v}%`,
  );

  const navBg = useTransform(
    scrollY,
    [0, 80],
    [
      "rgba(var(--color-paper-rgb), 0)",
      "rgba(var(--color-paper-rgb), 1)",
    ],
  );

  const navBorder = useTransform(
    scrollY,
    [0, 80],
    [
      "rgba(var(--color-pencil-light-rgb), 0)",
      "rgba(var(--color-pencil-light-rgb), 1)",
    ],
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
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = throttle(() => {
      // Show floating nav after a certain threshold
      setIsScrolled(window.scrollY > 80);
    }, 20);

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sections = ["hero", "skills", "work", "about", "contact"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -20% 0px",
        threshold: 0.1,
      },
    );

    const observedElements = new Set<string>();

    const checkAndObserve = () => {
      sections.forEach((id) => {
        if (!observedElements.has(id)) {
          const el = document.getElementById(id);
          if (el) {
            observer.observe(el);
            observedElements.add(id);
          }
        }
      });
    };

    // Lazy load friendly observer attacher
    const interval = setInterval(checkAndObserve, 500);
    checkAndObserve();

    const handleClearActive = throttle(() => {
      if (window.scrollY < 100) {
        setActiveSection("hero");
      }
    }, 150);
    window.addEventListener("scroll", handleClearActive, { passive: true });

    return () => {
      clearInterval(interval);
      observer.disconnect();
      window.removeEventListener("scroll", handleClearActive);
    };
  }, []);

  const navLinks = [
    { label: "Work", id: "work", num: "01" },
    { label: "Skills", id: "skills", num: "02" },
    { label: "About", id: "about", num: "03" },
    { label: "Contact", id: "contact", num: "04" },
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
          backgroundColor: navBg,
          borderColor: navBorder,
          boxShadow: isScrolled ? "0 4px 20px rgba(0,0,0,0.05)" : "none",
          willChange: "top, width, padding, background-color, border-radius",
          maxWidth: 1100,
        }}
        className="fixed inset-x-0 mx-auto z-[900] px-0 gpu border border-solid flex items-center justify-center transition-shadow duration-300 hover:border-accent/50"
      >
        <div className="w-full flex justify-between items-center px-6 md:px-10 relative group/nav">
          {/* Logo & Section Tracking */}
          <div className="flex-1 flex items-center">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex flex-col no-underline transition-all duration-500 hover:scale-105 group/logo gpu"
            >
              <div className="flex items-center gap-2">
                <span className="font-marker text-[1.5rem] md:text-[1.75rem] tracking-tight text-ink leading-none transition-colors group-hover/logo:text-accent group-hover/logo:scale-105 duration-300">
                  Aayu
                  <span className="text-accent underline decoration-accent/30 underline-offset-4">
                    .
                  </span>
                </span>
                <div className="h-5 w-[1px] bg-accent/20 rotate-12 hidden sm:block mx-1" />
              </div>
              <span className="font-mono font-bold text-[9.4px] leading-[9.4px] text-ink-dim tracking-[0.35em] pl-0.5 mt-1.5 opacity-60 uppercase transition-all group-hover/logo:text-accent group-hover/logo:opacity-100">
                creative_folio
              </span>
            </a>
          </div>

          {/* Right: Desktop Navigation */}
          <div className="hidden md:flex flex-1 items-center justify-end">
            <ul className="flex list-none gap-2 md:gap-4 lg:gap-6 items-center -mr-4">
              {navLinks.map((link) => (
                <li key={link.id} className="relative">
                  <a
                    href={`#${link.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      smoothScrollTo(link.id);
                    }}
                    className={cn(
                      "font-hand text-ink-dim no-underline text-[1.05rem] lg:text-[1.05rem] px-4 py-2.5 rounded-full transition-all duration-300 hover-instant relative tracking-[0.05em] capitalize flex items-center gap-3 group/link gpu",
                      activeSection === link.id
                        ? "text-accent"
                        : "hover:text-accent",
                    )}
                  >
                    <span
                      className={cn(
                        "font-mono text-[0.6rem] opacity-30 transition-all duration-300",
                        activeSection === link.id &&
                          "opacity-100 text-accent scale-110",
                      )}
                    >
                      {link.num}
                    </span>
                    <span className="relative z-10 transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:scale-105 inline-block">{link.label}</span>
                    
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
                        transition={{
                          type: "spring",
                          bounce: 0.1,
                          duration: 0.4,
                        }}
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
                className="w-11 h-11 bg-paper border-2 border-pencil-light/80 rounded-xl flex flex-col items-center justify-center gap-[4px] hover:border-accent hover:bg-accent/5 transition-all duration-200 cursor-pointer group/toggle shadow-[3px_3px_0px_0px_var(--color-pencil-light)] hover:shadow-[1px_1px_0px_0px_var(--color-pencil-light)] hover:translate-x-[2px] hover:translate-y-[2px]"
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

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-[#0d0b11]/98 backdrop-blur-xl z-[1000] flex flex-col p-6 md:p-12 overscroll-contain justify-between"
            style={{ transform: "translateZ(0)" }}
          >
            {/* Minimal Grid overlay */}
            <div
              className="absolute inset-0 opacity-[0.02] pointer-events-none z-0"
              style={{
                backgroundImage:
                  "linear-gradient(to right, var(--color-accent) 1px, transparent 1px), linear-gradient(to bottom, var(--color-accent) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            {/* Header section inside overlay */}
            <div className="flex justify-between items-center relative z-50">
              <div className="flex items-center gap-2">
                <span className="font-marker text-[1.8rem] text-ink leading-none tracking-wide">
                  Aayu<span className="text-accent">.</span>
                </span>
                <span className="font-mono text-[0.62rem] text-accent/60 tracking-[0.2em] uppercase pt-1">
                  // Portfolio
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileNavOpen(false)}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-paper/30 border border-pencil-light/20 text-ink-dim hover:text-accent hover:bg-paper/60 hover:rotate-90 transition-all duration-300 cursor-pointer"
                aria-label="Close menu"
              >
                <X size={20} strokeWidth={2} />
              </motion.button>
            </div>

            {/* Centered Large Typographic Links */}
            <div className="flex-1 flex flex-col justify-center items-center py-8 relative z-10">
              <motion.nav
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.1,
                    }
                  }
                }}
                initial="hidden"
                animate="show"
                className="flex flex-col gap-6 md:gap-8 text-center"
              >
                {navLinks.map((link, idx) => {
                  const active = activeSection === link.id;
                  return (
                    <motion.div
                      key={link.id}
                      variants={{
                        hidden: { opacity: 0, y: 30 },
                        show: { 
                          opacity: 1, 
                          y: 0,
                          transition: { type: "spring", stiffness: 180, damping: 18 }
                        }
                      }}
                      className="relative block"
                    >
                      <a
                        href={`#${link.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setIsMobileNavOpen(false);
                          setTimeout(() => smoothScrollTo(link.id), 250);
                        }}
                        className="group inline-flex items-baseline gap-4 focus:outline-none"
                      >
                        {/* Bullet / Number */}
                        <span className="font-mono text-[0.8rem] text-accent font-semibold tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                          {link.num}
                        </span>

                        {/* Title font */}
                        <span
                          className={cn(
                            "font-marker text-[2.6rem] sm:text-[3.2rem] tracking-wide transition-all duration-300 relative",
                            active
                              ? "text-accent scale-105"
                              : "text-ink/80 hover:text-accent hover:translate-x-1"
                          )}
                        >
                          {link.label}
                          
                          {/* Sleek Underline Indicator */}
                          <span className={cn(
                            "absolute left-0 right-0 bottom-1 h-[2px] bg-accent/60 transform origin-left transition-transform duration-300",
                            active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                          )} />
                        </span>
                      </a>
                    </motion.div>
                  );
                })}
              </motion.nav>
            </div>

            {/* Bottom Minimal Layout */}
            <div className="border-t border-pencil-light/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-50 text-ink-dim/60">
              <div className="flex items-center gap-6">
                {[
                  { icon: Github, url: "https://github.com", label: "Github" },
                  { icon: Instagram, url: "https://instagram.com/m__aayu__", label: "Instagram" },
                  { icon: Linkedin, url: "https://linkedin.com", label: "Linkedin" }
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 font-sans text-xs tracking-wider font-semibold hover:text-accent transition-colors"
                  >
                    <social.icon size={14} />
                    <span className="hidden sm:inline">{social.label}</span>
                  </a>
                ))}
              </div>

              <div className="flex items-center gap-2 font-mono text-[0.68rem] tracking-widest uppercase">
                <span>KTM, NEPAL</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-75 animate-pulse" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed Resume Button - Bottom Left */}
    </>
  );
});
