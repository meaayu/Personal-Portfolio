import { useState } from 'react';
import { MotionConfig, AnimatePresence } from 'motion/react';
import Loader from './components/Loader';
import Header from './components/Header';
import Hero from './components/Hero';
import Footer from './components/Footer';
import SVGFilters from './components/SVGFilters';
import FloatingControls from './components/FloatingControls';
import Skills from './components/Skills';
import Projects from './components/Projects';
import About from './components/About';
import Contact from './components/Contact';
import SocialSidebar from './components/SocialSidebar';
import ProjectModal from './components/ProjectModal';
import { PROJECTS } from './constants';
import { ProjectData } from './types';
import { useLockBodyScroll } from './hooks/useLockBodyScroll';
import { usePerformanceMode } from './hooks/usePerformanceMode';

export default function App() {
  const [activeProject, setActiveProject] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024; // Less than 1024px spans mobile and tablet
    }
    return false;
  });
  const { liteMode } = usePerformanceMode();

  useLockBodyScroll(!!activeProject || isLoading);

  const handleOpenProject = (id: string) => {
    const project = PROJECTS.find(p => p.id === id) || null;
    setActiveProject(project);
  };

  const handleCloseProject = () => {
    setActiveProject(null);
  };

  const handleNavigateProject = (dir: number) => {
    if (!activeProject) return;
    const currentIdx = PROJECTS.findIndex(p => p.id === activeProject.id);
    const nextIdx = currentIdx + dir;
    if (nextIdx >= 0 && nextIdx < PROJECTS.length) {
      setActiveProject(PROJECTS[nextIdx]);
    }
  };

  return (
    <MotionConfig reducedMotion={liteMode ? "always" : "user"}>
      <AnimatePresence mode="wait">
        {isLoading && <Loader onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      <div className="relative min-h-screen selection:bg-accent/30 selection:text-ink">
        <SVGFilters />
        <Header />
        
        <main className="gpu">
          <Hero isLoading={isLoading} />
          
          <Skills />
  
          <Projects onOpenProject={handleOpenProject} />
  
          <About />
  
          <Contact />
        </main>
  
        <Footer />
        <FloatingControls />
        
        <SocialSidebar />
        <ProjectModal
          project={activeProject}
          onClose={handleCloseProject}
          onNavigate={handleNavigateProject}
          projectIndex={activeProject ? PROJECTS.findIndex(p => p.id === activeProject.id) : -1}
          totalProjects={PROJECTS.length}
        />
      </div>
    </MotionConfig>
  );
}
