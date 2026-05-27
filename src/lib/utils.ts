import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function smoothScrollTo(id: string) {
  const targetId = id.startsWith('#') ? id : `#${id}`;
  const el = document.querySelector(targetId);
  if (!el) return;

  const nav = document.getElementById('mainNav');
  const navH = nav ? nav.offsetHeight : 0;
  // Account for the fixed header margin and gap
  const offset = navH + 24;

  const elementPosition = (el as HTMLElement).offsetTop;
  const offsetPosition = elementPosition - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'auto'
  });
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastCallTime = 0;

  return function(this: any, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = limit - (now - lastCallTime);

    if (remaining <= 0 || remaining > limit) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCallTime = now;
      func.apply(this, args);
    } else {
      lastArgs = args;
      if (!timeoutId) {
        timeoutId = setTimeout(() => {
          lastCallTime = Date.now();
          timeoutId = null;
          if (lastArgs) {
            func.apply(this, lastArgs);
            lastArgs = null;
          }
        }, remaining);
      }
    }
  };
}
