import type {Metadata} from 'next';
import {createPageMetadata} from '@/lib/seo';

export const metadata: Metadata = createPageMetadata(
  'About',
  'Learn how Scholarverse helps Nigerian students prepare professional SIWES reports, academic term papers, and essays.',
  '/about',
);

export default function AboutLayout({children}: Readonly<{children: React.ReactNode}>) {
  return children;
}