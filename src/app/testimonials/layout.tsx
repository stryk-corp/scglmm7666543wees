import type {Metadata} from 'next';
import {createPageMetadata} from '@/lib/seo';

export const metadata: Metadata = createPageMetadata(
  'Student Testimonials',
  'Read feedback from students using Scholarverse to prepare SIWES reports and academic documents.',
  '/testimonials',
);

export default function TestimonialsLayout({children}: Readonly<{children: React.ReactNode}>) {
  return children;
}