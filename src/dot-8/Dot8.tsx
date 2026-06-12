import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Download, Upload, Image as ImageIcon, Settings2, SlidersHorizontal,
  Home, Info, Sparkles, Zap, Grid, Layers, Palette, Eye, EyeOff, RotateCcw
} from 'lucide-react';
import { cn } from '../lib/utils';
import SectionDivider from '../components/SectionDivider';

function BoxyEightLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 5 7" 
      fill="currentColor" 
      className={cn("w-auto h-full", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M0 0H5V7H0V0ZM1 1V3H4V1H1ZM1 4V6H4V4H1Z" 
      />
    </svg>
  );
}

export default function Dot8() {
  const [appState, setAppState] = useState<'landing' | 'editor'>('landing');
  const [landingTab, setLandingTab] = useState<'home' | 'info'>('home');
  const [isDragging, setIsDragging] = useState(false);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [pixelSize, setPixelSize] = useState(8);
  const [colorRounding, setColorRounding] = useState(32);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [palette, setPalette] = useState<'default' | 'grayscale' | 'gameboy' | 'sepia' | 'cga' | 'vaporwave' | 'cyberpunk'>('default');
  const [dithering, setDithering] = useState<'none' | 'bayer'>('none');
  const [showOriginal, setShowOriginal] = useState(false);
  
  const resetAdjustments = () => {
    setPixelSize(8);
    setColorRounding(32);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setPalette('default');
    setDithering('none');
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setAppState('editor');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    if (e.target) {
        e.target.value = '';
    }
  };

  const loadDemoImage = () => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
        setImage(img);
        setAppState('editor');
    };
    // Using a sample Unsplash image
    img.src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'; 
  };

  const drawPixelated = useCallback(() => {
    if (!image || !canvasRef.current || appState !== 'editor') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    ctx.imageSmoothingEnabled = false;

    const maxSide = 1200;
    let width = image.width;
    let height = image.height;

    if (width > maxSide || height > maxSide) {
      if (width > height) {
        height = Math.round((height * maxSide) / width);
        width = maxSide;
      } else {
        width = Math.round((width * maxSide) / height);
        height = maxSide;
      }
    }

    canvas.width = width;
    canvas.height = height;

    // Draw original image to get image data
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    ctx.drawImage(image, 0, 0, width, height);
    ctx.filter = 'none';
    
    if (pixelSize <= 1) return;

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Helper to round colors for a palette effect
    const roundColor = (val: number, step: number) => {
      if (step <= 1) return val;
      return Math.min(255, Math.round(val / step) * step);
    };

    const bayerMatrix = [
      [ 0,  8,  2, 10],
      [12,  4, 14,  6],
      [ 3, 11,  1,  9],
      [15,  7, 13,  5]
    ];

    const applyPalette = (r: number, g: number, b: number, type: string) => {
      if (type === 'grayscale') {
        const avg = r * 0.299 + g * 0.587 + b * 0.114;
        return [avg, avg, avg];
      }
      if (type === 'gameboy') {
        const avg = r * 0.299 + g * 0.587 + b * 0.114;
        if (avg < 64) return [15, 56, 15];     // Darkest green
        if (avg < 128) return [48, 98, 48];    // Dark green
        if (avg < 192) return [139, 172, 15];  // Light green
        return [155, 188, 15];                 // Lightest green
      }
      if (type === 'cga') {
        const avg = r * 0.299 + g * 0.587 + b * 0.114;
        if (avg < 85) return [0, 0, 0];
        if (avg < 170) return [85, 255, 255]; // Cyan
        return [255, 85, 255]; // Magenta
      }
      if (type === 'vaporwave') {
        return [Math.min(255, r * 1.2), Math.min(255, g * 0.8), Math.min(255, b * 1.5)];
      }
      if (type === 'cyberpunk') {
         return [Math.min(255, r * 1.5), Math.min(255, g * 0.5), Math.min(255, b * 1.2)];
      }
      if (type === 'sepia') {
        const tr = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
        const tg = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
        const tb = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
        return [tr, tg, tb];
      }
      return [r, g, b];
    };

    const finalImageData = new ImageData(width, height);
    const finalData = finalImageData.data;

    for (let y = 0; y < height; y += pixelSize) {
      for (let x = 0; x < width; x += pixelSize) {
        // Find center color in this block (nearest neighbor for crispness)
        const sampleX = Math.min(width - 1, x + Math.floor(pixelSize / 2));
        const sampleY = Math.min(height - 1, y + Math.floor(pixelSize / 2));
        const sampleIdx = (sampleY * width + sampleX) * 4;
        
        let r = data[sampleIdx];
        let g = data[sampleIdx + 1];
        let b = data[sampleIdx + 2];
        let a = data[sampleIdx + 3];

        if (dithering === 'bayer') {
          const matrixFactor = Math.max(16, colorRounding);
          const m = bayerMatrix[(y / pixelSize) % 4]?.[(x / pixelSize) % 4] ?? 0;
          const ditherOffset = (m / 16 - 0.5) * matrixFactor;
          r = Math.max(0, Math.min(255, r + ditherOffset));
          g = Math.max(0, Math.min(255, g + ditherOffset));
          b = Math.max(0, Math.min(255, b + ditherOffset));
        }

        r = roundColor(r, colorRounding);
        g = roundColor(g, colorRounding);
        b = roundColor(b, colorRounding);

        [r, g, b] = applyPalette(r, g, b, palette);

        // Fill the block with the nearest color
        for (let cy = 0; cy < pixelSize; cy++) {
          for (let cx = 0; cx < pixelSize; cx++) {
            const py = y + cy;
            const px = x + cx;
            if (px < width && py < height) {
              const i = (py * width + px) * 4;
              
              finalData[i] = r;
              finalData[i + 1] = g;
              finalData[i + 2] = b;
              finalData[i + 3] = a;
            }
          }
        }
      }
    }

    ctx.putImageData(finalImageData, 0, 0);

  }, [image, pixelSize, colorRounding, brightness, contrast, saturation, palette, dithering, appState]);

  useEffect(() => {
    if (appState === 'editor') {
        drawPixelated();
    }
  }, [drawPixelated, appState]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `dot8-pixelated-${Date.now()}.png`;
    a.click();
  };

  if (appState === 'editor') {
    return (
      <div className="w-full h-[100dvh] bg-charcoal overflow-hidden flex flex-col font-sans text-ink selection:bg-accent/30 selection:text-ink relative">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-50" style={{ backgroundImage: 'radial-gradient(rgba(44,26,20,0.1) 2px, transparent 2px)', backgroundSize: '32px 32px' }} />
        
        {/* Editor Main Work Area */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative w-full z-10 p-2 md:p-4 gap-4">
          
          {/* Controls Sidebar */}
          <aside className="w-full md:w-[22rem] flex-shrink-0 bg-paper border-2 border-pencil-light rounded-2xl sm:rounded-3xl shadow-card overflow-y-auto order-last md:order-first z-20 p-5 sm:p-6 flex flex-col gap-8 hide-scrollbar relative">
            <div className="flex items-center justify-between relative z-10">
               <div className="flex items-center gap-3">
                 <button 
                   onClick={() => {setImage(null); setAppState('landing');}}
                   className="group w-10 h-10 flex items-center justify-center text-ink-dim hover:text-ink border-2 border-pencil-light bg-paper-light hover:bg-[#3D2A24]/40 rounded-xl transition-all btn-sketch-hover shrink-0"
                   title="Back to Landing"
                 >
                   <ArrowLeft size={18} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" />
                 </button>
                 <button
                    onClick={() => {setImage(null); setAppState('landing');}}
                    className="flex flex-col justify-center text-left hover:opacity-80 transition-opacity"
                 >
                    <h1 className="text-xl font-kalam font-bold leading-none tracking-tight text-accent">Dot-8</h1>
                 </button>
               </div>
               
               <h2 className="text-xs font-sans font-semibold tracking-widest text-ink-dim flex items-center gap-1.5 uppercase bg-paper-light px-3 py-1.5 rounded-full border border-pencil-light/60">
                 <Settings2 size={14} strokeWidth={2} /> Controls
               </h2>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[11px] uppercase font-sans font-bold tracking-widest text-ink-dim flex items-center justify-between">
                <span>Pixel Size</span>
                <span className="text-accent bg-accent/10 px-2.5 py-1 rounded-md">{pixelSize}px</span>
              </label>
              <div className="mt-1 relative group">
                <input 
                  type="range" 
                  min="1" max="64" 
                  value={pixelSize} 
                  onChange={(e) => setPixelSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-pencil-dark rounded-full appearance-none cursor-pointer accent-accent transition-all hover:bg-[#1A110F]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[11px] uppercase font-sans font-bold tracking-widest text-ink-dim flex items-center justify-between">
                <span>Color Banding</span>
                <span className="text-accent bg-accent/10 px-2.5 py-1 rounded-md">{colorRounding}</span>
              </label>
              <div className="mt-1 relative group">
                <input 
                  type="range" 
                  min="1" max="128" step="1"
                  value={colorRounding} 
                  onChange={(e) => setColorRounding(parseInt(e.target.value))}
                  className="w-full h-2 bg-pencil-dark rounded-full appearance-none cursor-pointer accent-accent transition-all hover:bg-[#1A110F]"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <label className="text-[11px] uppercase font-sans font-bold tracking-widest text-ink-dim flex items-center justify-between mb-1">
                <span>Color Palette</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['default', 'grayscale', 'gameboy', 'sepia', 'cga', 'vaporwave', 'cyberpunk'].map((p) => (
                  <button 
                    key={p} 
                    onClick={() => setPalette(p as any)}
                    className={cn(
                      "py-2.5 px-2 border-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all text-center truncate",
                      palette === p ? "bg-accent text-charcoal border-accent shadow-[0_0_15px_rgba(255,181,157,0.2)]" : "bg-paper border-pencil-light text-ink-dim hover:text-ink hover:bg-paper-light"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[11px] uppercase font-sans font-bold tracking-widest text-ink-dim flex items-center justify-between mb-1">
                <span>Retro Dithering</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['none', 'bayer'].map((d) => (
                  <button 
                    key={d} 
                    onClick={() => setDithering(d as any)}
                    className={cn(
                      "py-2.5 px-3 border-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all text-center",
                      dithering === d ? "bg-accent text-charcoal border-accent shadow-[0_0_15px_rgba(255,181,157,0.2)]" : "bg-paper border-pencil-light text-ink-dim hover:text-ink hover:bg-paper-light"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[11px] uppercase font-sans font-bold tracking-widest text-ink-dim flex items-center justify-between">
                <span>Brightness</span>
                <span className="text-accent bg-accent/10 px-2.5 py-1 rounded-md">{brightness}%</span>
              </label>
              <div className="mt-1 relative group">
                <input 
                  type="range" 
                  min="0" max="200" 
                  value={brightness} 
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="w-full h-2 bg-pencil-dark rounded-full appearance-none cursor-pointer accent-accent transition-all hover:bg-[#1A110F]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[11px] uppercase font-sans font-bold tracking-widest text-ink-dim flex items-center justify-between">
                <span>Contrast</span>
                <span className="text-accent bg-accent/10 px-2.5 py-1 rounded-md">{contrast}%</span>
              </label>
              <div className="mt-1 relative group">
                <input 
                  type="range" 
                  min="0" max="200" 
                  value={contrast} 
                  onChange={(e) => setContrast(parseInt(e.target.value))}
                  className="w-full h-2 bg-pencil-dark rounded-full appearance-none cursor-pointer accent-accent transition-all hover:bg-[#1A110F]"
                />
              </div>
            </div>

             <div className="flex flex-col gap-3">
              <label className="text-[11px] uppercase font-sans font-bold tracking-widest text-ink-dim flex items-center justify-between">
                <span>Saturation</span>
                <span className="text-accent bg-accent/10 px-2.5 py-1 rounded-md">{saturation}%</span>
              </label>
              <div className="mt-1 relative group">
                <input 
                  type="range" 
                  min="0" max="200" 
                  value={saturation} 
                  onChange={(e) => setSaturation(parseInt(e.target.value))}
                  className="w-full h-2 bg-pencil-dark rounded-full appearance-none cursor-pointer accent-accent transition-all hover:bg-[#1A110F]"
                />
              </div>
            </div>

            <div className="mt-2 pt-6 border-t-2 border-pencil-light border-dashed flex flex-col gap-4">
              <button
                onClick={resetAdjustments}
                className="w-full py-2 border-none transition-all flex items-center justify-center gap-2 text-ink-dim hover:text-accent text-xs font-medium tracking-wide cursor-pointer group"
              >
                <RotateCcw size={14} className="group-hover:-rotate-90 transition-transform duration-300" /> Reset Adjustments
              </button>
              <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 border-2 border-pencil-light rounded-xl transition-all flex items-center justify-center gap-2 text-ink hover:text-accent font-medium tracking-wide bg-paper hover:bg-paper-light cursor-pointer group shadow-sm hover:shadow-card"
              >
                <Upload size={16} className="group-hover:-translate-y-0.5 transition-transform" /> New Image
              </button>
            </div>
          </aside>

          {/* Canvas Display */}
          <main className="flex-1 relative flex flex-col overflow-hidden bg-paper-light border-2 border-pencil-light rounded-2xl sm:rounded-3xl shadow-card">
            
            <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 z-20 w-full relative border-b-2 border-pencil-light/50 bg-paper/50 backdrop-blur-md">
              <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_var(--color-accent)]" />
                 <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-ink-dim">Output</span>
              </div>
              <div className="flex items-center gap-3">
                {image && (
                  <button 
                    onClick={() => setShowOriginal(!showOriginal)}
                    className="h-9 px-4 flex items-center justify-center gap-2 text-ink-dim hover:text-ink font-medium text-xs tracking-wide rounded-full transition-all cursor-pointer border border-pencil-light bg-paper hover:bg-paper-light"
                  >
                    {showOriginal ? <EyeOff size={16} /> : <Eye size={16} />}
                    <span className="hidden sm:inline">{showOriginal ? 'Hide Match' : 'Show Match'}</span>
                  </button>
                )}
                {image && (
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownload}
                    className="h-9 px-5 flex items-center justify-center gap-2 bg-accent text-charcoal border-none font-bold text-sm tracking-wide rounded-full shadow-[0_4px_14px_0_rgba(255,181,157,0.39)] hover:shadow-[0_6px_20px_rgba(255,181,157,0.23)] hover:bg-[#FFC6B3] transition-all cursor-pointer"
                  >
                    <Download size={16} strokeWidth={2.5} />
                    <span className="hidden sm:inline">Export</span>
                  </motion.button>
                )}
              </div>
            </header>

            <div className="flex-1 relative flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-transparent">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="relative max-w-full max-h-full flex items-center justify-center bg-paper border-2 border-pencil-light rounded-xl p-2 md:p-3 overflow-hidden shadow-lg"
              >
                <div className="rounded-lg overflow-hidden flex items-center justify-center bg-charcoal relative w-full h-full">
                  <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'conic-gradient(#000 90deg, transparent 90deg, transparent 270deg, #000 270deg)', backgroundSize: '16px 16px', backgroundPosition: '0 0, 8px 8px' }}></div>
                  
                  {isDragging && (
                      <div className="absolute inset-0 z-50 bg-paper-light/80 backdrop-blur-sm border-2 dashed border-accent flex items-center justify-center rounded-lg">
                          <span className="text-accent font-bold tracking-widest uppercase">Drop new image</span>
                      </div>
                  )}

                  <canvas 
                    ref={canvasRef} 
                    className={cn("max-w-full max-h-[50vh] md:max-h-[75vh] object-contain block relative z-10", showOriginal ? "hidden" : "")}
                    style={{ imageRendering: 'pixelated' }}
                  />
                  {showOriginal && image && (
                    <img 
                      src={image.src} 
                      alt="Original" 
                      className="max-w-full max-h-[50vh] md:max-h-[75vh] object-contain block relative z-10" 
                    />
                  )}
                </div>
              </motion.div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // --- LANDING PAGE MODE ---
  return (
    <div className="w-full h-[100dvh] flex flex-col bg-charcoal overflow-hidden text-ink selection:bg-accent/30 selection:text-ink">
      {/* Landing Header */}
      <header className="border-b-2 border-pencil-light px-4 md:px-8 py-4 flex justify-between items-center bg-paper sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 border-2 border-accent rounded-xl flex items-center justify-center bg-accent/10 text-accent shrink-0">
               <BoxyEightLogo className="h-5" />
             </div>
             <div className="flex flex-col justify-center">
               <h1 className="text-xl font-kalam font-bold leading-none tracking-tight text-accent">Dot-8</h1>
               <span className="text-[0.6rem] font-sans font-bold text-ink-faint tracking-[0.15em] mt-1 uppercase">Pixel Studio</span>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center border-2 border-pencil-light rounded-xl overflow-hidden bg-paper">
            <button 
              onClick={() => setLandingTab('home')}
              className={cn(
                "w-12 h-10 flex items-center justify-center transition-colors border-r-2 border-pencil-light",
                landingTab === 'home' ? 'bg-accent/10 text-accent' : 'text-ink-dim hover:text-ink hover:bg-paper-light'
              )}
            >
              <Home size={18} strokeWidth={2} />
            </button>
            <button 
              onClick={() => setLandingTab('info')}
              className={cn(
                "w-12 h-10 flex items-center justify-center transition-colors",
                landingTab === 'info' ? 'bg-accent/10 text-accent' : 'text-ink-dim hover:text-ink hover:bg-paper-light'
              )}
            >
              <Info size={18} strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>
      
      {/* Scrollable Content */}
      <div className="flex-1 w-full overflow-y-auto flex flex-col relative bg-charcoal hide-scrollbar">
        <AnimatePresence mode="wait">
          {/* Render Home or Info based on tab */}
          {landingTab === 'home' && (
          <motion.section 
            key="home"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="flex grow shrink-0 justify-center py-16 md:py-24 px-4 overflow-hidden"
          >
             <div className="flex flex-col items-center justify-center text-center w-full max-w-5xl">
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="pt-2 text-ink-dim"
               >
                 <span className="font-hand text-xl opacity-80 rotate-[-2deg] inline-block scribble-underline text-accent">Upload a photo to begin</span>
               </motion.div>
               
               <motion.h2 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
                 className="text-4xl md:text-6xl font-kalam font-bold mt-8 mb-12 md:mb-16 tracking-tight leading-[1.1] text-ink max-w-[800px]"
               >
                 Turn reality into <span className="text-accent underline decoration-accent/40 decoration-dashed underline-offset-8">pixel art</span>.
               </motion.h2>
               
               {/* Drop Zone Box */}
               <motion.div 
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                 className={cn(
                   "w-full max-w-[42rem] border-2 border-pencil-light rounded-[2.5rem] p-10 md:p-16 bg-paper shadow-card flex flex-col items-center relative z-10 transition-all duration-300 overflow-hidden",
                   isDragging ? "bg-[#2A1D1A] border-accent border-dashed scale-[1.02] shadow-[0_0_50px_rgba(255,181,157,0.15)]" : "hover:border-accent/40"
                 )}
                 onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                 onDragLeave={() => setIsDragging(false)}
                 onDrop={(e) => {
                   e.preventDefault();
                   setIsDragging(false);
                   const file = e.dataTransfer.files?.[0];
                   if (file && file.type.startsWith('image/')) {
                     const reader = new FileReader();
                     reader.onload = (event) => {
                       const img = new Image();
                       img.onload = () => {
                         setImage(img);
                         setAppState('editor');
                       };
                       img.src = event.target?.result as string;
                     };
                     reader.readAsDataURL(file);
                   }
                 }}
               >
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, var(--color-ink) 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>
                  
                  <motion.div 
                    animate={isDragging ? { y: [0, -8, 0], scale: 1.05 } : {}}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className={cn(
                      "w-24 h-24 md:w-28 md:h-28 border-2 border-pencil-light rounded-[2rem] flex items-center justify-center mb-8 relative bg-paper-light text-ink transition-colors duration-300",
                      isDragging ? "border-accent text-accent bg-accent/10" : "shadow-sm"
                    )}
                  >
                    <ImageIcon size={36} className={isDragging ? "opacity-100" : "opacity-70"} strokeWidth={1.5} />
                    {isDragging && (
                       <div className="absolute inset-0 border-2 border-accent rounded-[2rem] animate-ping opacity-20"></div>
                    )}
                  </motion.div>
                  
                  <h3 className="text-2xl md:text-3xl font-kalam font-bold mb-3 md:mb-4 text-ink transition-colors">
                    {isDragging ? "Drop your photo here" : "Drag & drop an image"}
                  </h3>
                  <p className="text-ink-dim text-sm md:text-base font-sans mb-10 md:mb-12 max-w-sm text-center tracking-wide">
                    {isDragging ? "We'll begin processing instantly" : "Or select a high-quality photo from your device to begin processing"}
                  </p>
                  
                  <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
                  
                  <div className="flex flex-col sm:flex-row gap-4 mb-2 md:mb-4 w-full sm:w-auto px-4 sm:px-0 relative z-10">
                    <button 
                      onClick={() => fileInputRef.current?.click()} 
                      className="flex items-center justify-center gap-2 bg-paper-light hover:bg-[#3D2A24]/60 text-ink px-10 py-4 rounded-2xl font-medium tracking-wide transition-all border-2 border-pencil-light sm:w-auto w-full cursor-pointer hover:-translate-y-1 hover:shadow-lg"
                    >
                      <Upload size={18} strokeWidth={2.5} /> Browse Device
                    </button>
                    <button 
                      onClick={loadDemoImage} 
                      className="flex items-center justify-center gap-2 bg-accent hover:bg-[#FFC6B3] text-charcoal px-10 py-4 rounded-2xl font-bold tracking-wide transition-all sm:w-auto w-full cursor-pointer shadow-[0_4px_20px_0_rgba(255,181,157,0.3)] hover:shadow-[0_8px_30px_rgba(255,181,157,0.4)] hover:-translate-y-1"
                    >
                      <Zap size={18} strokeWidth={2.5} /> Try Demo
                    </button>
                  </div>
                </motion.div>
             </div>
          </motion.section>
          )}
  
          {/* Story Section */}
          {landingTab === 'info' && (
          <motion.section 
            key="info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 w-full max-w-5xl mx-auto pt-20 md:pt-32 pb-24 md:pb-32 px-6 flex flex-col items-center"
          >
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
             >
               <span className="font-hand text-xl text-accent scribble-underline">Features</span>
             </motion.div>
             
             <motion.h2 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="text-3xl md:text-5xl font-kalam font-bold mt-6 mb-8 md:mb-12 text-center text-ink"
             >
               Crafted for Aesthetics
             </motion.h2>
             

             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.3, staggerChildren: 0.1, duration: 0.5 }}
               className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
             >
               <FeatureCard 
                 icon={<Grid size={22} />} 
                 title="Pixel Engine" 
                 description="A fast, client-side rendering engine that instantly processes your layouts entirely offline." 
               />
               <FeatureCard 
                 icon={<Layers size={22} />} 
                 title="Dithering Styles" 
                 description="Authentic ordered bayer dithering to recreate the iconic aesthetics of early computing." 
               />
               <FeatureCard 
                 icon={<Palette size={22} />} 
                 title="Curated Palettes" 
                 description="Preset color-mappings mapped from retro hardware like the Gameboy to Vaporwave neon." 
               />
               <FeatureCard 
                 icon={<Download size={22} />} 
                 title="Easy Export" 
                 description="Download your masterpieces in ultra-crisp scalable formats without servers or compression." 
               />
             </motion.div>
          </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      className="border-2 border-pencil-light rounded-3xl p-8 bg-paper hover:bg-paper-light hover:-translate-y-1 transition-all flex flex-col items-start gap-4 cursor-default shadow-sm hover:shadow-card"
    >
      <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-sans font-medium text-ink">{title}</h3>
      <p className="text-ink-dim font-sans leading-relaxed text-sm lg:text-base">{description}</p>
    </motion.div>
  )
}
