import type {Metadata} from 'next';
import {createPageMetadata} from '@/lib/seo';

export const metadata: Metadata = createPageMetadata(
  'How to Use Scholarverse',
  'Follow the step-by-step guide to enter report details, generate content, review the document, and export your academic report.',
  '/how-to-use',
);

export default function HowToUseLayout({children}: Readonly<{children: React.ReactNode}>) {
  return children;
}