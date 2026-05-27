export interface ProjectItem {
  title: string;
  body: string;
}

export interface ArtMeta {
  medium: string;
  year: string;
  style: string;
  tools: string;
}

export interface ProjectData {
  id: string;
  title: string;
  panelType?: string;
  category: 'Web Dev' | 'Animation' | 'Illustration' | 'Graphic Design';
  desc: string;
  tags: string[];
  link?: string;
  linkText?: string;
  youtube?: string;
  images?: string[];
  artMeta?: ArtMeta;
  process?: string[];
  footerNote?: string;
  footerLink?: string;
  footerLinkText?: string;
  featured?: boolean;
  thumbnail?: string;
  views?: number;
  items?: ProjectItem[];
}
