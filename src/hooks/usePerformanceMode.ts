import { useState, useEffect } from 'react';

function getInitialPerfMode(): boolean {
  try {
    const saved = localStorage.getItem('app-perf-lite');
    if (saved !== null) {
      return saved === 'true';
    }

    // Proactive hardware & mobile profiling for smooth 60fps UX
    const isLowMemory = 'deviceMemory' in navigator && (navigator as any).deviceMemory < 4;
    const isLowCpu = 'hardwareConcurrency' in navigator && (navigator as any).hardwareConcurrency <= 4;
    
    // Quick mobile user-agent inspection
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Default to lite mode if device is resource-constrained or mobile to prevent laggy interactions
    const defaultToLite = isLowMemory || isLowCpu || isMobileDevice || prefersReducedMotion;
    
    localStorage.setItem('app-perf-lite', String(defaultToLite));
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
      localStorage.setItem('app-perf-lite', String(liteMode));
    } catch (e) {
      // Ignore storage errors silently
    }
  }, [liteMode]);

  const togglePerformanceMode = () => {
    setLiteMode(prev => !prev);
  };

  return { liteMode, setLiteMode, togglePerformanceMode };
}
