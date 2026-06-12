import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Download, Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import '../index.css';

import wp1 from './assets/wallhaven-3q3j6y.jpg';
import wp2 from './assets/wallhaven-jev8wy_1920x1080.png';
import wp3 from './assets/wallhaven-mlly98.png';
import wp4 from './assets/wallhaven-qrllkd.png';
import wp5 from './assets/wallhaven-rqjrym.png';
import wp6 from './assets/wallhaven-zp8o3j.jpg';

// Curated gallery
const WALLPAPERS = [
  {
    id: 'wp-1',
    title: 'Neon Nights',
    description: '3q3j6y - Abstract cyber',
    url: wp1,
  },
  {
    id: 'wp-2',
    title: 'Mountain Retreat',
    description: 'jev8wy - Scenic landscape',
    url: wp2,
  },
  {
    id: 'wp-3',
    title: 'Lunar Horizon',
    description: 'mlly98 - Space minimalist',
    url: wp3,
  },
  {
    id: 'wp-4',
    title: 'Geometric Flow',
    description: 'qrllkd - Digital art',
    url: wp4,
  },
  {
    id: 'wp-5',
    title: 'Crimson Sky',
    description: 'rqjrym - Painted clouds',
    url: wp5,
  },
  {
    id: 'wp-6',
    title: 'Forest Deep',
    description: 'zp8o3j - Natural aesthetic',
    url: wp6,
  }
];

