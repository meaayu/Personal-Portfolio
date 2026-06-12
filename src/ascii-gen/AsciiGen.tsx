import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Monitor, Image as ImageIcon, SlidersHorizontal, EyeOff, Eye, Upload } from 'lucide-react';
import { cn } from '../lib/utils';

const densityStrings = {
  high: "Ñ@#W$9876543210?!abc;:+=-,._ ",
  medium: "@%#*+=-:. ",
  low: "@#*+=-. ",
};

const THEMES = [
  { id: 'matrix', name: 'Terminal Green', bg: 'bg-[#050A05]', text: 'text-[#39FF14]', border: 'border-[#39FF14]/40', accent: 'bg-[#39FF14]/20', glow: 'drop-shadow-[0_0_12px_rgba(57,255,20,0.6)]' },
  { id: 'amber', name: 'Legacy Amber', bg: 'bg-[#1A0F00]', text: 'text-[#FFB000]', border: 'border-[#FFB000]/40', accent: 'bg-[#FFB000]/20', glow: 'drop-shadow-[0_0_12px_rgba(255,176,0,0.6)]' },
  { id: 'neon', name: 'Neon Pink', bg: 'bg-[#0D0014]', text: 'text-[#FF00FF]', border: 'border-[#FF00FF]/40', accent: 'bg-[#FF00FF]/20', glow: 'drop-shadow-[0_0_12px_rgba(255,0,255,0.6)]' },
  { id: 'ice', name: 'Cobalt Ice', bg: 'bg-[#000814]', text: 'text-[#00FFFF]', border: 'border-[#00FFFF]/40', accent: 'bg-[#00FFFF]/20', glow: 'drop-shadow-[0_0_12px_rgba(0,255,255,0.6)]' },
  { id: 'monochrome', name: 'Monochrome', bg: 'bg-[#0A0A0A]', text: 'text-gray-200', border: 'border-gray-500/40', accent: 'bg-gray-200/20', glow: 'drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' },
];

