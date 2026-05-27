import { ProjectData } from './types';
import portfolioImg from './assets/project/portfolio.png';
import dot8Img from './assets/project/Dot-8.png';
import artslabImg from './assets/project/artslab.png';
import practice1 from './assets/project/practice1.jpg';
import practice2 from './assets/project/practice2.jpg';
import practice3 from './assets/project/practice3.jpg';
import practice4 from './assets/project/practice4.jpg';

export const PROJECTS: ProjectData[] = [
  {
    id: '1',
    category: 'Web Dev',
    title: 'Portfolio Site',
    panelType: 'Web Project',
    desc: 'A hand-crafted web experience merging aesthetics with smooth interactions.',
    tags: ['Web Dev', 'HTML/CSS/JS'],
    images: [
      portfolioImg
    ],
    featured: true,
    views: 1242,
    items: [
      { title: 'The Blueprint', body: 'This site is designed as a digital sketchbook—a tactile, breathing space where code meets hand-drawn textures.' },
      { title: 'Interaction Design', body: 'Features custom-built physics-based transitions and motion signatures that mimic the organic flow of ink on paper.' },
      { title: 'Technical Nuance', body: 'Utilizes sophisticated CSS layouts and motion/react for a high-performance experience that remains visually rich.' },
    ],
    footerNote: '✦ Continuously evolving digital garden'
  },
  {
    id: '2',
    category: 'Animation',
    title: 'Hand Drawn Animation',
    youtube: 'JgvbpIypir4',
    panelType: 'Animation',
    desc: 'Frame-by-frame character animation—pencil-drawn and digitally warmed.',
    tags: ['Animation', '2D', 'Tahoma2D', 'Frame-by-frame'],
    images: [],
    featured: true,
    views: 856,
    items: [
      { title: 'The Process', body: 'Roughly 12 hand-drawn frames per second.' },
      { title: 'Tools & Workflow', body: 'Traditional  workflow combined with Tahoma2D.' },
    ],
    footerNote: '✦ Personal animation study',
    footerLink: 'https://www.youtube.com/watch?v=JgvbpIypir4',
    footerLinkText: 'Watch on YouTube ↗'
  },
  {
    id: '3',
    category: 'Illustration',
    title: 'Art Showcase',
    panelType: 'Illustration Series',
    desc: 'Digital and traditional art studies showcase.',
    tags: ['Illustration', 'Krita', 'Digital Painting'],
    images: [
      practice1,
      practice2,
      practice3,
      practice4
    ],
    views: 1105,
    footerNote: '✦ Personal studies, not client work',
    footerLink: 'https://instagram.com/m__aayu__',
  },
  {
    id: '4',
    category: 'Web Dev',
    title: 'Dot-8',
    panelType: 'Web Utility',
    desc: 'A tool that turns standard wallpapers into stylized pixel art masterpieces.',
    tags: ['React', 'Image API', 'Vercel'],
    images: [
      dot8Img
    ],
    link: 'https://dot-8.netlify.app/',
    linkText: 'CONVERT NOW ↗',
    views: 2154,
    items: [
      { title: 'Pixel Engine', body: 'Custom algorithms downsample images while preserving core color palettes and detail.' },
      { title: 'Optimized Flow', body: 'Built for speed, allowing users to transform their desktop aesthetic in seconds.' },
    ],
    footerNote: '✦ Live production tool',
    footerLink: 'https://dot-8.netlify.app/',
  },
  {
    id: '5',
    category: 'Web Dev',
    title: 'Arts Lab',
    panelType: 'Learning Platform',
    desc: 'A resource for artists to master structure, anatomy, and spatial perspective.',
    tags: ['Learning', 'Art Theory', 'Interactive'],
    images: [
      artslabImg
    ],
    link: 'https://arts-lab.netlify.app/',
    linkText: 'START LEARNING ↗',
    views: 942,
    items: [
      { title: 'Structural Mastery', body: 'Break down complex forms into basic 3D shapes for better volume understanding.' },
      { title: 'Dynamic Anatomy', body: 'Modules for head anatomy and gestural construction for believable characters.' },
    ],
    footerNote: '✦ Educational tool for artists',
    footerLink: 'https://arts-lab.netlify.app/',
  },
];

