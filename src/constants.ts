import { ProjectData } from './types';
import portfolioImg from './wallpapers/assets/assets/project/portfolio.png';
import dot8Img from './wallpapers/assets/assets/project/Dot-8.png';
import practice1 from './wallpapers/assets/assets/project/practice1.jpg';
import practice2 from './wallpapers/assets/assets/project/practice2.jpg';
import practice3 from './wallpapers/assets/assets/project/practice3.jpg';
import practice4 from './wallpapers/assets/assets/project/practice4.jpg';

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
    link: '/dot-8',
    linkText: 'CONVERT NOW ↗',
    views: 2154,
    items: [
      { title: 'Pixel Engine', body: 'Custom algorithms downsample images while preserving core color palettes and detail.' },
      { title: 'Optimized Flow', body: 'Built for speed, allowing users to transform their desktop aesthetic in seconds.' },
    ],
    footerNote: '✦ Live production tool',
    footerLink: '/dot-8',
  },
  {
    id: '5',
    category: 'Web Dev',
    title: 'ASCII-Gen',
    panelType: 'ASCII Utility',
    desc: 'An image filter tool that converts your photos into stylized ASCII art.',
    tags: ['React', 'Canvas API'],
    images: ['/ascii-gen.png'],
    link: '/ascii-gen',
    linkText: 'INITIALIZE ENGINE ↗',
    views: 890,
    items: [
      { title: 'Character Density', body: 'Tune the resolution and character density mapped to pixel luminance.' },
      { title: 'Terminal Themes', body: 'Switch between curated authentic retro hardware color palettes.' },
    ],
    footerNote: '✦ Offline real-time processing',
    footerLink: '/ascii-gen',
  },
  {
    id: '6',
    category: 'Web Dev',
    title: 'Aesthetic Wallpapers',
    panelType: 'Web Utility',
    desc: 'An aesthetically curated gallery of high-resolution digital wallpapers.',
    tags: ['React', 'Gallery', 'Curation'],
    images: [],
    link: '/wallpapers',
    linkText: 'VIEW GALLERY ↗',
    views: 420,
    items: [
      { title: 'Visual Curation', body: 'A hand-picked selection of visually striking digital environments.' },
      { title: 'Smooth Interaction', body: 'Features horizontal drag-scrolling and immersive lightbox overlays.' },
    ],
    footerNote: '✦ Regularly updated collection',
    footerLink: '/wallpapers',
  },
];