export default function Wallpapers() {
  const [selectedWallpaper, setSelectedWallpaper] = useState<typeof WALLPAPERS[0] | null>(null);

  // Drag to scroll logic
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMoved, setDragMoved] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setDragMoved(false);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const dragDistance = Math.abs(x - startX);
    if (dragDistance > 5) setDragMoved(true);
    const walk = (x - startX) * 2; // Scroll speed
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const scrollLeftList = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -window.innerWidth * 0.5, behavior: 'smooth' });
    }
  };

  const scrollRightList = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: window.innerWidth * 0.5, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-charcoal text-ink font-sans selection:bg-accent/30 selection:text-ink flex flex-col">
      {/* Header */}
      <header className="px-6 md:px-10 py-6 border-b-2 border-pencil-light/30 flex items-center justify-between sticky top-0 bg-charcoal/90 backdrop-blur-md z-40">
        <div className="flex items-center gap-5">
          <Link 
            to="/" 
            className="w-11 h-11 flex items-center justify-center border-2 border-pencil-light bg-paper text-ink hover:text-accent hover:border-accent hover:-translate-y-1 shadow-[4px_4px_0_var(--color-pencil-light)] hover:shadow-[4px_4px_0_var(--color-accent)] rounded-full transition-all"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex flex-col">
            <h1 className="font-kalam text-2xl md:text-3xl text-ink leading-none">
              Wallpapers Gallery
            </h1>
            <span className="font-mono text-[10px] text-accent tracking-[0.2em] font-bold mt-1 uppercase">
              Curated_Assets
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-[90rem] mx-auto w-full px-6 md:px-10 py-12 md:py-20 relative">
        <div className="mb-12 flex gap-4 pb-2 justify-end">
          <div className="hidden sm:flex gap-4 pb-2">
            <button
              onClick={scrollLeftList}
              className="w-12 h-12 rounded-full border-2 bg-paper border-pencil-light text-ink flex items-center justify-center hover:border-accent hover:text-accent transition-all shadow-[4px_4px_0_var(--color-pencil-light)] hover:shadow-[4px_4px_0_var(--color-accent)] active:translate-y-1 active:translate-x-1 active:shadow-none"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={scrollRightList}
              className="w-12 h-12 rounded-full border-2 bg-paper border-pencil-light text-ink flex items-center justify-center hover:border-accent hover:text-accent transition-all shadow-[4px_4px_0_var(--color-pencil-light)] hover:shadow-[4px_4px_0_var(--color-accent)] active:translate-y-1 active:translate-x-1 active:shadow-none"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        <div 
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`flex overflow-x-auto pb-12 -mx-6 px-6 md:-mx-10 md:px-10 gap-6 md:gap-8 hide-scrollbar ${
            isDragging ? 'cursor-grabbing snap-none' : 'cursor-grab snap-x snap-mandatory'
          }`}
        >
          {WALLPAPERS.map((wallpaper, index) => (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              key={wallpaper.id}
              className="group relative flex-none w-[85vw] sm:w-[65vw] md:w-[55vw] lg:w-[45vw] xl:w-[35vw] snap-center bg-paper rounded-2xl border-2 border-pencil-light overflow-hidden shadow-[6px_6px_0_var(--color-pencil-light)] hover:shadow-[10px_10px_0_var(--color-accent)] hover:border-accent hover:-translate-y-2 transition-all duration-300 flex flex-col"
            >
              <div 
                className="aspect-video lg:aspect-[4/3] w-full overflow-hidden relative cursor-pointer"
                onClick={(e) => {
                  if (dragMoved) {
                    e.preventDefault();
                    e.stopPropagation();
                  } else {
                    setSelectedWallpaper(wallpaper);
                  }
                }}
              >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all z-10" />
                <img 
                  src={wallpaper.url} 
                  alt={wallpaper.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 bg-charcoal/20 backdrop-blur-[2px]">
                  <div className="w-14 h-14 rounded-full bg-paper border-2 border-pencil-light group-hover:border-accent flex items-center justify-center text-ink group-hover:text-accent shadow-[4px_4px_0_var(--color-pencil-light)] transition-all">
                    <Maximize2 size={24} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <Footer />

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedWallpaper && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/95 backdrop-blur-xl p-4 sm:p-8 md:p-12"
          >
            <button 
              onClick={() => setSelectedWallpaper(null)}
              className="absolute top-6 right-6 md:top-8 md:right-8 w-12 h-12 bg-paper border-2 border-pencil-light hover:border-accent rounded-full flex items-center justify-center text-ink hover:text-accent transition-all z-50 shadow-[4px_4px_0_var(--color-pencil-light)]"
            >
              <X size={24} />
            </button>
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative max-w-7xl w-full max-h-[85vh] rounded-3xl overflow-hidden border-4 border-pencil-light shadow-2xl flex flex-col md:flex-row bg-paper"
            >
              <div className="flex-grow relative bg-black/50 overflow-hidden flex items-center justify-center p-2 md:p-0">
                <img 
                  src={selectedWallpaper.url} 
                  alt={selectedWallpaper.title}
                  className="max-w-full max-h-[50vh] md:max-h-[85vh] object-contain drop-shadow-2xl"
                />
              </div>
              
              <div className="w-full md:w-80 border-t-4 md:border-t-0 md:border-l-4 border-pencil-light bg-paper p-6 md:p-8 flex flex-col shrink-0">
                <h2 className="font-kalam text-3xl md:text-4xl text-ink mb-2">{selectedWallpaper.title}</h2>
                <div className="h-1 w-12 bg-accent mb-6 rounded-full"></div>
                
                <p className="font-mono text-sm text-ink-dim mb-8 leading-relaxed">
                  {selectedWallpaper.description.split(' - ')[1] || 'High resolution ambient aesthetic wallpaper, curated carefully for the perfect dark mode screen.'}
                </p>

                <div className="mt-auto space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-ink-faint border-b-2 border-pencil-light/30 pb-3">
                    <span>RESOLUTION</span>
                    <span className="text-ink">High Res</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono text-ink-faint border-b-2 border-pencil-light/30 pb-3">
                    <span>FORMAT</span>
                    <span className="text-ink uppercase">{selectedWallpaper.url.split('.').pop()}</span>
                  </div>
                  
                  <a 
                    href={selectedWallpaper.url} 
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="w-full mt-6 bg-accent text-charcoal px-6 py-4 rounded-xl border-2 border-pencil-light shadow-[4px_4px_0_var(--color-pencil-light)] hover:shadow-[6px_6px_0_var(--color-pencil-light)] font-bold uppercase tracking-wider text-sm hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                  >
                    <Download size={20} />
                    Download
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