export default function AsciiGen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [asciiArt, setAsciiArt] = useState<string>('');
  const [resolution, setResolution] = useState(80); // chars per row
  const [density, setDensity] = useState<'high' | 'medium' | 'low'>('high');
  const [theme, setTheme] = useState(THEMES[4]); // Default to Monochrome
  const [invert, setInvert] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
    if (e.target) {
        e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
       processFile(file);
    }
  };

  const processImage = useCallback(() => {
    if (!image || !canvasRef.current) {
      setAsciiArt('');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Set canvas size based on resolution keeping aspect ratio
    const ratio = image.height / image.width;
    canvas.width = resolution;
    canvas.height = Math.floor(resolution * ratio * 0.5); // 0.5 because chars are roughly twice as tall as they are wide

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let asciiStr = '';
    const dStr = densityStrings[density];
    const len = dStr.length;

    for (let i = 0; i < canvas.height; i++) {
        for (let j = 0; j < canvas.width; j++) {
            const index = (i * canvas.width + j) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            
            // Standard luminance calculation
            let brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            
            if (invert) {
                brightness = 1 - brightness;
            }

            const charIndex = Math.floor(brightness * (len - 1));
            asciiStr += dStr[charIndex];
        }
        asciiStr += '\n';
    }

    setAsciiArt(asciiStr);
  }, [image, resolution, density, invert]);

  useEffect(() => {
    processImage();
  }, [processImage]);

  return (
    <div className={cn("w-full min-h-[100dvh] flex flex-col font-mono selection:bg-white/30 transition-colors duration-500 relative", theme.bg, theme.text)}>
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>

      <header className={cn("h-16 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 z-20 border-b relative backdrop-blur-sm", theme.border)}>
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className={cn("w-10 h-10 flex items-center justify-center border transition-all hover:bg-white/10 rounded-md backdrop-blur-md", theme.border, theme.text, theme.glow)}
          >
            <ArrowLeft size={18} />
          </Link>
          <div className={cn("flex flex-col justify-center", theme.glow)}>
            <h1 className="text-lg font-bold tracking-widest uppercase">ASCII-Gen</h1>
            <span className="text-[10px] opacity-70 tracking-[0.2em] uppercase">Engine v2.0</span>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row flex-1 p-4 gap-4 overflow-hidden relative z-10 max-w-7xl mx-auto w-full">
        
        {/* Controls */}
        <aside className={cn("w-full md:w-[22rem] flex-shrink-0 border p-5 flex flex-col gap-6 overflow-y-auto rounded-lg backdrop-blur-md bg-black/20", theme.border, theme.glow)}>
          <div className="flex items-center gap-2 border-b pb-4 border-inherit opacity-90">
             <SlidersHorizontal size={18} />
             <h2 className="text-sm font-bold uppercase tracking-widest">Parameters</h2>
          </div>

          <div className="flex flex-col gap-2">
             <label className="text-xs font-bold uppercase tracking-widest opacity-80 flex justify-between">
                <span>Input Source</span>
             </label>
             <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
             <button 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                    "w-full py-4 border font-bold uppercase tracking-widest transition-all text-xs flex items-center justify-center gap-2 rounded-md",
                    theme.border,
                    "hover:bg-white/10 active:scale-[0.98]"
                )}
             >
                <Upload size={14} /> Upload Image
             </button>
             {image && (
                 <button 
                    onClick={() => setImage(null)}
                    className={cn(
                        "w-full py-2.5 border font-bold uppercase tracking-widest transition-all text-[10px] rounded-md",
                        theme.border,
                        "bg-red-500/10 text-red-400 border-red-500/50 hover:bg-red-500/20 mt-1 active:scale-[0.98]"
                    )}
                 >
                    Clear Image
                 </button>
             )}
          </div>

          <div className="flex flex-col gap-2">
             <label className="text-xs font-bold uppercase tracking-widest opacity-80 flex justify-between">
                <span>Resolution</span>
                <span>{resolution}px</span>
             </label>
             <input 
               type="range" min="40" max="150" value={resolution} 
               onChange={e => setResolution(parseInt(e.target.value))}
               className={cn("w-full appearance-none h-1 bg-white/20 outline-none", "accent-current")}
             />
          </div>

          <div className="flex flex-col gap-2">
             <label className="text-xs font-bold uppercase tracking-widest opacity-80 flex justify-between">
                <span>Density Filter</span>
             </label>
             <div className="grid grid-cols-3 gap-2">
                {(['high', 'medium', 'low'] as const).map(d => (
                   <button 
                     key={d} 
                     onClick={() => setDensity(d)}
                     className={cn(
                        "py-3 border text-[10px] uppercase font-bold rounded-md transition-all active:scale-[0.98]", 
                        theme.border,
                        density === d ? cn(theme.accent, "text-black drop-shadow-none") : "hover:bg-white/10"
                     )}
                   >
                     {d}
                   </button>
                ))}
             </div>
          </div>

          <div className="flex flex-col gap-2">
             <label className="text-xs font-bold uppercase tracking-widest opacity-80 flex justify-between">
                <span>Polarity</span>
             </label>
             <button 
                onClick={() => setInvert(!invert)}
                className={cn(
                    "w-full py-3 border font-bold uppercase tracking-widest text-[10px] transition-all rounded-md active:scale-[0.98]",
                    theme.border,
                    invert ? cn(theme.accent, "text-black drop-shadow-none") : "hover:bg-white/10"
                )}
             >
                {invert ? 'Inverted' : 'Standard'}
             </button>
          </div>

          <div className="flex flex-col gap-2">
             <label className="text-xs font-bold uppercase tracking-widest opacity-80 flex justify-between">
                <span>Visual Theme</span>
             </label>
             <div className="grid grid-cols-1 gap-2">
                {THEMES.map(t => (
                   <button 
                     key={t.id} 
                     onClick={() => setTheme(t)}
                     className={cn(
                        "py-3 border text-[10px] uppercase font-bold text-left px-4 transition-all rounded-md flex items-center gap-3 active:scale-[0.98]", 
                        theme.border,
                        theme.id === t.id ? cn(theme.accent, "text-black drop-shadow-none") : "hover:bg-white/10"
                     )}
                   >
                     <span className={cn("w-2 h-2 rounded-full", t.id === t.id ? "bg-current" : t.text.replace('text-', 'bg-'))} />
                     {t.name}
                   </button>
                ))}
             </div>
          </div>
        </aside>

        {/* Display */}
        <main className={cn("flex-1 border relative overflow-hidden flex flex-col rounded-lg bg-black/40 backdrop-blur-sm", theme.border, theme.glow)}>
           <div className={cn("h-12 border-b flex items-center justify-between px-5 bg-white/5", theme.border)}>
              <span className="text-[10px] uppercase tracking-widest opacity-80 flex items-center gap-2">
                  <Monitor size={14} /> Output Viewer
              </span>
              <button 
                 onClick={() => setShowOriginal(!showOriginal)}
                 className="text-[10px] uppercase font-bold tracking-widest opacity-60 hover:opacity-100 flex items-center gap-2 transition-opacity"
              >
                  {showOriginal ? <EyeOff size={14} /> : <Eye size={14} />}
                  {showOriginal ? 'Hide Match' : 'Show Match'}
              </button>
           </div>
           
           <div 
               className={cn(
                   "flex-1 relative flex items-center justify-center overflow-hidden bg-black p-4 transition-all duration-300",
                   isDragging ? "ring-2 ring-inset ring-opacity-50 " + theme.border.replace('border-', 'ring-') : ""
               )}
               onDragOver={handleDragOver}
               onDragLeave={handleDragLeave}
               onDrop={handleDrop}
           >
               
               {/* Hidden assets used for processing */}
               <canvas ref={canvasRef} className="hidden" />

               {!image && !asciiArt && (
                   <div className={cn("flex flex-col items-center gap-5 opacity-40 animate-pulse transition-transform duration-300", isDragging ? "scale-110 opacity-70" : "", theme.text)}>
                       <ImageIcon size={56} strokeWidth={1} />
                       <span className="uppercase tracking-[0.3em] text-sm text-center whitespace-pre-line leading-relaxed">
                           {isDragging ? 'Drop Image Here' : 'Drag & Drop Image\nOr Click Upload'}
                       </span>
                   </div>
               )}

               {image && asciiArt && showOriginal && (
                   <div className={cn("absolute bottom-6 right-6 w-56 border z-20 bg-black rounded-md overflow-hidden shadow-2xl", theme.border)}>
                      <div className={cn("h-6 border-b flex items-center px-2 bg-white/10", theme.border)}>
                         <span className="text-[8px] uppercase tracking-widest opacity-70">Source Image</span>
                      </div>
                      <img src={image.src} alt="Original" className="w-full h-auto block opacity-80" />
                   </div>
               )}

               {asciiArt && (
                   <div className="w-full h-full overflow-hidden flex items-center justify-center p-2">
                      <pre 
                         className={cn("font-mono whitespace-pre text-center", theme.glow)}
                         style={{ 
                             fontSize: 'min(1.6vw, 2.2vh)', 
                             lineHeight: '1', 
                             letterSpacing: '0.12em'
                         }}
                      >
                         {asciiArt}
                      </pre>
                   </div>
               )}
           </div>
        </main>
      </div>
    </div>
  );
}
