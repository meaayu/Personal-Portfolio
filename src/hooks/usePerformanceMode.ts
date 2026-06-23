import { useState, useEffect } from 'react';

function getInitialPerfMode(): boolean {
  try {
    const saved = localStorage.getItem('app-perf-lite-v2');
    if (saved !== null) {
      return saved === 'true';
    }

    // Check for prefers-reduced-motion as a strict request to reduce motion
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Default to full, elegant animation by default so mobile users get the complete experience
    const defaultToLite = prefersReducedMotion;
    
    localStorage.setItem('app-perf-lite-v2', String(defaultToLite));
    return defaultToLite;
  } catch (e) {
    return false;
  }
}

export function usePerformanceMode() {
  const [liteMode, setLiteMode] = useState<boolean>(getInitialPerfMode());

  useEffect(() => {
    if (liteMode) {
      document.body.classList.add('perf-lite');
    } else {
      document.body.classList.remove('perf-lite');
    }
    
    try {
      localStorage.setItem('app-perf-lite-v2', String(liteMode));
    } catch (e) {
      // Ignore storage errors silently
    }
  }, [liteMode]);

  const togglePerformanceMode = () => {
    setLiteMode(prev => !prev);
  };

  return { liteMode, setLiteMode, togglePerformanceMode };
}
