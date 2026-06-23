import React, { useState, Suspense, lazy, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import SectionDivider from './components/SectionDivider';
import Footer from './components/Footer';
import Contact from './components/Contact';
import SocialSidebar from './components/SocialSidebar';
import { PROJECTS as ALL_PROJECTS } from './constants';
import { ProjectData } from './types';
import { useLockBodyScroll } from './hooks/useLockBodyScroll';
import ProjectModal from './components/ProjectModal';
import './index.css';

const Skills = lazy(() => import('./components/Skills'));
const Projects = lazy(() => import('./components/Projects'));
const About = lazy(() => import('./components/About'));

export interface AppSettings {
  chatBotEnabled: boolean;
  performanceModeDefault: boolean;
  maintenanceMode: boolean;
  liveStatus: string;
  accentColor: string;
  avatarUrl: string;
  hiddenProjects: string[];
}

export default function Portfolio() {
  const [activeProject, setActiveProject] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [appSettings] = useState<AppSettings>({
    chatBotEnabled: false,
    performanceModeDefault: false,
    maintenanceMode: false,
    liveStatus: "",
    accentColor: "#D0BCFF",
    avatarUrl: "",
    hiddenProjects: []
  });

  useLockBodyScroll(isLoading && !appSettings?.maintenanceMode);

  const visibleProjects = ALL_PROJECTS.filter(p => !appSettings?.hiddenProjects.includes(p.id));

  if (appSettings?.maintenanceMode) {
    return (
      <div className="min-h-screen bg-charcoal text-ink flex flex-col items-center justify-center p-4">
        <style>{`:root { --color-accent: ${appSettings?.accentColor || '#D0BCFF'}; }`}</style>
        <div className="max-w-md text-center space-y-6">
          <div className="w-24 h-24 mx-auto border-2 border-dashed border-accent/50 rounded-full flex items-center justify-center bg-accent/5">
            <span className="text-4xl">🚧</span>
          </div>
          <h1 className="text-4xl font-hand font-bold text-accent">Under Construction</h1>
          <p className="text-ink-dim">
            I'm currently making some deep updates to the portfolio. 
            Please check back later!
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative min-h-screen text-ink selection:bg-accent/30 selection:text-ink">
        <Header />
        
        <SocialSidebar />
        
        <main className="gpu">
          <Hero isLoading={isLoading} liveStatus={appSettings?.liveStatus} avatarUrl={appSettings?.avatarUrl} />
          <SectionDivider type="wave" />
          
          <Suspense fallback={<div className="h-[50vh] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" /></div>}>
            <Projects 
              projects={visibleProjects}
              onOpenProject={(id) => {
                const p = visibleProjects.find(proj => proj.id === id);
                if (p) setActiveProject(p);
              }} 
            />
            <SectionDivider type="wave" className="rotate-180" />
            
            <Skills />
            <SectionDivider type="wave" />
            
            <About />
            <SectionDivider type="wave" className="rotate-180" />
            
            <Contact />
          </Suspense>
        </main>
        
        <Footer />
      </div>

      <ProjectModal 
        project={activeProject} 
        onClose={() => setActiveProject(null)} 
        projectIndex={visibleProjects.findIndex(p => p.id === activeProject?.id)}
        totalProjects={visibleProjects.length}
        onNavigate={(dir) => {
          const idx = visibleProjects.findIndex(p => p.id === activeProject?.id);
          if (idx === -1) return;
          const nextIdx = (idx + dir + visibleProjects.length) % visibleProjects.length;
          setActiveProject(visibleProjects[nextIdx]);
        }}
      />
    </>
  );
}
