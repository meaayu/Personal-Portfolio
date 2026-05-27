import { useLayoutEffect } from 'react';

export function useLockBodyScroll(lock: boolean) {
  useLayoutEffect(() => {
    if (!lock) return;

    // Get original body overflow
    const originalStyle = window.getComputedStyle(document.body).overflow;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Prevent scrolling on mount
    document.body.style.overflow = 'hidden';
    
    // Compensate for scrollbar width to prevent jumping
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // Re-enable scrolling on unmount
    return () => {
      document.body.style.overflow = originalStyle;
      document.body.style.paddingRight = '0px';
    };
  }, [lock]);
}
