import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Portfolio from './Portfolio';

const Dot8 = React.lazy(() => import('./dot-8/Dot8'));
const AsciiGen = React.lazy(() => import('./ascii-gen/AsciiGen'));
const Wallpapers = React.lazy(() => import('./wallpapers/Wallpapers'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-[color:var(--color-charcoal)]">
          <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<Portfolio />} />
          <Route path="/dot-8" element={<Dot8 />} />
          <Route path="/ascii-gen" element={<AsciiGen />} />
          <Route path="/wallpapers" element={<Wallpapers />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
