import { Cpu } from 'lucide-react';
import { usePerformanceMode } from '../hooks/usePerformanceMode';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function ThemeSwitcher({ iconOnly = false }: { iconOnly?: boolean }) {
  const { liteMode, togglePerformanceMode } = usePerformanceMode();

  return (
    <div className="flex items-center gap-2 relative group/fx">
      {/* Lite / Full FX Performance Toggle */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => togglePerformanceMode()}
        className={cn(
          "flex items-center justify-center transition-all duration-300 hover:border-accent group shadow-sm hover:shadow-md cursor-pointer select-none",
          iconOnly ? "w-10 h-10 rounded-full border border-dashed border-accent/20 bg-paper hover:bg-accent/5 hover:scale-110" : "h-10 px-3 sm:px-4 gap-2 rounded-lg border-2 border-pencil-light/60 bg-paper",
          liteMode ? (iconOnly ? "text-accent border-accent/40 bg-accent/5" : "text-accent border-accent/40 bg-accent/5") : "text-ink-dim"
        )}
        title={liteMode ? "Switch to Full Effects Mode" : "Switch to Lite Performance Mode"}
      >
        <Cpu size={iconOnly ? 20 : 14} className={cn("transition-transform duration-500", liteMode ? "text-accent rotate-180" : "text-ink-faint", iconOnly && "group-hover/fx:rotate-12")} />
        {!iconOnly && <span className="font-hand text-[0.85rem] font-bold tracking-wider">{liteMode ? "Lite FX" : "Full FX"}</span>}
      </motion.button>
      
      {/* Tooltip for iconOnly mode */}
      {iconOnly && (
        <span 
          className={cn(
            "absolute left-12 py-1 px-3 bg-paper border border-pencil-light/20 text-ink shadow-md",
            "text-[0.85rem] font-caveat tracking-wide whitespace-nowrap font-medium z-50",
            "opacity-0 -translate-x-2 group-hover/fx:opacity-100 group-hover/fx:translate-x-0 transition-all duration-300 pointer-events-none"
          )}
        >
          {liteMode ? "Switch to Full FX" : "Switch to Lite FX"}
        </span>
      )}
    </div>
  );
}
